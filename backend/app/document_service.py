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
import base64
import qrcode

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
    # Get site URL from settings or environment
    site_url = getattr(settings, 'SITE_URL', 'https://medo-freight.eu')
    if not site_url.startswith('http'):
        site_url = f'https://{site_url}'
    
    # Logo path - try multiple possible locations
    # Inside Docker: /app/WhatsApp Image...
    # Outside Docker: root directory
    possible_paths = [
        os.path.join('/app', 'WhatsApp Image 2025-11-28 at 23.01.45_ac5dc14b.png'),  # Docker container path
        os.path.join(settings.BASE_DIR.parent, 'WhatsApp Image 2025-11-28 at 23.01.45_ac5dc14b.png'),  # Local development
        os.path.join(settings.BASE_DIR.parent.parent, 'WhatsApp Image 2025-11-28 at 23.01.45_ac5dc14b.png'),  # Alternative local path
    ]
    
    logo_base64 = None
    
    # Try to read and encode logo as base64 from any possible path
    for logo_path in possible_paths:
        if os.path.exists(logo_path):
            try:
                with open(logo_path, 'rb') as f:
                    logo_data = f.read()
                    logo_base64 = base64.b64encode(logo_data).decode('utf-8')
                    logger.info(f"Successfully loaded logo from: {logo_path}")
                    break
            except Exception as e:
                logger.warning(f"Could not read logo file from {logo_path}: {str(e)}")
                continue
    
    if not logo_base64:
        logger.warning("Logo file not found in any of the expected locations")
    
    return {
        'name': 'Medo-Freight EU',
        'tagline': 'Ship · Route · Deliver',
        'address': 'Wattweg 5, 4622RA Bergen op Zoom, Nederland',
        'phone': '+31 683083916',
        'email': 'contact@medo-freight.eu',
        'website': 'www.medo-freight.eu',
        'site_url': site_url,
        'logo_base64': logo_base64,
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
        
        # Generate QR Code for tracking
        tracking_url = f"{company_info['site_url']}/tracking?shipment_id={shipment.id}"
        qr_code_base64 = None
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(tracking_url)
            qr.make(fit=True)
            
            # Create QR code image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            qr_code_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        except Exception as e:
            logger.warning(f"Could not generate QR code: {str(e)}")
        
        # Get signature if exists
        signature_base64 = None
        if shipment.invoice_signature:
            try:
                signature_path = shipment.invoice_signature.path
                if os.path.exists(signature_path):
                    with open(signature_path, 'rb') as f:
                        signature_data = f.read()
                        signature_base64 = base64.b64encode(signature_data).decode('utf-8')
                        logger.info(f"Successfully loaded signature for shipment {shipment.id}")
            except Exception as e:
                logger.warning(f"Could not read signature file: {str(e)}")
        
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
            'tracking_url': tracking_url,
            'qr_code_base64': qr_code_base64,
            'signature_base64': signature_base64,
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


def generate_consolidated_export_invoice(shipment: LCLShipment, language: str = 'en') -> bytes:
    """
    Generate Consolidated Export Invoice – Mixed Shipment (Personal & Commercial Goods)
    for LCL shipment. This is primarily for admin/export documentation.

    Args:
        shipment: LCLShipment instance
        language: kept for future use (currently template is EN)

    Returns:
        PDF bytes
    """
    try:
        # Reuse invoice pricing calculations (includes CBM per parcel)
        pricing = calculate_invoice_totals(shipment)

        # Company info (for logo and site URL)
        company_info = get_company_info()

        # Generate QR Code for tracking (same logic as regular invoice)
        tracking_url = f"{company_info['site_url']}/tracking?shipment_id={shipment.id}"
        qr_code_base64 = None
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(tracking_url)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            img_buffer = io.BytesIO()
            img.save(img_buffer, format="PNG")
            img_buffer.seek(0)
            qr_code_base64 = base64.b64encode(img_buffer.read()).decode("utf-8")
        except Exception as e:
            logger.warning(f"Could not generate QR code for consolidated export invoice: {str(e)}")

        # Aggregate totals for CBM and packages
        total_cbm = 0.0
        total_packages = 0
        for item in pricing.get("parcel_calculations", []):
            try:
                cbm_value = float(item.get("cbm", 0) or 0)
            except (TypeError, ValueError):
                cbm_value = 0.0
            total_cbm += cbm_value
            repeat_count = int(item.get("repeat_count", 1) or 1)
            total_packages += repeat_count

        context = {
            "shipment": shipment,
            "company": company_info,
            "pricing": pricing,
            "language": language,
            "invoice_date": shipment.paid_at or shipment.created_at,
            "invoice_number": shipment.shipment_number,
            "tracking_url": tracking_url,
            "qr_code_base64": qr_code_base64,
            "total_cbm": total_cbm,
            "total_packages": total_packages,
        }

        html_string = render_to_string("documents/consolidated_export_invoice.html", context)

        font_config = FontConfiguration()
        html = HTML(string=html_string, base_url=settings.BASE_DIR)
        pdf_bytes = html.write_pdf(font_config=font_config)

        logger.info(f"Successfully generated consolidated export invoice PDF for shipment {shipment.id}")
        return pdf_bytes

    except Exception as e:
        logger.error(f"Error generating consolidated export invoice: {str(e)}", exc_info=True)
        raise


def generate_shipping_labels(shipment: LCLShipment, language: str = 'ar', num_labels: Optional[int] = None) -> bytes:
    """
    Generate shipping labels PDF for LCL shipment.
    Creates one label per parcel (including repeat_count).
    
    Args:
        shipment: LCLShipment instance
        language: 'ar' or 'en' (default: 'ar')
    
    Returns:
        PDF bytes containing all shipping labels
    """
    try:
        # Get company info
        company_info = get_company_info()
        
        # Generate QR Code for tracking
        tracking_url = f"{company_info['site_url']}/tracking?shipment_id={shipment.id}"
        qr_code_base64 = None
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=8,
                border=2,
            )
            qr.add_data(tracking_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            qr_code_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        except Exception as e:
            logger.warning(f"Could not generate QR code: {str(e)}")
        
        # Calculate total number of labels needed
        parcels_data = shipment.parcels if shipment.parcels else []
        
        # If num_labels is provided, use it; otherwise calculate from parcels
        if num_labels is not None and num_labels > 0:
            total_labels = num_labels
            # Use first parcel data for all labels
            base_parcel = parcels_data[0] if parcels_data else {}
            label_parcels = []
            for i in range(total_labels):
                label_parcels.append({
                    **base_parcel,
                    "parcel_index": i + 1,
                    "total_parcels": total_labels,
                })
        else:
            # Calculate from parcels (original logic)
            total_labels = 0
            label_parcels = []  # List of parcels with their repeat counts
            
            for parcel_data in parcels_data:
                repeat_count = int(parcel_data.get("repeatCount", 1))
                total_labels += repeat_count
                # Add this parcel repeat_count times
                for i in range(repeat_count):
                    label_parcels.append({
                        **parcel_data,
                        "parcel_index": i + 1,
                        "total_parcels": repeat_count,
                    })
            
            if total_labels == 0:
                raise ValueError("No parcels found in shipment")
        
        # Generate HTML for all labels
        all_labels_html = []
        
        for idx, parcel in enumerate(label_parcels, 1):
            context = {
                'shipment': shipment,
                'company': company_info,
                'parcel': parcel,
                'parcel_index': idx,
                'total_labels': total_labels,
                'language': language,
                'qr_code_base64': qr_code_base64,
            }
            
            # Render label template
            label_html = render_to_string('documents/shipping_label.html', context)
            all_labels_html.append(label_html)
        
        # Combine all labels into one HTML document with page breaks
        combined_html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@page { size: 6in 4in; margin: 0.15in; } .page-break { page-break-after: always; }</style></head><body>'
        for i, label_html in enumerate(all_labels_html):
            combined_html += label_html
            if i < len(all_labels_html) - 1:
                combined_html += '<div class="page-break"></div>'
        combined_html += '</body></html>'
        
        # Generate PDF using WeasyPrint
        font_config = FontConfiguration()
        html = HTML(string=combined_html, base_url=settings.BASE_DIR)
        
        # Custom page size: 6x4 inches (width x height)
        pdf_bytes = html.write_pdf(
            font_config=font_config,
            stylesheets=[CSS(string='@page { size: 6in 4in; margin: 0.15in; }')]
        )
        
        logger.info(f"Successfully generated {total_labels} shipping labels for shipment {shipment.id}")
        return pdf_bytes
        
    except Exception as e:
        logger.error(f"Error generating shipping labels: {str(e)}", exc_info=True)
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


def generate_receipt(shipment: LCLShipment, language: str = 'ar') -> bytes:
    """
    Generate receipt PDF for LCL shipment.
    
    Args:
        shipment: LCLShipment instance
        language: 'ar' or 'en' (default: 'ar')
    
    Returns:
        PDF bytes
    """
    try:
        # Get company info
        company_info = get_company_info()
        
        # Get status display name for both languages
        from .email_service import get_status_display_name
        status_display_ar = get_status_display_name(shipment.status, shipment.direction)
        # For English, we'll use the same text for now (can be improved later)
        status_display_en = status_display_ar
        
        # Generate QR Code for tracking
        tracking_url = f"{company_info['site_url']}/tracking?shipment_id={shipment.id}"
        qr_code_base64 = None
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(tracking_url)
            qr.make(fit=True)
            
            # Create QR code image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            qr_code_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        except Exception as e:
            logger.warning(f"Could not generate QR code: {str(e)}")
        
        # Get signature if exists (use invoice_signature for company signature)
        signature_base64 = None
        if shipment.invoice_signature:
            try:
                signature_path = shipment.invoice_signature.path
                if os.path.exists(signature_path):
                    with open(signature_path, 'rb') as f:
                        signature_data = f.read()
                        signature_base64 = base64.b64encode(signature_data).decode('utf-8')
                        logger.info(f"Successfully loaded signature for receipt {shipment.id}")
            except Exception as e:
                logger.warning(f"Could not read signature file: {str(e)}")
        
        # Prepare context for template
        context = {
            'shipment': shipment,
            'company': company_info,
            'language': language,
            'receipt_date': timezone.now(),
            'receipt_number': shipment.shipment_number,
            'status_display': {
                'ar': status_display_ar,
                'en': status_display_en,
            },
            'status_display_text': status_display_ar if language == 'ar' else status_display_en,
            'tracking_url': tracking_url,
            'qr_code_base64': qr_code_base64,
            'signature_base64': signature_base64,
        }
        
        # Render HTML template
        html_string = render_to_string('documents/receipt.html', context)
        
        # Generate PDF using WeasyPrint
        font_config = FontConfiguration()
        html = HTML(string=html_string, base_url=settings.BASE_DIR)
        
        # Generate PDF
        pdf_bytes = html.write_pdf(font_config=font_config)
        
        logger.info(f"Successfully generated receipt PDF for shipment {shipment.id}")
        return pdf_bytes
        
    except Exception as e:
        logger.error(f"Error generating receipt: {str(e)}", exc_info=True)
        raise


def save_receipt_to_storage(shipment: LCLShipment, pdf_bytes: bytes) -> str:
    """
    Save receipt PDF to storage and update shipment record.
    
    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes
    
    Returns:
        File path
    """
    try:
        from django.core.files.base import ContentFile
        
        # Generate filename
        filename = f"Receipt-{shipment.shipment_number}.pdf"
        
        # Save to FileField
        shipment.receipt_file.save(
            filename,
            ContentFile(pdf_bytes),
            save=False
        )
        shipment.receipt_generated_at = timezone.now()
        shipment.save()
        
        logger.info(f"Saved receipt to {shipment.receipt_file.path} for shipment {shipment.id}")
        return shipment.receipt_file.path
        
    except Exception as e:
        logger.error(f"Error saving receipt to storage: {str(e)}", exc_info=True)
        raise

