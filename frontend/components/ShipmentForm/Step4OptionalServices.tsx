"use client";

import { motion } from 'framer-motion';
import { ShipmentData, PackagingOption, DeliveryOption } from '@/types/shipment';
import FormContainer from './FormContainer';
import { useState } from 'react';

interface Step4OptionalServicesProps {
  data: ShipmentData;
  onChange: (field: keyof ShipmentData, value: any) => void;
  language: 'ar' | 'en';
}

export default function Step4OptionalServices({ data, onChange, language }: Step4OptionalServicesProps) {
  const [parcelPhotos, setParcelPhotos] = useState<File[]>([]);
  const [contentPhotos, setContentPhotos] = useState<File[]>([]);
  const [parcelPreviews, setParcelPreviews] = useState<string[]>([]);
  const [contentPreviews, setContentPreviews] = useState<string[]>([]);

  const translations = {
    ar: {
      title: 'الخدمات الإضافية',
      description: 'اختر الخدمات المناسبة لشحنتك',
      packaging: 'خيارات التغليف',
      packagingDesc: 'احمِ شحنتك بتغليف احترافي',
      syriaDelivery: 'التوصيل الداخلي في سورية',
      syriaDeliveryDesc: 'توصيل من حلب إلى المحافظات',
      euTransport: 'النقل الداخلي الأوروبي',
      euTransportDesc: 'نقل داخل أوروبا إلى Axel',
      insurance: 'التأمين على الشحنة',
      insuranceDesc: 'حماية إضافية لشحنتك',
      photos: 'صور الشحنة',
      photosDesc: 'إلزامي - لضمان سلامة شحنتك',
      parcelPhotos: 'صور الطرود (فردية)',
      parcelPhotosReq: 'مطلوب: 5-15 صورة',
      contentPhotos: 'صور المحتويات',
      contentPhotosReq: 'مطلوب: 3-15 صورة',
      notes: 'ملاحظات إضافية',
      notesPlaceholder: 'أي معلومات إضافية تريد إخبارنا بها...',
      quantity: 'الكمية',
      goodsValue: 'قيمة البضاعة',
      goodsValuePlaceholder: 'أدخل قيمة البضاعة بالدولار',
      uploadPhotos: 'اضغط لاختيار الصور أو اسحبها هنا',
      selectMultiple: 'يمكنك اختيار عدة صور معاً (Ctrl أو Cmd + Click)',
      removePhoto: 'حذف',
    },
    en: {
      title: 'Optional Services',
      description: 'Choose services that suit your shipment',
      packaging: 'Packaging Options',
      packagingDesc: 'Protect your shipment with professional packaging',
      syriaDelivery: 'Syria Internal Delivery',
      syriaDeliveryDesc: 'Delivery from Aleppo to provinces',
      euTransport: 'EU Internal Transport',
      euTransportDesc: 'Transport within Europe to Axel',
      insurance: 'Shipment Insurance',
      insuranceDesc: 'Extra protection for your shipment',
      photos: 'Shipment Photos',
      photosDesc: 'Required - to ensure your shipment safety',
      parcelPhotos: 'Individual Parcel Photos',
      parcelPhotosReq: 'Required: 5-15 photos',
      contentPhotos: 'Content Photos',
      contentPhotosReq: 'Required: 3-15 photos',
      notes: 'Additional Notes',
      notesPlaceholder: 'Any additional information you want to tell us...',
      quantity: 'Quantity',
      goodsValue: 'Goods Value',
      goodsValuePlaceholder: 'Enter goods value in USD',
    },
  };

  const t = translations[language];

  const packagingOptions: PackagingOption[] = [
    { id: 'small-box', name: 'Small Box (20×20×20 cm)', nameAr: 'صندوق صغير (20×20×20 سم)', price: 1.5, icon: '📦' },
    { id: 'medium-box', name: 'Medium Box (40×30×30 cm)', nameAr: 'صندوق متوسط (40×30×30 سم)', price: 2.5, icon: '📦' },
    { id: 'large-box', name: 'Large Box (60×40×40 cm)', nameAr: 'صندوق كبير (60×40×40 سم)', price: 3.5, icon: '📦' },
    { id: 'bubble-wrap', name: 'Bubble Wrap', nameAr: 'حماية إضافية (Bubble Wrap)', price: 2, icon: '🫧' },
    { id: 'foam', name: 'Foam Protection', nameAr: 'حماية فوم', price: 3, icon: '🛡️' },
    { id: 'pallet', name: 'Euro Pallet (120×80 cm)', nameAr: 'باليت خشبي (120×80 سم)', price: 25, icon: '🪵' },
    { id: 'wooden-crate', name: 'Wooden Crate', nameAr: 'صندوق خشبي تقوية', price: 75, icon: '📦' },
    { id: 'pallet-box', name: 'Pallet Box XL', nameAr: 'صندوق باليت كبير', price: 29, icon: '📦' },
  ];

  const syrianProvinces: DeliveryOption[] = [
    { id: 'aleppo', name: 'حلب', nameEn: 'Aleppo', basePrice: 0, pricePerKg: 0 },
    { id: 'latakia', name: 'اللاذقية', nameEn: 'Latakia', basePrice: 6, pricePerKg: 0.05 },
    { id: 'tartus', name: 'طرطوس', nameEn: 'Tartus', basePrice: 7, pricePerKg: 0.05 },
    { id: 'damascus', name: 'دمشق', nameEn: 'Damascus', basePrice: 10, pricePerKg: 0.07 },
    { id: 'homs', name: 'حمص', nameEn: 'Homs', basePrice: 9, pricePerKg: 0.06 },
    { id: 'hama', name: 'حماة', nameEn: 'Hama', basePrice: 8, pricePerKg: 0.06 },
    { id: 'idlib', name: 'إدلب', nameEn: 'Idlib', basePrice: 7, pricePerKg: 0.06 },
    { id: 'sweida', name: 'السويداء', nameEn: 'Sweida', basePrice: 12, pricePerKg: 0.08 },
    { id: 'deir', name: 'دير الزور', nameEn: 'Deir ez-Zor', basePrice: 14, pricePerKg: 0.09 },
    { id: 'hasaka', name: 'الحسكة', nameEn: 'Hasaka', basePrice: 18, pricePerKg: 0.10 },
    { id: 'raqqa', name: 'الرقة', nameEn: 'Raqqa', basePrice: 13, pricePerKg: 0.08 },
  ];

  const euTransportZones: DeliveryOption[] = [
    { id: 'netherlands', name: 'Netherlands', nameAr: 'هولندا', basePrice: 30, pricePerKg: 0.18 },
    { id: 'nearby', name: 'Germany/Belgium/France', nameAr: 'ألمانيا/بلجيكا/فرنسا', basePrice: 55, pricePerKg: 0.23 },
    { id: 'other', name: 'Other Europe', nameAr: 'باقي أوروبا', basePrice: 75, pricePerKg: 0.28 },
  ];

  const handlePackagingChange = (optionId: string, quantity: number) => {
    const current = data.packagingOptions || {};
    if (quantity <= 0) {
      const { [optionId]: _, ...rest } = current;
      onChange('packagingOptions', rest);
    } else {
      onChange('packagingOptions', { ...current, [optionId]: quantity });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'parcel' | 'content') => {
    const files = Array.from(e.target.files || []);
    
    if (type === 'parcel') {
      const currentPhotos = [...parcelPhotos, ...files];
      setParcelPhotos(currentPhotos);
      onChange('parcelPhotos', currentPhotos);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setParcelPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } else {
      const currentPhotos = [...contentPhotos, ...files];
      setContentPhotos(currentPhotos);
      onChange('contentPhotos', currentPhotos);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setContentPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number, type: 'parcel' | 'content') => {
    if (type === 'parcel') {
      const newPhotos = parcelPhotos.filter((_, i) => i !== index);
      const newPreviews = parcelPreviews.filter((_, i) => i !== index);
      setParcelPhotos(newPhotos);
      setParcelPreviews(newPreviews);
      onChange('parcelPhotos', newPhotos);
    } else {
      const newPhotos = contentPhotos.filter((_, i) => i !== index);
      const newPreviews = contentPreviews.filter((_, i) => i !== index);
      setContentPhotos(newPhotos);
      setContentPreviews(newPreviews);
      onChange('contentPhotos', newPhotos);
    }
  };

  return (
    <FormContainer>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block text-7xl"
          >
            ⚙️
          </motion.div>
          
          <h2 className="text-5xl font-black text-primary-dark">
            {t.title}
          </h2>
          
          <p className="text-xl text-gray-600 font-medium">
            {t.description}
          </p>
        </div>

        {/* Packaging Options */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
              📦
            </div>
            <div>
              <h3 className="text-3xl font-black text-blue-900">{t.packaging}</h3>
              <p className="text-blue-700 font-medium">{t.packagingDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packagingOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{option.icon}</span>
                    <div>
                      <div className="font-bold text-lg text-gray-800">
                        {language === 'ar' ? option.nameAr : option.name}
                      </div>
                      <div className="text-2xl font-black text-blue-600">{option.price} €</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-gray-700">{t.quantity}:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePackagingChange(option.id, ((data.packagingOptions || {})[option.id] || 0) - 1)}
                      className="w-10 h-10 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={(data.packagingOptions || {})[option.id] || 0}
                      onChange={(e) => handlePackagingChange(option.id, parseInt(e.target.value) || 0)}
                      className="w-20 text-center px-3 py-2 border-2 border-gray-300 rounded-lg font-bold text-lg"
                    />
                    <button
                      onClick={() => handlePackagingChange(option.id, ((data.packagingOptions || {})[option.id] || 0) + 1)}
                      className="w-10 h-10 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Syria Delivery */}
        {data.direction === 'eu-sy' && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl border-2 border-green-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                🚚
              </div>
              <div>
                <h3 className="text-3xl font-black text-green-900">{t.syriaDelivery}</h3>
                <p className="text-green-700 font-medium">{t.syriaDeliveryDesc}</p>
              </div>
            </div>

            <select
              value={data.syriaDeliveryProvince || ''}
              onChange={(e) => onChange('syriaDeliveryProvince', e.target.value)}
              className="w-full px-6 py-4 border-3 border-green-300 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-green-500 transition-all shadow-lg"
            >
              <option value="">{language === 'ar' ? 'اختر المحافظة' : 'Select Province'}</option>
              {syrianProvinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {language === 'ar' ? province.name : province.nameEn} - 
                  {province.basePrice === 0 ? ' مجاني' : ` ${province.basePrice}€ + ${province.pricePerKg}€/kg`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* EU Transport */}
        {data.direction === 'sy-eu' && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-xl border-2 border-purple-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                🚛
              </div>
              <div>
                <h3 className="text-3xl font-black text-purple-900">{t.euTransport}</h3>
                <p className="text-purple-700 font-medium">{t.euTransportDesc}</p>
              </div>
            </div>

            <select
              value={data.euTransportZone || ''}
              onChange={(e) => onChange('euTransportZone', e.target.value)}
              className="w-full px-6 py-4 border-3 border-purple-300 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-purple-500 transition-all shadow-lg"
            >
              <option value="">{language === 'ar' ? 'اختر المنطقة' : 'Select Zone'}</option>
              {euTransportZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {language === 'ar' ? zone.nameAr : zone.name} - {zone.basePrice}€ + {zone.pricePerKg}€/kg
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Insurance */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-8 shadow-xl border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                🛡️
              </div>
              <div>
                <h3 className="text-3xl font-black text-yellow-900">{t.insurance}</h3>
                <p className="text-yellow-700 font-medium">{t.insuranceDesc}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange('insuranceEnabled', !data.insuranceEnabled)}
              className={`
                px-8 py-4 rounded-2xl font-bold text-xl transition-all shadow-lg
                ${data.insuranceEnabled
                  ? 'bg-gradient-to-br from-yellow-600 to-amber-600 text-white'
                  : 'bg-white text-yellow-900 border-2 border-yellow-400'
                }
              `}
            >
              {data.insuranceEnabled ? '✓ مفعّل' : 'غير مفعّل'}
            </motion.button>
          </div>

          {data.insuranceEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <label className="block text-lg font-bold text-yellow-900 mb-2">
                {t.goodsValue} (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={data.goodsValue || ''}
                onChange={(e) => onChange('goodsValue', parseFloat(e.target.value) || 0)}
                placeholder={t.goodsValuePlaceholder}
                className="w-full px-6 py-4 border-3 border-yellow-300 rounded-2xl text-lg focus:ring-4 focus:ring-yellow-500 transition-all shadow-lg"
              />
            </motion.div>
          )}
        </div>

        {/* Photos */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-8 shadow-xl border-2 border-red-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
              📸
            </div>
            <div>
              <h3 className="text-3xl font-black text-red-900">{t.photos}</h3>
              <p className="text-red-700 font-medium">{t.photosDesc}</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Parcel Photos */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <label className="block text-xl font-black text-red-900 mb-3">
                {t.parcelPhotos} <span className="text-red-500">*</span>
              </label>
              <div className={`
                flex items-center justify-center gap-2 mb-3 px-4 py-3 rounded-lg font-bold
                ${parcelPhotos.length >= 5 && parcelPhotos.length <= 15 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'}
              `}>
                <span className="text-2xl">
                  {parcelPhotos.length >= 5 && parcelPhotos.length <= 15 ? '✅' : '⚠️'}
                </span>
                <span>{parcelPhotos.length} / 5-15 صورة</span>
              </div>
              
              <label className="block cursor-pointer">
                <div className="border-4 border-dashed border-red-300 rounded-2xl p-8 text-center hover:border-red-500 hover:bg-red-50 transition-all">
                  <div className="text-6xl mb-4">📤</div>
                  <div className="text-lg font-bold text-red-900 mb-2">{t.uploadPhotos}</div>
                  <div className="text-sm text-red-600">{t.selectMultiple}</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'parcel')}
                  className="hidden"
                />
              </label>

              {/* Preview Grid */}
              {parcelPreviews.length > 0 && (
                <div className="mt-6 grid grid-cols-3 md:grid-cols-5 gap-4">
                  {parcelPreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <img
                        src={preview}
                        alt={`Parcel ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => removePhoto(index, 'parcel')}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 rounded-b-lg">
                        #{index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Photos */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <label className="block text-xl font-black text-red-900 mb-3">
                {t.contentPhotos} <span className="text-red-500">*</span>
              </label>
              <div className={`
                flex items-center justify-center gap-2 mb-3 px-4 py-3 rounded-lg font-bold
                ${contentPhotos.length >= 3 && contentPhotos.length <= 15 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'}
              `}>
                <span className="text-2xl">
                  {contentPhotos.length >= 3 && contentPhotos.length <= 15 ? '✅' : '⚠️'}
                </span>
                <span>{contentPhotos.length} / 3-15 صورة</span>
              </div>
              
              <label className="block cursor-pointer">
                <div className="border-4 border-dashed border-red-300 rounded-2xl p-8 text-center hover:border-red-500 hover:bg-red-50 transition-all">
                  <div className="text-6xl mb-4">📦</div>
                  <div className="text-lg font-bold text-red-900 mb-2">{t.uploadPhotos}</div>
                  <div className="text-sm text-red-600">{t.selectMultiple}</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'content')}
                  className="hidden"
                />
              </label>

              {/* Preview Grid */}
              {contentPreviews.length > 0 && (
                <div className="mt-6 grid grid-cols-3 md:grid-cols-5 gap-4">
                  {contentPreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <img
                        src={preview}
                        alt={`Content ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => removePhoto(index, 'content')}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 rounded-b-lg">
                        #{index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-8 shadow-xl border-2 border-gray-200">
          <label className="block text-2xl font-black text-gray-900 mb-4">
            {t.notes}
          </label>
          <textarea
            value={data.notes || ''}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder={t.notesPlaceholder}
            rows={5}
            className="w-full px-6 py-4 border-3 border-gray-300 rounded-2xl text-lg focus:ring-4 focus:ring-primary-yellow focus:border-primary-dark transition-all shadow-lg resize-none"
          />
        </div>
      </div>
    </FormContainer>
  );
}

