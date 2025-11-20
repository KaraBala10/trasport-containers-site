"use client";

import { motion } from 'framer-motion';
import { ShipmentData } from '@/types/shipment';
import FormContainer from './FormContainer';

interface Step2ClientInfoProps {
  data: ShipmentData;
  onChange: (field: keyof ShipmentData, value: any) => void;
  language: 'ar' | 'en';
}

export default function Step2ClientInfo({ data, onChange, language }: Step2ClientInfoProps) {
  const translations = {
    ar: {
      title: 'معلومات المرسل والمستلم',
      description: 'أدخل بيانات الطرفين بدقة',
      sender: 'بيانات المرسل',
      receiver: 'بيانات المستلم',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      idPassport: 'رقم الهوية / الجواز',
      country: 'الدولة',
      province: 'المحافظة',
      city: 'المدينة',
      address: 'العنوان',
      selectCountry: 'اختر الدولة',
      selectProvince: 'اختر المحافظة',
    },
    en: {
      title: 'Sender & Receiver Information',
      description: 'Enter both parties details accurately',
      sender: 'Sender Information',
      receiver: 'Receiver Information',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      idPassport: 'ID / Passport Number',
      country: 'Country',
      province: 'Province',
      city: 'City',
      address: 'Address',
      selectCountry: 'Select Country',
      selectProvince: 'Select Province',
    },
  };

  const t = translations[language];

  const europeanCountries = [
    'Netherlands', 'Germany', 'Belgium', 'France', 'Austria', 'Luxembourg',
    'Spain', 'Italy', 'Portugal', 'Greece', 'Poland', 'Czech Republic',
    'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Slovenia', 'Slovakia',
    'Denmark', 'Sweden', 'Finland', 'Norway', 'Ireland', 'United Kingdom',
    'Switzerland', 'Estonia', 'Latvia', 'Lithuania', 'Malta', 'Cyprus',
  ];

  const syrianProvinces = [
    'حلب', 'دمشق', 'ريف دمشق', 'حمص', 'حماة', 'اللاذقية',
    'طرطوس', 'إدلب', 'درعا', 'السويداء', 'القنيطرة',
    'دير الزور', 'الرقة', 'الحسكة',
  ];

  const isSenderInEurope = data.direction === 'eu-sy';

  const renderField = (
    label: string,
    field: string,
    type: 'text' | 'email' | 'tel' | 'select' = 'text',
    options?: string[],
    placeholder?: string
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <label className="block text-lg font-bold text-primary-dark">
        {label} <span className="text-red-500">*</span>
      </label>
      
      {type === 'select' ? (
        <select
          value={(data as any)[field] || ''}
          onChange={(e) => onChange(field as keyof ShipmentData, e.target.value)}
          className="w-full px-6 py-4 border-3 border-gray-300 rounded-2xl text-lg focus:ring-4 focus:ring-primary-yellow focus:border-primary-dark transition-all duration-300 bg-white shadow-lg"
        >
          <option value="">{placeholder}</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={(data as any)[field] || ''}
          onChange={(e) => onChange(field as keyof ShipmentData, e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 border-3 border-gray-300 rounded-2xl text-lg focus:ring-4 focus:ring-primary-yellow focus:border-primary-dark transition-all duration-300 shadow-lg"
        />
      )}
    </motion.div>
  );

  return (
    <FormContainer>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block text-7xl"
          >
            👥
          </motion.div>
          
          <h2 className="text-5xl font-black text-primary-dark">
            {t.title}
          </h2>
          
          <p className="text-xl text-gray-600 font-medium">
            {t.description}
          </p>
        </div>

        {/* Sender Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-dark to-blue-700 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
              📤
            </div>
            <h3 className="text-3xl font-black text-primary-dark">{t.sender}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField(t.fullName, 'senderName', 'text', undefined, 'John Doe')}
            {renderField(t.email, 'senderEmail', 'email', undefined, 'john@example.com')}
            {renderField(t.phone, 'senderPhone', 'tel', undefined, '+31 6 12345678')}
            {renderField(t.idPassport, 'senderIdPassport', 'text', undefined, 'ABC123456')}
            
            {isSenderInEurope ? (
              <>
                {renderField(t.country, 'senderCountry', 'select', europeanCountries, t.selectCountry)}
                {renderField(t.city, 'senderCity', 'text', undefined, 'Amsterdam')}
              </>
            ) : (
              <>
                {renderField(t.province, 'senderProvince', 'select', syrianProvinces, t.selectProvince)}
                {renderField(t.city, 'senderCity', 'text', undefined, 'حلب')}
              </>
            )}
            
            <div className="md:col-span-2">
              {renderField(t.address, 'senderAddress', 'text', undefined, 'Street name, number')}
            </div>
          </div>
        </div>

        {/* Receiver Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl border-2 border-green-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
              📥
            </div>
            <h3 className="text-3xl font-black text-green-800">{t.receiver}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField(t.fullName, 'receiverName', 'text', undefined, 'محمد أحمد')}
            {renderField(t.email, 'receiverEmail', 'email', undefined, 'receiver@example.com')}
            {renderField(t.phone, 'receiverPhone', 'tel', undefined, '+963 912 345 678')}
            {renderField(t.idPassport, 'receiverIdPassport', 'text', undefined, '01234567890')}
            
            {!isSenderInEurope ? (
              <>
                {renderField(t.country, 'receiverCountry', 'select', europeanCountries, t.selectCountry)}
                {renderField(t.city, 'receiverCity', 'text', undefined, 'Amsterdam')}
              </>
            ) : (
              <>
                {renderField(t.province, 'receiverProvince', 'select', syrianProvinces, t.selectProvince)}
                {renderField(t.city, 'receiverCity', 'text', undefined, 'دمشق')}
              </>
            )}
            
            <div className="md:col-span-2">
              {renderField(t.address, 'receiverAddress', 'text', undefined, 'اسم الشارع، رقم')}
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  );
}

