"""
Document Generation Service

This module handles generation of PDF documents (invoices, packing lists, etc.)
for LCL shipments.
"""

import logging
from decimal import Decimal
from typing import Dict, List, Optional
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import io
import os

from .models import LCLShipment, Price, PackagingPrice, SyrianProvincePrice

logger = logging.getLogger(__name__)


def calculate_invoice_totals(shipment: LCLShipment) -> Dict:
    """
    Calculate all pricing totals for invoice generation.
    Recalculates from parcels to ensure accuracy.
    
    Returns:
        Dict with all pricing information:
        {
            'base_lcl_price': float,
            'packaging_cost': float,
            'insurance_cost': float,
            'eu_shipping_cost': float,
            'syria_transport_cost': float,
            'total_price': float,
            'parcel_calculations': List[Dict],
            'packaging_calculations': List[Dict],
            'declared_shipment_value': float,
        }
    """
    try:
        parcels_data = shipment.parcels if shipment.parcels else []
        
        total_price_by_weight = 0
        total_price_by_cbm = 0
        total_packaging_cost = 0
        calculations = []
        packaging_calculations = []
        total_declared_value = 0
        
        # Calculate pricing for each parcel
        for parcel_data in parcels_data:
            product_id = parcel_data.get("productCategory")
            packaging_id = parcel_data.get("packagingType")
            weight = float(parcel_data.get("weight", 0))
            cbm = float(parcel_data.get("cbm", 0))
            repeat_count = int(parcel_data.get("repeatCount", 1))
            
            # Collect declared value for insurance
            if parcel_data.get("wantsInsurance") or parcel_data.get("isElectronicsShipment"):
                declared_value = float(parcel_data.get("declaredShipmentValue", 0) or 0)
                total_declared_value += declared_value
            
            # Calculate packaging cost
            if packaging_id:
                try:
                    packaging = PackagingPrice.objects.get(id=int(packaging_id))
                    packaging_cost = float(packaging.price) * repeat_count
                    total_packaging_cost += packaging_cost
                    
                    packaging_calculations.append({
                        "packaging_id": packaging_id,
                        "packaging_name_ar": packaging.ar_option,
                        "packaging_name_en": packaging.en_option,
                        "dimension": packaging.dimension,
                        "price_per_unit": float(packaging.price),
                        "repeat_count": repeat_count,
                        "total_cost": round(packaging_cost, 2),
                    })
                except PackagingPrice.DoesNotExist:
                    logger.warning(f"PackagingPrice with id {packaging_id} not found")
                except (ValueError, TypeError) as e:
                    logger.warning(f"Invalid packaging data: {str(e)}")
            
            # Calculate product pricing
            if product_id:
                try:
                    price = Price.objects.get(id=int(product_id))
                    
                    if price.minimum_shipping_unit == "per_piece":
                        # Electronics: keep original calculation
                        parcel_weight = weight * repeat_count
                        parcel_cbm = cbm * repeat_count
                        price_by_weight = parcel_weight * float(price.price_per_kg)
                        price_by_cbm = parcel_cbm * float(price.price_per_kg)
                        total_price_by_weight += price_by_weight
                        total_price_by_cbm += price_by_cbm
                        
                        calculations.append({
                            "product_id": product_id,
                            "product_name_ar": price.ar_item,
                            "product_name_en": price.en_item,
                            "weight": parcel_weight,
                            "cbm": parcel_cbm,
                            "price_per_kg": float(price.price_per_kg),
                            "price_by_weight": round(price_by_weight, 2),
                            "price_by_cbm": round(price_by_cbm, 2),
                            "is_electronics": True,
                            "hs_code": parcel_data.get("hs_code"),
                            "shipment_type": parcel_data.get("shipmentType"),
                            "repeat_count": repeat_count,
                        })
                    else:
                        # Regular products: new calculation with volumetric weight
                        length = float(parcel_data.get("length", 0))
                        width = float(parcel_data.get("width", 0))
                        height = float(parcel_data.get("height", 0))
                        
                        # Calculate volumetric weight: (L × W × H) / 6,000
                        volumetric_weight = (length * width * height) / 6000
                        
                        # Chargeable weight = max(actual_weight, volumetric_weight)
                        chargeable_weight = max(weight, volumetric_weight)
                        
                        # Account for repeat count
                        parcel_chargeable_weight = chargeable_weight * repeat_count
                        
                        # Price = chargeable_weight × price_per_kg
                        parcel_price = parcel_chargeable_weight * float(price.price_per_kg)
                        
                        total_price_by_weight += parcel_price
                        total_price_by_cbm += parcel_price
                        
                        calculations.append({
                            "product_id": product_id,
                            "product_name_ar": price.ar_item,
                            "product_name_en": price.en_item,
                            "weight": weight,
                            "length": length,
                            "width": width,
                            "height": height,
                            "cbm": cbm,
                            "volumetric_weight": round(volumetric_weight, 3),
                            "chargeable_weight": round(chargeable_weight, 3),
                            "parcel_chargeable_weight": round(parcel_chargeable_weight, 3),
                            "price_per_kg": float(price.price_per_kg),
                            "price_by_weight": round(parcel_price, 2),
                            "price_by_cbm": round(parcel_price, 2),
                            "is_electronics": False,
                            "hs_code": parcel_data.get("hs_code"),
                            "shipment_type": parcel_data.get("shipmentType"),
                            "repeat_count": repeat_count,
                        })
                except Price.DoesNotExist:
                    logger.warning(f"Price with id {product_id} not found")
                except (ValueError, TypeError) as e:
                    logger.warning(f"Invalid data for parcel: {str(e)}")
        
        # Calculate Base LCL Price: max(priceByWeight, priceByCBM, 75)
        base_lcl_price = max(total_price_by_weight, total_price_by_cbm, 75)
        
        # Calculate insurance if declared value exists
        insurance_cost = 0
        if total_declared_value > 0:
            # Insurance: (Base LCL Price + declared value) * 1.5%
            insurance_cost = (base_lcl_price + total_declared_value) * 0.015
        
        # Calculate EU Shipping (if exists)
        eu_shipping_cost = 0
        if shipment.selected_eu_shipping_method and shipment.eu_pickup_weight and shipment.eu_pickup_weight > 0:
            # EU shipping is already included in total_price, but we need to extract it
            # For now, we'll calculate it separately if needed
            # This will be handled in the template based on selected_eu_shipping_name
            pass
        
        # Calculate Syria Transport (if exists)
        syria_transport_cost = 0
        if shipment.syria_province and shipment.syria_weight and shipment.syria_weight > 0:
            try:
                province = SyrianProvincePrice.objects.get(
                    province_code=shipment.syria_province.upper(),
                    is_active=True
                )
                syria_transport_cost = province.calculate_price(float(shipment.syria_weight))
            except SyrianProvincePrice.DoesNotExist:
                logger.warning(f"SyrianProvincePrice for {shipment.syria_province} not found")
        
        # Total price calculation
        calculation_total = base_lcl_price + total_packaging_cost
        total_price = calculation_total + insurance_cost
        
        return {
            'base_lcl_price': round(base_lcl_price, 2),
            'packaging_cost': round(total_packaging_cost, 2),
            'insurance_cost': round(insurance_cost, 2),
            'eu_shipping_cost': round(eu_shipping_cost, 2),
            'syria_transport_cost': round(syria_transport_cost, 2),
            'total_price': round(total_price, 2),
            'parcel_calculations': calculations,
            'packaging_calculations': packaging_calculations,
            'declared_shipment_value': round(total_declared_value, 2),
            'total_price_by_weight': round(total_price_by_weight, 2),
            'total_price_by_cbm': round(total_price_by_cbm, 2),
        }
    except Exception as e:
        logger.error(f"Error calculating invoice totals: {str(e)}", exc_info=True)
        raise


