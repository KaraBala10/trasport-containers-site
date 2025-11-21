"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { apiService } from "@/lib/api";

export default function FCLQuotePage() {
  const router = useRouter();
  const { language, isRTL } = useLanguage();
  const [currentSection, setCurrentSection] = useState<string>("route");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [calculatedPrice, setCalculatedPrice] = useState<{
    price_per_container: number;
    total_price: number;
    number_of_containers: number;
  } | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Route Details
    origin_country: "",
    origin_city: "",
    origin_zip: "",
    port_of_loading: "",
    destination_country: "",
    destination_city: "",
    port_of_discharge: "",
    
    // Container Details
    container_type: "",
    number_of_containers: 1,
    cargo_ready_date: "",
    
    // Cargo Details
    commodity_type: "",
    usage_type: "",
    total_weight: "",
    total_volume: "",
    cargo_value: "",
    is_dangerous: false,
    un_number: "",
    dangerous_class: "",
    
    // Additional Services
    pickup_required: false,
    pickup_address: "",
    forklift_available: false,
    eu_export_clearance: false,
    cargo_insurance: false,
    on_carriage: false,
    
    // Customer Details
    full_name: "",
    company_name: "",
    country: "",
    phone: "",
    email: "",
    preferred_contact: "whatsapp",
    
    // Files
    packing_list: null as File | null,
    photos: null as File | null,
    
    // Terms
    accepted_terms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const translations = {
    ar: {
      title: "طلب عرض سعر FCL - حاوية كاملة",
      subtitle: "احصل على عرض سعر فوري لشحنتك",
      
      // Sections
      routeDetails: "بيانات المسار",
      containerDetails: "تفاصيل الحاوية",
      cargoDetails: "تفاصيل البضاعة",
      additionalServices: "الخدمات الإضافية",
      customerDetails: "بيانات العميل",
      
      // Route Details
      originCountry: "بلد المنشأ",
      originCity: "مدينة المنشأ",
      originZip: "الرمز البريدي",
      portOfLoading: "ميناء الشحن (POL)",
      destinationCountry: "بلد الوجهة",
      destinationCity: "مدينة الوجهة",
      portOfDischarge: "ميناء الوصول (POD)",
      
      // Container Details
      containerType: "نوع الحاوية",
      numberOfContainers: "عدد الحاويات",
      cargoReadyDate: "تاريخ جاهزية البضاعة",
      container20DV: "20DV - 20ft Dry Van",
      container40DV: "40DV - 40ft Dry Van",
      container40HC: "40HC - 40ft High Cube",
      
      // Cargo Details
      commodityType: "نوع البضاعة",
      usageType: "نوع الاستخدام",
      commercial: "تجاري",
      personal: "شخصي",
      totalWeight: "الوزن الإجمالي (KG)",
      totalVolume: "الحجم (CBM)",
      cargoValue: "قيمة البضاعة (EUR)",
      isDangerous: "مواد خطرة؟",
      unNumber: "UN Number",
      dangerousClass: "Class",
      
      // Additional Services
      pickupRequired: "Pickup من الباب في المنشأ؟",
      pickupAddress: "عنوان الاستلام",
      forkliftAvailable: "Forklift available",
      euExportClearance: "تخليص جمركي EU Export Clearance",
      cargoInsurance: "تأمين الشحنة Cargo Insurance",
      onCarriage: "نقل داخلي في بلد الوصول (On-carriage)",
      
      // Customer Details
      fullName: "الاسم الكامل",
      companyName: "اسم الشركة",
      customerCountry: "الدولة",
      phone: "رقم الهاتف / واتساب",
      email: "البريد الإلكتروني",
      preferredContact: "طريقة التواصل",
      whatsapp: "WhatsApp",
      emailContact: "Email",
      phoneContact: "Phone",
      uploadFiles: "رفع ملفات (Packing list / صور)",
      packingList: "Packing List",
      photos: "صور",
      
      // Terms
      acceptTerms: "أوافق على الشروط والأحكام",
      privacyPolicy: "سياسة الخصوصية",
      
      // Buttons
      calculatePrice: "احسب السعر",
      confirmBooking: "تأكيد الحجز",
      next: "التالي",
      previous: "السابق",
      
      // Price
      pricePerContainer: "السعر لكل حاوية",
      totalPrice: "السعر الإجمالي",
      priceNote: "السعر تقديري حتى تأكيد الحجز",
      
      // Messages
      success: "تم إرسال طلبك بنجاح! سنتواصل معك قريباً.",
      error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      required: "هذا الحقل مطلوب",
    },
    en: {
      title: "FCL Quote Request - Full Container Load",
      subtitle: "Get an instant quote for your shipment",
      
      // Sections
      routeDetails: "Route Details",
      containerDetails: "Container Details",
      cargoDetails: "Cargo Details",
      additionalServices: "Additional Services",
      customerDetails: "Customer Details",
      
      // Route Details
      originCountry: "Origin Country",
      originCity: "Origin City",
      originZip: "ZIP Code",
      portOfLoading: "Port of Loading (POL)",
      destinationCountry: "Destination Country",
      destinationCity: "Destination City",
      portOfDischarge: "Port of Discharge (POD)",
      
      // Container Details
      containerType: "Container Type",
      numberOfContainers: "Number of Containers",
      cargoReadyDate: "Cargo Ready Date",
      container20DV: "20DV - 20ft Dry Van",
      container40DV: "40DV - 40ft Dry Van",
      container40HC: "40HC - 40ft High Cube",
      
      // Cargo Details
      commodityType: "Commodity Type",
      usageType: "Usage Type",
      commercial: "Commercial",
      personal: "Personal",
      totalWeight: "Total Weight (KG)",
      totalVolume: "Total Volume (CBM)",
      cargoValue: "Cargo Value (EUR)",
      isDangerous: "Dangerous Goods?",
      unNumber: "UN Number",
      dangerousClass: "Class",
      
      // Additional Services
      pickupRequired: "Pickup from door at origin?",
      pickupAddress: "Pickup Address",
      forkliftAvailable: "Forklift available",
      euExportClearance: "EU Export Clearance",
      cargoInsurance: "Cargo Insurance",
      onCarriage: "On-carriage in destination country",
      
      // Customer Details
      fullName: "Full Name",
      companyName: "Company Name",
      customerCountry: "Country",
      phone: "Phone / WhatsApp",
      email: "Email",
      preferredContact: "Preferred Contact Method",
      whatsapp: "WhatsApp",
      emailContact: "Email",
      phoneContact: "Phone",
      uploadFiles: "Upload Files (Packing list / Photos)",
      packingList: "Packing List",
      photos: "Photos",
      
      // Terms
      acceptTerms: "I accept the terms and conditions",
      privacyPolicy: "Privacy Policy",
      
      // Buttons
      calculatePrice: "Calculate Price",
      confirmBooking: "Confirm Booking",
      next: "Next",
      previous: "Previous",
      
      // Price
      pricePerContainer: "Price Per Container",
      totalPrice: "Total Price",
      priceNote: "Price is estimated until booking confirmation",
      
      // Messages
      success: "Your request has been sent successfully! We will contact you soon.",
      error: "An error occurred. Please try again.",
      required: "This field is required",
    },
  };

  const t = translations[language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "packing_list" | "photos") => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.files![0],
      }));
    }
  };

  const validateSection = (section: string): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (section === "route") {
      if (!formData.origin_country) newErrors.origin_country = t.required;
      if (!formData.origin_city) newErrors.origin_city = t.required;
      if (!formData.port_of_loading) newErrors.port_of_loading = t.required;
      if (!formData.destination_country) newErrors.destination_country = t.required;
      if (!formData.destination_city) newErrors.destination_city = t.required;
      if (!formData.port_of_discharge) newErrors.port_of_discharge = t.required;
    } else if (section === "container") {
      if (!formData.container_type) newErrors.container_type = t.required;
      if (!formData.cargo_ready_date) newErrors.cargo_ready_date = t.required;
    } else if (section === "cargo") {
      if (!formData.commodity_type) newErrors.commodity_type = t.required;
      if (!formData.usage_type) newErrors.usage_type = t.required;
      if (!formData.total_weight) newErrors.total_weight = t.required;
      if (!formData.total_volume) newErrors.total_volume = t.required;
      if (!formData.cargo_value) newErrors.cargo_value = t.required;
      if (formData.is_dangerous && (!formData.un_number || !formData.dangerous_class)) {
        newErrors.dangerous = "UN Number and Class are required for dangerous goods";
      }
    } else if (section === "services") {
      if (formData.pickup_required && !formData.pickup_address) {
        newErrors.pickup_address = t.required;
      }
    } else if (section === "customer") {
      if (!formData.full_name) newErrors.full_name = t.required;
      if (!formData.country) newErrors.country = t.required;
      if (!formData.phone) newErrors.phone = t.required;
      if (!formData.email) newErrors.email = t.required;
      if (!formData.accepted_terms) newErrors.accepted_terms = t.required;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculatePrice = async () => {
    if (!validateSection("route") || !validateSection("container")) {
      return;
    }

    try {
      const response = await apiService.calculateFCLPrice({
        port_of_loading: formData.port_of_loading,
        port_of_discharge: formData.port_of_discharge,
        container_type: formData.container_type,
        number_of_containers: formData.number_of_containers,
      });

      if (response.data.success) {
        setCalculatedPrice({
          price_per_container: response.data.price_per_container,
          total_price: response.data.total_price,
          number_of_containers: response.data.number_of_containers,
        });
      }
    } catch (error: any) {
      console.error("Error calculating price:", error);
      setSubmitStatus("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSection("customer")) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (value !== null && value !== undefined && value !== "") {
          if (key === "packing_list" || key === "photos") {
            if (value instanceof File) {
              formDataToSend.append(key, value);
            }
          } else if (key === "accepted_terms" || key === "is_dangerous" || key === "pickup_required" || 
                     key === "forklift_available" || key === "eu_export_clearance" || 
                     key === "cargo_insurance" || key === "on_carriage") {
            // Boolean fields
            formDataToSend.append(key, value ? "true" : "false");
          } else if (key === "number_of_containers" || key === "total_weight" || key === "total_volume" || 
                     key === "cargo_value") {
            // Number fields
            formDataToSend.append(key, String(value));
          } else {
            // String fields
            formDataToSend.append(key, String(value));
          }
        }
      });

      const response = await apiService.createFCLQuote(formDataToSend);

      if (response.data.success) {
        setSubmitStatus("success");
        // Reset form after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common ports list (you can expand this)
  const commonPorts = [
    "Rotterdam, Netherlands",
    "Antwerp, Belgium",
    "Hamburg, Germany",
    "Bremen, Germany",
    "Amsterdam, Netherlands",
    "Lattakia, Syria",
    "Tartous, Syria",
  ];

  // Progress calculation
  const sections = ["route", "container", "cargo", "services", "customer"];
  const currentStep = sections.indexOf(currentSection) + 1;
  const progress = (currentStep / sections.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <div className="h-20" aria-hidden="true" />

      <main className="flex-grow">
        <div className="bg-gradient-to-r from-primary-dark via-primary-dark to-blue-900 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-yellow rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {t.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl"
            >
              {t.subtitle}
            </motion.p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              {sections.map((section, index) => (
                <div key={section} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        index + 1 <= currentStep
                          ? "bg-primary-yellow text-primary-dark"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1 < currentStep ? "✓" : index + 1}
                    </div>
                    <span className="text-xs mt-2 text-gray-600 hidden md:block">
                      {t[section as keyof typeof t] || section}
                    </span>
                  </div>
                  {index < sections.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-all ${
                        index + 1 < currentStep ? "bg-primary-yellow" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-primary-yellow to-primary-dark h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            {/* Route Details Section */}
            <AnimatePresence mode="wait">
              {currentSection === "route" && (
                <motion.div
                  key="route"
                  initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -50 : 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-t-4 border-primary-yellow"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">{t.routeDetails}</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.originCountry}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="origin_country"
                      value={formData.origin_country}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                        errors.origin_country ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-primary-yellow/50"
                      }`}
                      placeholder={language === "ar" ? "مثال: هولندا" : "e.g., Netherlands"}
                    />
                    {errors.origin_country && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm mt-1 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.origin_country}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.originCity}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="origin_city"
                      value={formData.origin_city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                        errors.origin_city ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-primary-yellow/50"
                      }`}
                      placeholder={language === "ar" ? "مثال: أمستردام" : "e.g., Amsterdam"}
                    />
                    {errors.origin_city && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm mt-1 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.origin_city}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2">{t.originZip}</label>
                    <input
                      type="text"
                      name="origin_zip"
                      value={formData.origin_zip}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all hover:border-primary-yellow/50 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                      placeholder={language === "ar" ? "اختياري" : "Optional"}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.portOfLoading}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="port_of_loading"
                      value={formData.port_of_loading}
                      onChange={handleChange}
                      list="ports-list"
                      className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                        errors.port_of_loading ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-primary-yellow/50"
                      }`}
                      placeholder={language === "ar" ? "اختر أو اكتب الميناء" : "Select or type port"}
                    />
                    <datalist id="ports-list">
                      {commonPorts.map((port) => (
                        <option key={port} value={port} />
                      ))}
                    </datalist>
                    {errors.port_of_loading && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm mt-1 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.port_of_loading}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.destinationCountry}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="destination_country"
                      value={formData.destination_country}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                        errors.destination_country ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-primary-yellow/50"
                      }`}
                      placeholder={language === "ar" ? "مثال: سوريا" : "e.g., Syria"}
                    />
                    {errors.destination_country && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm mt-1 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.destination_country}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.destinationCity}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="destination_city"
                      value={formData.destination_city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                        errors.destination_city ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-primary-yellow/50"
                      }`}
                      placeholder={language === "ar" ? "مثال: حلب" : "e.g., Aleppo"}
                    />
                    {errors.destination_city && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm mt-1 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.destination_city}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.portOfDischarge}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="port_of_discharge"
                      value={formData.port_of_discharge}
                      onChange={handleChange}
                      list="ports-list"
                      className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                        errors.port_of_discharge ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-primary-yellow/50"
                      }`}
                      placeholder={language === "ar" ? "اختر أو اكتب الميناء" : "Select or type port"}
                    />
                    {errors.port_of_discharge && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm mt-1 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.port_of_discharge}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                  <div className="mt-8 flex justify-end">
                    <motion.button
                      type="button"
                      onClick={() => setCurrentSection("container")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <span>{t.next}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M10 19l-7-7m0 0l7-7m-7 7h18" : "M14 5l7 7m0 0l-7 7m7-7H3"} />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Container Details Section */}
            <AnimatePresence mode="wait">
              {currentSection === "container" && (
                <motion.div
                  key="container"
                  initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -50 : 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-t-4 border-primary-yellow"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">{t.containerDetails}</h2>
                  </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.containerType}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="container_type"
                      value={formData.container_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                        errors.container_type ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-primary-yellow/50"
                      }`}
                    >
                      <option value="">{t.containerType}</option>
                      <option value="20DV">{t.container20DV}</option>
                      <option value="40DV">{t.container40DV}</option>
                      <option value="40HC">{t.container40HC}</option>
                    </select>
                    {errors.container_type && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm mt-1 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.container_type}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.numberOfContainers}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="number_of_containers"
                      value={formData.number_of_containers}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all hover:border-primary-yellow/50 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <span>{t.cargoReadyDate}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="cargo_ready_date"
                      value={formData.cargo_ready_date}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                        errors.cargo_ready_date ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-primary-yellow/50"
                      }`}
                    />
                    {errors.cargo_ready_date && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-sm mt-1 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.cargo_ready_date}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                  {/* Calculate Price Button */}
                  {formData.port_of_loading && formData.port_of_discharge && formData.container_type && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      <motion.button
                        type="button"
                        onClick={handleCalculatePrice}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {t.calculatePrice}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Price Display */}
                  <AnimatePresence>
                    {calculatedPrice && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-6 shadow-lg"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-green-900">{t.pricePerContainer}</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
                            <span className="text-gray-700">{t.pricePerContainer}:</span>
                            <span className="font-bold text-lg text-green-700">{calculatedPrice.price_per_container.toFixed(2)} EUR</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
                            <span className="text-gray-700">{t.totalPrice} ({calculatedPrice.number_of_containers} {t.numberOfContainers}):</span>
                            <span className="font-bold text-2xl text-green-700">{calculatedPrice.total_price.toFixed(2)} EUR</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-green-300">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              {t.priceNote}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setCurrentSection("route")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M14 5l7 7m0 0l-7 7m7-7H3" : "M10 19l-7-7m0 0l7-7m-7 7h18"} />
                      </svg>
                      {t.previous}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setCurrentSection("cargo")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <span>{t.next}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M10 19l-7-7m0 0l7-7m-7 7h18" : "M14 5l7 7m0 0l-7 7m7-7H3"} />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cargo Details Section */}
            <AnimatePresence mode="wait">
              {currentSection === "cargo" && (
                <motion.div
                  key="cargo"
                  initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -50 : 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-t-4 border-primary-yellow"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">{t.cargoDetails}</h2>
                  </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.commodityType} *</label>
                    <input
                      type="text"
                      name="commodity_type"
                      value={formData.commodity_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.commodity_type ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.commodity_type && <p className="text-red-600 text-sm mt-1">{errors.commodity_type}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.usageType} *</label>
                    <select
                      name="usage_type"
                      value={formData.usage_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.usage_type ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">{t.usageType}</option>
                      <option value="commercial">{t.commercial}</option>
                      <option value="personal">{t.personal}</option>
                    </select>
                    {errors.usage_type && <p className="text-red-600 text-sm mt-1">{errors.usage_type}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.totalWeight} *</label>
                    <input
                      type="number"
                      name="total_weight"
                      value={formData.total_weight}
                      onChange={handleChange}
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg ${errors.total_weight ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.total_weight && <p className="text-red-600 text-sm mt-1">{errors.total_weight}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.totalVolume} *</label>
                    <input
                      type="number"
                      name="total_volume"
                      value={formData.total_volume}
                      onChange={handleChange}
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg ${errors.total_volume ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.total_volume && <p className="text-red-600 text-sm mt-1">{errors.total_volume}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.cargoValue} *</label>
                    <input
                      type="number"
                      name="cargo_value"
                      value={formData.cargo_value}
                      onChange={handleChange}
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg ${errors.cargo_value ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.cargo_value && <p className="text-red-600 text-sm mt-1">{errors.cargo_value}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_dangerous"
                        checked={formData.is_dangerous}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>{t.isDangerous}</span>
                    </label>
                  </div>

                  {formData.is_dangerous && (
                    <>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">{t.unNumber} *</label>
                        <input
                          type="text"
                          name="un_number"
                          value={formData.un_number}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg ${errors.dangerous ? "border-red-500" : "border-gray-300"}`}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">{t.dangerousClass} *</label>
                        <input
                          type="text"
                          name="dangerous_class"
                          value={formData.dangerous_class}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg ${errors.dangerous ? "border-red-500" : "border-gray-300"}`}
                        />
                      </div>
                      {errors.dangerous && <p className="text-red-600 text-sm mt-1 md:col-span-2">{errors.dangerous}</p>}
                    </>
                  )}
                </div>

                  <div className="mt-8 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setCurrentSection("container")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M14 5l7 7m0 0l-7 7m7-7H3" : "M10 19l-7-7m0 0l7-7m-7 7h18"} />
                      </svg>
                      {t.previous}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setCurrentSection("services")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <span>{t.next}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M10 19l-7-7m0 0l7-7m-7 7h18" : "M14 5l7 7m0 0l-7 7m7-7H3"} />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Additional Services Section */}
            <AnimatePresence mode="wait">
              {currentSection === "services" && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -50 : 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-t-4 border-primary-yellow"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">{t.additionalServices}</h2>
                  </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pickup_required"
                        checked={formData.pickup_required}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>{t.pickupRequired}</span>
                    </label>
                  </div>

                  {formData.pickup_required && (
                    <>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">{t.pickupAddress} *</label>
                        <textarea
                          name="pickup_address"
                          value={formData.pickup_address}
                          onChange={handleChange}
                          rows={3}
                          className={`w-full px-4 py-3 border rounded-lg ${errors.pickup_address ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.pickup_address && <p className="text-red-600 text-sm mt-1">{errors.pickup_address}</p>}
                      </div>

                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="forklift_available"
                            checked={formData.forklift_available}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          <span>{t.forkliftAvailable}</span>
                        </label>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="eu_export_clearance"
                        checked={formData.eu_export_clearance}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>{t.euExportClearance}</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="cargo_insurance"
                        checked={formData.cargo_insurance}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>{t.cargoInsurance}</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="on_carriage"
                        checked={formData.on_carriage}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>{t.onCarriage}</span>
                    </label>
                  </div>
                </div>

                  <div className="mt-8 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setCurrentSection("cargo")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M14 5l7 7m0 0l-7 7m7-7H3" : "M10 19l-7-7m0 0l7-7m-7 7h18"} />
                      </svg>
                      {t.previous}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setCurrentSection("customer")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <span>{t.next}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M10 19l-7-7m0 0l7-7m-7 7h18" : "M14 5l7 7m0 0l-7 7m7-7H3"} />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Customer Details Section (Final) */}
            <AnimatePresence mode="wait">
              {currentSection === "customer" && (
                <motion.div
                  key="customer"
                  initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -50 : 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-t-4 border-primary-yellow"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">{t.customerDetails}</h2>
                  </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.fullName} *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.full_name ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.companyName}</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.customerCountry} *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.country ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.phone} *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.email} *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.preferredContact} *</label>
                    <select
                      name="preferred_contact"
                      value={formData.preferred_contact}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="whatsapp">{t.whatsapp}</option>
                      <option value="email">{t.emailContact}</option>
                      <option value="phone">{t.phoneContact}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.packingList}</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "packing_list")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      accept=".pdf,.doc,.docx"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">{t.photos}</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "photos")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      accept="image/*"
                      multiple
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="accepted_terms"
                        checked={formData.accepted_terms}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>
                        {t.acceptTerms}{" "}
                        <a href="/terms" className="text-primary-yellow hover:underline">
                          {t.privacyPolicy}
                        </a>
                      </span>
                    </label>
                    {errors.accepted_terms && <p className="text-red-600 text-sm mt-1">{errors.accepted_terms}</p>}
                  </div>
                </div>

                  {/* Submit Button */}
                  <div className="mt-8 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setCurrentSection("services")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M14 5l7 7m0 0l-7 7m7-7H3" : "M10 19l-7-7m0 0l7-7m-7 7h18"} />
                      </svg>
                      {t.previous}
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                      className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{language === "ar" ? "جاري الإرسال..." : "Sending..."}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t.confirmBooking}
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Status Messages */}
                  <AnimatePresence>
                    {submitStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3"
                      >
                        <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold">{t.success}</p>
                      </motion.div>
                    )}
                    {submitStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3"
                      >
                        <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold">{t.error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
