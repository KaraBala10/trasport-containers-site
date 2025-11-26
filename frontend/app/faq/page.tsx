"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQData {
  fcl: FAQ[];
  lcl: FAQ[];
}

export default function FAQPage() {
  const { language, mounted } = useLanguage();
  const [activeTab, setActiveTab] = useState<"fcl" | "lcl">("fcl");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!mounted) {
    return null;
  }

  const faqData: Record<string, FAQData> = {
    ar: {
      fcl: [
        {
          question: "ما هو الشحن FCL؟",
          answer:
            "الشحن FCL يعني استئجار حاوية كاملة لشحنتك فقط، سواء كانت 20 قدم، 40 قدم، أو 40 HC، بدون مشاركة مع أي عميل آخر.",
        },
        {
          question: "ما أنواع الحاويات المتاحة؟",
          answer:
            "نوفر عدة أنواع من الحاويات:\n• 20ft Standard\n• 40ft Standard\n• 40ft High Cube\n• Reefer (مبردة)\n• Open Top (مفتوحة السقف)\n• Flat Rack\n• Tank\n(حسب توفر الخط البحري)",
        },
        {
          question: "كم تستغرق رحلة الشحن FCL؟",
          answer:
            "يعتمد على خط الملاحة والوجهة، عادة بين 20–45 يومًا، إضافة إلى الوقت اللازم للتخليص الجمركي في بلد الوصول.",
        },
        {
          question: "ماذا يشمل سعر الشحن FCL؟",
          answer:
            "غالبًا يشمل:\n• الشحن البحري\n• رسوم التحميل\n• رسوم التوثيق\n\nوقد لا يشمل:\n• التخليص الجمركي\n• رسوم الميناء\n• النقل الداخلي\n• الفحص أو التخزين\n\n(حسب عرض السعر المتفق عليه)",
        },
        {
          question: "هل أستطيع تحميل الحاوية عند عنواني؟",
          answer:
            "نعم، يمكن إرسال الحاوية إلى عنوان الشاحن لتحميلها (Door Loading)، وتتوفر مدة سماح للتحميل (Free Time) عادة 2 إلى 4 ساعات.",
        },
        {
          question: "هل يوجد وقت سماح للحاوية داخل ميناء الوصول؟",
          answer:
            "نعم، معظم الخطوط توفر 5–7 أيام Free Time داخل ميناء الوصول، وبعدها يتم احتساب غرامات (Demurrage + Detention).",
        },
        {
          question: "هل أحتاج إلى وثائق معينة؟",
          answer:
            "الوثائق الأساسية لأي شحنة FCL:\n• الفاتورة التجارية\n• قائمة التعبئة\n• بوليصة الشحن\n• شهادة المنشأ (إن لزم)\n• أي تراخيص إضافية للبضائع الخاصة",
        },
        {
          question: "هل يمكن شحن مواد خطرة؟",
          answer:
            "نعم، بشرط الحصول على موافقة مسبقة وتقديم بطاقة MSDS والالتزام بمتطلبات IMO حسب تصنيف المادة.",
        },
        {
          question: "هل يمكن تغيير وجهة الحاوية أثناء الرحلة؟",
          answer:
            "يمكن لبعض الخطوط البحرية قبول تعديل الوجهة (Change of Destination)، لكن ذلك يخضع لرسوم إضافية عالية.",
        },
        {
          question: "كيف يتم الدفع؟",
          answer:
            "حسب الشركة قد يتوفر:\n• تحويل بنكي\n• اعتماد مستندي LC\n• دفع نقدي\n• دفع إلكتروني\n\nويتم الاتفاق على الدفع مسبقًا قبل إصدار بوليصة الشحن.",
        },
        {
          question: "هل يمكن التأمين على الحاوية والبضاعة؟",
          answer:
            "نعم، توفر معظم شركات الشحن تأمينًا اختياريًا عبر بوليصة Cargo Insurance ضد التلف والضياع.",
        },
        {
          question: "ماذا أفعل إذا تأخرت الحاوية؟",
          answer:
            "التأخير غالبًا ناتج عن:\n• ازدحام موانئ\n• ظروف جوية\n• فحص جمركي\n• تغيير خط ملاحي\n\nيجب متابعة الشحنة مع فريق خدمة العملاء عبر رقم الحاوية أو بوليصة الشحن.",
        },
      ],
      lcl: [
        {
          question: "ما هو الشحن LCL إلى سورية؟",
          answer:
            "الشحن LCL يعني تجميع عدة طرود أو شحنات صغيرة من عدة عملاء داخل حاوية واحدة متجهة إلى سورية. أنت لا تحجز حاوية كاملة، بل تدفع فقط وزن أو حجم شحنتك.",
        },
        {
          question: "من أين يتم تجميع الطرود داخل أوروبا؟",
          answer:
            "يتم جمع جميع الطرود في مركز التجميع المعتمد الخاص بنا في هولندا:\nWattweg 5, 4622RA Bergen op Zoom, Netherlands.",
        },
        {
          question: "ما هو موعد خروج الحاوية إلى سورية؟",
          answer:
            "تغادر الحاوية عند اكتمالها عادة بين 20–25 من كل شهر، أو حسب خطة الشحن المعلنة على الموقع. عند اكتمال الحاوية يتم إغلاق الحجوزات فورًا.",
        },
        {
          question: "كم يستغرق وصول الشحنة إلى سورية؟",
          answer:
            "يستغرق الوصول بين 25 إلى 40 يومًا حسب خط الملاحة، التفتيش، والظروف التشغيلية بالموانئ.",
        },
        {
          question: "هل يمكنني شحن أي نوع من الطرود؟",
          answer:
            "يمكن شحن معظم أنواع الطرود والبضائع المسموح بها قانونيًا.\n\nالممنوعات تشمل: المواد القابلة للاشتعال، البطاريات المنفصلة، المواد الخطرة، النقود، المعادن الثمينة، الأجهزة غير المصرح بها، الأدوية، المواد المحظورة بحسب قوانين الموانئ.",
        },
        {
          question: "كيف يتم احتساب سعر الشحن LCL؟",
          answer:
            "يتم احتساب السعر بناءً على:\n• الوزن (Kg)\nأو\n• الحجم (CBM)\n\nويُحسب السعر على الأساس الأعلى بين الاثنين.",
        },
        {
          question: "كيف أعرف وزن أو حجم طردي؟",
          answer:
            "بعد إدخال أبعاد الطرد (الطول × العرض × الارتفاع) ووزنه في النموذج داخل الموقع، يقوم النظام تلقائيًا بحساب الحجم (CBM) ومقارنته بالوزن، ثم يظهر لك السعر النهائي مباشرة بدون الحاجة لأي حساب يدوي.",
        },
        {
          question: "هل أحتاج إلى تغليف خاص؟",
          answer:
            "نعم، يجب أن تكون الطرود مغلّفة بإحكام.\n\nالتغليف غير الجيد قد يؤدي لرفض الطرد أو تلفه، ولا تتحمل الشركة مسؤولية التغليف الخاطئ.",
        },
        {
          question: "هل تقومون باستلام الطرود من عنواني في أوروبا؟",
          answer:
            "نعم، يتوفر الاستلام من الباب Door Pickup في معظم الدول الأوروبية مقابل رسوم إضافية بحسب الدولة والرمز البريدي.",
        },
        {
          question: "هل يمكن تتبع الشحنة؟",
          answer:
            "نعم، يتم تزويد العميل بــ رقم تتبع داخلي + إشعارات بوقت الشحن، التحميل، والوصول إلى سورية.",
        },
        {
          question: "كيف يتم التسليم داخل سورية؟",
          answer:
            "يتم التسليم عبر مستودعنا وشركائنا في سورية، مع إمكانية التوصيل داخل المحافظات حسب أسعار التوصيل المتاحة لكل محافظة.",
        },
        {
          question: "هل يوجد حد أدنى للوزن؟",
          answer: "نعم، الحد الأدنى عادة 20 كغ لكل شحنة (يختلف حسب نوع الطرد).",
        },
        {
          question: "كيف يمكنني الدفع؟",
          answer:
            "يتم الدفع عبر الخيارات التالية:\n\n• الدفع الإلكتروني داخل أوروبا عبر بوابة الدفع Mollie (بطاقات بنكية – iDEAL – SEPA – Bancontact)\n\n• الدفع النقدي (كاش) داخل سورية في مراكزنا المعتمدة\n\n• الدفع عبر مكاتب الصرافة المعتمدة (تحويل محلي داخل سورية حسب التعليمات الظاهرة عند إتمام الطلب)",
        },
      ],
    },
    en: {
      fcl: [
        {
          question: "What is FCL Shipping?",
          answer:
            "FCL shipping means renting a full container for your shipment only, whether 20ft, 40ft, or 40 HC, without sharing with any other customer.",
        },
        {
          question: "What types of containers are available?",
          answer:
            "We offer several container types:\n• 20ft Standard\n• 40ft Standard\n• 40ft High Cube\n• Reefer\n• Open Top\n• Flat Rack\n• Tank\n(Subject to shipping line availability)",
        },
        {
          question: "How long does FCL shipping take?",
          answer:
            "It depends on the shipping line and destination, usually between 20–45 days, plus the time needed for customs clearance in the destination country.",
        },
        {
          question: "What does the FCL shipping price include?",
          answer:
            "Usually includes:\n• Ocean freight\n• Loading charges\n• Documentation fees\n\nMay not include:\n• Customs clearance\n• Port charges\n• Inland transportation\n• Inspection or storage\n\n(According to the agreed quotation)",
        },
        {
          question: "Can I load the container at my address?",
          answer:
            "Yes, the container can be sent to the shipper's address for loading (Door Loading), with free time usually 2 to 4 hours.",
        },
        {
          question: "Is there free time at the destination port?",
          answer:
            "Yes, most lines provide 5–7 days free time at the destination port, after which demurrage and detention charges apply.",
        },
        {
          question: "Do I need specific documents?",
          answer:
            "Essential documents for FCL shipment:\n• Commercial invoice\n• Packing list\n• Bill of lading\n• Certificate of origin (if required)\n• Any additional licenses for special goods",
        },
        {
          question: "Can dangerous goods be shipped?",
          answer:
            "Yes, subject to prior approval and submission of MSDS sheet and compliance with IMO requirements according to material classification.",
        },
        {
          question: "Can the container destination be changed during transit?",
          answer:
            "Some shipping lines accept change of destination, but this is subject to high additional fees.",
        },
        {
          question: "How is payment made?",
          answer:
            "Depending on the company, options may include:\n• Bank transfer\n• Letter of credit (LC)\n• Cash payment\n• Electronic payment\n\nPayment is agreed upon in advance before issuing the bill of lading.",
        },
        {
          question: "Can the container and cargo be insured?",
          answer:
            "Yes, most shipping companies offer optional insurance via cargo insurance policy against damage and loss.",
        },
        {
          question: "What should I do if the container is delayed?",
          answer:
            "Delays are usually due to:\n• Port congestion\n• Weather conditions\n• Customs inspection\n• Shipping line change\n\nThe shipment should be tracked with customer service via container number or bill of lading.",
        },
      ],
      lcl: [
        {
          question: "What is LCL Shipping to Syria?",
          answer:
            "LCL shipping means consolidating several parcels or small shipments from multiple customers into one container headed to Syria. You don't book a full container, you only pay for your shipment's weight or volume.",
        },
        {
          question: "Where are parcels consolidated in Europe?",
          answer:
            "All parcels are collected at our authorized consolidation center in the Netherlands:\nWattweg 5, 4622RA Bergen op Zoom, Netherlands.",
        },
        {
          question: "When does the container depart to Syria?",
          answer:
            "The container departs when full, usually between the 20th–25th of each month, or according to the shipping schedule announced on the website. When the container is full, bookings close immediately.",
        },
        {
          question:
            "How long does it take for the shipment to arrive in Syria?",
          answer:
            "Arrival takes between 25 to 40 days depending on shipping line, inspection, and operational conditions at ports.",
        },
        {
          question: "Can I ship any type of parcel?",
          answer:
            "Most types of legally permitted parcels and goods can be shipped.\n\nProhibited items include: flammable materials, separate batteries, dangerous goods, cash, precious metals, unauthorized devices, medicines, prohibited materials according to port laws.",
        },
        {
          question: "How is the LCL shipping price calculated?",
          answer:
            "The price is calculated based on:\n• Weight (Kg)\nor\n• Volume (CBM)\n\nThe price is calculated on the higher basis of the two.",
        },
        {
          question: "How do I know my parcel's weight or volume?",
          answer:
            "After entering the parcel dimensions (length × width × height) and weight in the form on the website, the system automatically calculates the volume (CBM) and compares it with the weight, then shows you the final price directly without any manual calculation.",
        },
        {
          question: "Do I need special packaging?",
          answer:
            "Yes, parcels must be tightly packaged.\n\nPoor packaging may lead to parcel rejection or damage, and the company is not responsible for incorrect packaging.",
        },
        {
          question: "Do you pick up parcels from my address in Europe?",
          answer:
            "Yes, door pickup is available in most European countries for additional fees according to country and postal code.",
        },
        {
          question: "Can the shipment be tracked?",
          answer:
            "Yes, the customer is provided with an internal tracking number + notifications of shipping time, loading, and arrival in Syria.",
        },
        {
          question: "How is delivery done within Syria?",
          answer:
            "Delivery is done through our warehouse and partners in Syria, with the possibility of delivery within governorates according to available delivery prices for each governorate.",
        },
        {
          question: "Is there a minimum weight?",
          answer:
            "Yes, the minimum is usually 20 kg per shipment (varies depending on parcel type).",
        },
        {
          question: "How can I pay?",
          answer:
            "Payment is made through the following options:\n\n• Electronic payment within Europe via Mollie payment gateway (bank cards – iDEAL – SEPA – Bancontact)\n\n• Cash payment inside Syria at our authorized centers\n\n• Payment through authorized exchange offices (local transfer within Syria according to instructions shown when completing the order)",
        },
      ],
    },
  };

  const currentFAQs = faqData[language][activeTab];

  const filteredFAQs = currentFAQs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-12 mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
            {language === "ar"
              ? "الأسئلة الشائعة"
              : "Frequently Asked Questions"}
          </h1>
          <p className="text-gray-600 text-lg">
            {language === "ar"
              ? "جميع الإجابات على أسئلتك حول خدمات الشحن"
              : "All answers to your questions about shipping services"}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <input
              type="text"
              placeholder={
                language === "ar" ? "ابحث في الأسئلة..." : "Search questions..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 rounded-2xl border-2 border-gray-300 focus:border-primary-yellow focus:ring-2 focus:ring-primary-yellow/20 transition-all text-lg"
            />
            <svg
              className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setActiveTab("fcl")}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
              activeTab === "fcl"
                ? "bg-gradient-to-r from-primary-dark to-primary-dark/90 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200"
            }`}
          >
            FCL {language === "ar" ? "(حاوية كاملة)" : "(Full Container)"}
          </button>
          <button
            onClick={() => setActiveTab("lcl")}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
              activeTab === "lcl"
                ? "bg-gradient-to-r from-primary-dark to-primary-dark/90 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200"
            }`}
          >
            LCL {language === "ar" ? "(شحن جزئي)" : "(Consolidated)"}
          </button>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {language === "ar" ? "لا توجد نتائج للبحث" : "No results found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-gray-100"
                  >
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                    >
                      <h3 className="font-bold text-lg text-primary-dark flex-1">
                        {faq.question}
                      </h3>
                      <motion.svg
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-6 h-6 text-primary-yellow flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-4">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary-dark to-primary-dark/90 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              {language === "ar"
                ? "لم تجد إجابة لسؤالك؟"
                : "Didn't find an answer?"}
            </h2>
            <p className="text-lg mb-8 text-white/90">
              {language === "ar"
                ? "تواصل معنا وسنكون سعداء بمساعدتك"
                : "Contact us and we'll be happy to help you"}
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary-yellow text-primary-dark px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl"
            >
              {language === "ar" ? "اتصل بنا" : "Contact Us"}
            </a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