def get_company_info() -> Dict:
    """Get company information for invoice"""
    return {
        'name': 'Medo-Freight EU',
        'tagline': 'Ship · Route · Deliver',
        'address': 'Wattweg 5, 4622RA Bergen op Zoom, Nederland',
        'phone': '+31 683083916',
        'email': 'contact@medo-freight.eu',
        'website': 'www.medo-freight.eu',
    }


def generate_invoice(shipment: LCLShipment, language: str = 'ar') -> bytes:
    """
    Generate invoice PDF for LCL shipment.
    
    Args:
        shipment: LCLShipment instance
        language: 'ar' or 'en' (default: 'ar')
    
    Returns:
        PDF bytes
    """
    try:
        # Validate shipment status
        if shipment.status == "PENDING_PAYMENT":
            raise ValueError("Invoice can only be generated after payment is confirmed.")
        
        if shipment.payment_status != "paid":
            raise ValueError("Payment must be confirmed before generating invoice.")
        
        # Calculate pricing
        pricing = calculate_invoice_totals(shipment)
        
        # Get company info
        company_info = get_company_info()
        
        # Get status display name
        from .email_service import get_status_display_name
        status_display = get_status_display_name(shipment.status, shipment.direction)
        
        # Calculate remaining amount
        remaining_amount = float(shipment.total_price) - float(shipment.amount_paid or 0)
        
        # Prepare context for template
        context = {
            'shipment': shipment,
            'company': company_info,
            'pricing': pricing,
            'language': language,
            'invoice_date': shipment.paid_at or shipment.created_at,
            'invoice_number': shipment.shipment_number,
            'status_display': status_display,
            'remaining_amount': round(remaining_amount, 2),
        }
        
        # Render HTML template
        html_string = render_to_string('documents/invoice.html', context)
        
        # Generate PDF using WeasyPrint
        font_config = FontConfiguration()
        html = HTML(string=html_string, base_url=settings.BASE_DIR)
        
        # Generate PDF
        pdf_bytes = html.write_pdf(font_config=font_config)
        
        logger.info(f"Successfully generated invoice PDF for shipment {shipment.id}")
        return pdf_bytes
        
    except Exception as e:
        logger.error(f"Error generating invoice: {str(e)}", exc_info=True)
        raise


def save_invoice_to_storage(shipment: LCLShipment, pdf_bytes: bytes) -> str:
    """
    Save invoice PDF to storage and update shipment record.
    
    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes
    
    Returns:
        File path
    """
    try:
        from django.core.files.base import ContentFile
        
        # Generate filename
        filename = f"Invoice-{shipment.shipment_number}.pdf"
        
        # Save to FileField
        shipment.invoice_file.save(
            filename,
            ContentFile(pdf_bytes),
            save=False
        )
        shipment.invoice_generated_at = timezone.now()
        shipment.save()
        
        logger.info(f"Saved invoice to {shipment.invoice_file.path} for shipment {shipment.id}")
        return shipment.invoice_file.path
        
    except Exception as e:
        logger.error(f"Error saving invoice to storage: {str(e)}", exc_info=True)
        raise

