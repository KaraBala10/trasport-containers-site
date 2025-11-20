"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ShipmentData, Parcel } from '@/types/shipment';
import FormContainer from './FormContainer';

interface Step3PackageDetailsProps {
  data: ShipmentData;
  onChange: (field: keyof ShipmentData, value: any) => void;
  language: 'ar' | 'en';
}

export default function Step3PackageDetails({ data, onChange, language }: Step3PackageDetailsProps) {
  const translations = {
    ar: {
      title: 'تفاصيل الطرود',
      description: 'حدد عدد الطرود وتفاصيل كل منها',
      numberOfParcels: 'عدد الطرود',
      shipmentType: 'نوع الشحنة',
      commercial: 'تجاري',
      personal: 'شخصي',
      parcel: 'طرد',
      description: 'وصف المحتوى',
      weight: 'الوزن (كغ)',
      length: 'الطول (سم)',
      width: 'العرض (سم)',
      height: 'الارتفاع (سم)',
      fragile: 'هش؟',
      yes: 'نعم',
      no: 'لا',
      cbm: 'الحجم (CBM)',
      totalWeight: 'الوزن الإجمالي',
      totalCBM: 'الحجم الإجمالي',
    },
    en: {
      title: 'Package Details',
      description: 'Specify number of parcels and details for each',
      numberOfParcels: 'Number of Parcels',
      shipmentType: 'Shipment Type',
      commercial: 'Commercial',
      personal: 'Personal',
      parcel: 'Parcel',
      description: 'Content Description',
      weight: 'Weight (kg)',
      length: 'Length (cm)',
      width: 'Width (cm)',
      height: 'Height (cm)',
      fragile: 'Fragile?',
      yes: 'Yes',
      no: 'No',
      cbm: 'Volume (CBM)',
      totalWeight: 'Total Weight',
      totalCBM: 'Total CBM',
    },
  };

  const t = translations[language];

  const handleParcelCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(50, count));
    const currentParcels = data.parcels || [];
    
    if (newCount > currentParcels.length) {
      const newParcels = [...currentParcels];
      for (let i = currentParcels.length; i < newCount; i++) {
        newParcels.push({
          description: '',
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          fragile: false,
          cbm: 0,
        });
      }
      onChange('parcels', newParcels);
    } else {
      onChange('parcels', currentParcels.slice(0, newCount));
    }
  };

  const updateParcel = (index: number, field: keyof Parcel, value: any) => {
    const newParcels = [...(data.parcels || [])];
    newParcels[index] = { ...newParcels[index], [field]: value };
    
    // Calculate CBM
    if (field === 'length' || field === 'width' || field === 'height') {
      const { length, width, height } = newParcels[index];
      newParcels[index].cbm = (length * width * height) / 1000000;
    }
    
    onChange('parcels', newParcels);
  };

  const totalWeight = (data.parcels || []).reduce((sum, p) => sum + (Number(p.weight) || 0), 0);
  const totalCBM = (data.parcels || []).reduce((sum, p) => sum + (Number(p.cbm) || 0), 0);

  return (
    <FormContainer>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block text-7xl"
          >
            📦
          </motion.div>
          
          <h2 className="text-5xl font-black text-primary-dark">
            {t.title}
          </h2>
          
          <p className="text-xl text-gray-600 font-medium">
            {t.description}
          </p>
        </div>

        {/* Shipment Type */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-xl border-2 border-purple-200">
          <label className="block text-2xl font-black text-purple-900 mb-4">
            {t.shipmentType} <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {['commercial', 'personal'].map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange('shipmentType', type as 'commercial' | 'personal')}
                className={`
                  p-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg
                  ${data.shipmentType === type
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white ring-4 ring-purple-400'
                    : 'bg-white text-purple-900 hover:bg-purple-100'
                  }
                `}
              >
                {type === 'commercial' ? '💼 ' + t.commercial : '👤 ' + t.personal}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Parcel Counter */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200">
          <label className="block text-2xl font-black text-blue-900 mb-6">
            {t.numberOfParcels} <span className="text-red-500">*</span>
          </label>
          
          <div className="flex items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleParcelCountChange((data.parcels?.length || 1) - 1)}
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full text-3xl font-black shadow-xl hover:shadow-2xl transition-all"
            >
              −
            </motion.button>
            
            <motion.div
              key={data.parcels?.length}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 bg-gradient-to-br from-primary-dark to-blue-700 text-white rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <span className="text-6xl font-black">{data.parcels?.length || 1}</span>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleParcelCountChange((data.parcels?.length || 1) + 1)}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full text-3xl font-black shadow-xl hover:shadow-2xl transition-all"
            >
              +
            </motion.button>
          </div>
        </div>

        {/* Parcels List */}
        <AnimatePresence>
          {(data.parcels || []).map((parcel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 shadow-xl border-2 border-orange-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-black text-orange-900">
                  {t.parcel} #{index + 1}
                </h3>
                {parcel.cbm > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto bg-primary-yellow px-4 py-2 rounded-full shadow-lg"
                  >
                    <span className="font-black text-primary-dark">
                      {t.cbm}: {parcel.cbm.toFixed(4)} m³
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-orange-900 mb-2">
                    {t.description} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={parcel.description}
                    onChange={(e) => updateParcel(index, 'description', e.target.value)}
                    placeholder="Electronics, Clothes, etc."
                    className="w-full px-6 py-4 border-3 border-orange-300 rounded-2xl text-lg focus:ring-4 focus:ring-primary-yellow focus:border-orange-500 transition-all shadow-lg"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-lg font-bold text-orange-900 mb-2">
                    {t.weight} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={parcel.weight || ''}
                    onChange={(e) => updateParcel(index, 'weight', parseFloat(e.target.value) || 0)}
                    placeholder="25"
                    className="w-full px-6 py-4 border-3 border-orange-300 rounded-2xl text-lg focus:ring-4 focus:ring-primary-yellow focus:border-orange-500 transition-all shadow-lg"
                  />
                </div>

                {/* Fragile */}
                <div>
                  <label className="block text-lg font-bold text-orange-900 mb-2">
                    {t.fragile}
                  </label>
                  <div className="flex gap-4">
                    {[true, false].map((isFragile) => (
                      <button
                        key={String(isFragile)}
                        onClick={() => updateParcel(index, 'fragile', isFragile)}
                        className={`
                          flex-1 px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg
                          ${parcel.fragile === isFragile
                            ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white ring-4 ring-orange-400'
                            : 'bg-white text-orange-900 hover:bg-orange-100'
                          }
                        `}
                      >
                        {isFragile ? '⚠️ ' + t.yes : '✓ ' + t.no}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-lg font-bold text-orange-900 mb-2">
                    {t.length}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={parcel.length || ''}
                    onChange={(e) => updateParcel(index, 'length', parseFloat(e.target.value) || 0)}
                    placeholder="50"
                    className="w-full px-6 py-4 border-3 border-orange-300 rounded-2xl text-lg focus:ring-4 focus:ring-primary-yellow focus:border-orange-500 transition-all shadow-lg"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-orange-900 mb-2">
                    {t.width}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={parcel.width || ''}
                    onChange={(e) => updateParcel(index, 'width', parseFloat(e.target.value) || 0)}
                    placeholder="40"
                    className="w-full px-6 py-4 border-3 border-orange-300 rounded-2xl text-lg focus:ring-4 focus:ring-primary-yellow focus:border-orange-500 transition-all shadow-lg"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-orange-900 mb-2">
                    {t.height}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={parcel.height || ''}
                    onChange={(e) => updateParcel(index, 'height', parseFloat(e.target.value) || 0)}
                    placeholder="30"
                    className="w-full px-6 py-4 border-3 border-orange-300 rounded-2xl text-lg focus:ring-4 focus:ring-primary-yellow focus:border-orange-500 transition-all shadow-lg"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Totals */}
        {data.parcels && data.parcels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl p-8 shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="text-5xl font-black mb-2">{totalWeight.toFixed(2)}</div>
                <div className="text-xl font-bold opacity-90">{t.totalWeight} (kg)</div>
              </div>
              <div>
                <div className="text-5xl font-black mb-2">{totalCBM.toFixed(4)}</div>
                <div className="text-xl font-bold opacity-90">{t.totalCBM} (m³)</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </FormContainer>
  );
}

