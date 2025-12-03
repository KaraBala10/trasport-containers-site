"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import aboutContent from "@/content/about.json";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

// Animated Counter Component
function AnimatedCounter({
  end,
  suffix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Floating Particles Background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-yellow/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
}

// 3D Flip Card Component
function FlipCard({
  front,
  back,
}: {
  front: React.ReactNode;
  back: React.ReactNode;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-full cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden">{front}</div>
        {/* Back */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}

export default function AboutPage() {
  const { language, isRTL, mounted } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const content = useMemo(() => {
    return aboutContent[language] || aboutContent.ar;
  }, [language]);

  // Testimonials Data
  const testimonials = [
    {
      name: language === "ar" ? "أحمد محمد" : "Ahmad Mohammad",
      company: language === "ar" ? "شركة النور للتجارة" : "Al Nour Trading",
      text:
        language === "ar"
          ? "خدمة ممتازة وسريعة. وصلت شحنتي في الوقت المحدد والتعامل كان احترافي جداً."
          : "Excellent and fast service. My shipment arrived on time and the service was very professional.",
      rating: 5,
    },
    {
      name: language === "ar" ? "فاطمة علي" : "Fatima Ali",
      company: language === "ar" ? "متجر الإلكترونيات" : "Electronics Store",
      text:
        language === "ar"
          ? "أفضل شركة شحن تعاملت معها. الأسعار واضحة والمتابعة مستمرة."
          : "The best shipping company I've dealt with. Clear prices and continuous follow-up.",
      rating: 5,
    },
    {
      name: language === "ar" ? "محمود حسن" : "Mahmoud Hassan",
      company: language === "ar" ? "مكتب الأثاث" : "Furniture Office",
      text:
        language === "ar"
          ? "شحنت أثاث كامل إلى سوريا، وصل كل شيء سليم. شكراً لفريق العمل المحترف."
          : "I shipped complete furniture to Syria, everything arrived safely. Thanks to the professional team.",
      rating: 5,
    },
  ];

  // Timeline Data
  const timeline = [
    {
      year: "2010",
      title: language === "ar" ? "البداية" : "The Beginning",
      description:
        language === "ar"
          ? "تأسيس الشركة في هولندا"
          : "Company establishment in Netherlands",
    },
    {
      year: "2015",
      title: language === "ar" ? "التوسع" : "Expansion",
      description:
        language === "ar"
          ? "افتتاح مركز التجميع الرئيسي"
          : "Opening of main consolidation center",
    },
    {
      year: "2018",
      title: language === "ar" ? "الشراكة" : "Partnership",
      description:
        language === "ar"
          ? "شراكة استراتيجية مع الإكرام التجارية"
          : "Strategic partnership with Al Ikram Trading",
    },
    {
      year: "2020",
      title: language === "ar" ? "التطوير" : "Development",
      description:
        language === "ar"
          ? "إطلاق المنصة الإلكترونية"
          : "Launch of digital platform",
    },
    {
      year: "2025",
      title: language === "ar" ? "الريادة" : "Leadership",
      description:
        language === "ar"
          ? "الشركة الأولى للشحن إلى سوريا"
          : "Leading company for shipping to Syria",
    },
  ];

  // Team Data
  const team = [
    {
      name: language === "ar" ? "محمد العلي" : "Mohammad Al Ali",
      role: language === "ar" ? "المدير التنفيذي" : "CEO",
      image: "/team/ceo.jpg",
    },
    {
      name: language === "ar" ? "سارة أحمد" : "Sara Ahmad",
      role: language === "ar" ? "مديرة العمليات" : "Operations Manager",
      image: "/team/operations.jpg",
    },
    {
      name: language === "ar" ? "خالد حسن" : "Khaled Hassan",
      role: language === "ar" ? "مدير اللوجستيات" : "Logistics Manager",
      image: "/team/logistics.jpg",
    },
    {
      name: language === "ar" ? "نور الدين" : "Nour Aldeen",
      role: language === "ar" ? "خدمة العملاء" : "Customer Service",
      image: "/team/customer.jpg",
    },
  ];

  // Achievement Badges
  const achievements = [
    {
      icon: "🏆",
      label: language === "ar" ? "ISO 9001" : "ISO 9001 Certified",
    },
    {
      icon: "✅",
      label: language === "ar" ? "مصرّح أوروبياً" : "EU Authorized",
    },
    {
      icon: "🌟",
      label: language === "ar" ? "جودة مضمونة" : "Quality Assured",
    },
    { icon: "🔒", label: language === "ar" ? "آمن 100%" : "100% Secure" },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div
      key={language}
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-x-hidden w-full max-w-full"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary-yellow z-50 origin-left"
        style={{ scaleX }}
      />

      <Header />
      <div className="h-20" aria-hidden="true" />

      <main className="flex-grow relative overflow-x-hidden w-full max-w-full" role="main">
        {/* Hero Section with Particles */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative bg-gradient-to-br from-primary-dark via-primary-dark/95 to-primary-dark/90 text-white py-32 md:py-40 overflow-hidden w-full max-w-full"
        >
          <FloatingParticles />

          {/* Animated Background Shapes - Fixed for mobile */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <motion.div
              className="absolute top-20 left-0 sm:left-10 w-32 h-32 sm:w-48 md:w-64 md:h-64 bg-primary-yellow rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute bottom-20 right-0 sm:right-10 w-48 h-48 sm:w-64 md:w-96 md:h-96 bg-primary-yellow rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [0, -90, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
            />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10 w-full max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 md:mb-8"
            >
              🚢
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 md:mb-6 px-2 break-words"
            >
              {content.mainTitle}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center mb-8"
            >
              <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-primary-yellow rounded-full" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-4xl mx-auto leading-relaxed px-2 sm:px-4 break-words"
            >
              {content.intro}
            </motion.p>

            {/* Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-8 md:mt-12 flex-wrap px-2 sm:px-4 overflow-x-hidden"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-white/10 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-3 rounded-full border border-white/20 flex-shrink-0"
                >
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl mr-1 sm:mr-2">{achievement.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                    {achievement.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Description Section with 3D Effect */}
        <div className="container mx-auto px-4 py-20 w-full max-w-full overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2 }}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border-t-4 border-primary-yellow relative overflow-hidden"
            >
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-yellow/10 rounded-bl-full" />
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed text-center relative z-10 break-words">
                {content.description}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section with Enhanced Animations */}
        <div className="bg-gradient-to-r from-primary-dark via-primary-dark/95 to-primary-dark py-24 relative overflow-hidden w-full max-w-full">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10 w-full max-w-full overflow-x-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {content.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                  whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -10 }}
                  className="text-center bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/10"
                >
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-yellow mb-1 sm:mb-2">
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </div>
                  <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-semibold">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Vision & Mission with 3D Flip Cards */}
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24 w-full max-w-full overflow-x-hidden">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-64 sm:h-72 md:h-80"
            >
              <FlipCard
                front={
                  <div className="bg-gradient-to-br from-primary-yellow/20 to-primary-yellow/10 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 h-full border-2 border-primary-yellow/30 flex flex-col items-center justify-center">
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3 sm:mb-4">🎯</div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-dark text-center">
                      {content.vision.title}
                    </h2>
                  </div>
                }
                back={
                  <div className="bg-gradient-to-br from-primary-yellow to-primary-yellow/80 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 h-full flex items-center justify-center">
                    <p className="text-sm sm:text-base md:text-lg text-primary-dark leading-relaxed text-center font-semibold">
                      {content.vision.text}
                    </p>
                  </div>
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-64 sm:h-72 md:h-80"
            >
              <FlipCard
                front={
                  <div className="bg-gradient-to-br from-primary-dark/10 to-primary-dark/5 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 h-full border-2 border-primary-dark/30 flex flex-col items-center justify-center">
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3 sm:mb-4">🚀</div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-dark text-center">
                      {content.mission.title}
                    </h2>
                  </div>
                }
                back={
                  <div className="bg-gradient-to-br from-primary-dark to-primary-dark/90 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 h-full flex items-center justify-center">
                    <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed text-center font-semibold">
                      {content.mission.text}
                    </p>
                  </div>
                }
              />
            </motion.div>
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 py-24 w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-primary-dark mb-4">
                {language === "ar" ? "رحلتنا" : "Our Journey"}
              </h2>
              <div className="flex justify-center">
                <div className="w-32 h-1.5 bg-primary-yellow rounded-full" />
              </div>
            </motion.div>

            <div className="max-w-6xl mx-auto relative">
              {/* Timeline Line - Hidden on mobile, visible on md+ */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-yellow/30" />

              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex flex-col md:flex-row items-center mb-8 sm:mb-10 md:mb-12"
                >
                  {/* Mobile: Full width, Desktop: Half width */}
                  <div className="w-full md:w-1/2 mb-4 md:mb-0 md:pr-12 md:pl-0 md:text-right">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border-l-4 border-primary-yellow"
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-primary-yellow mb-2">
                        {item.year}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-primary-dark mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                    </motion.div>
                  </div>

                  {/* Timeline Dot - Centered on mobile, positioned on desktop */}
                  <div className="relative z-10 my-2 md:my-0">
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: 180 }}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-yellow rounded-full border-4 border-white shadow-lg"
                    />
                  </div>

                  {/* Spacer for desktop layout */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Section with Enhanced Cards */}
        <div className="py-24 w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-dark mb-3 sm:mb-4 px-4">
                {content.services.title}
              </h2>
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-primary-yellow rounded-full" />
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
              {content.services.items.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  className="bg-white rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-primary-yellow relative overflow-hidden group"
                >
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-yellow/0 to-primary-yellow/0 group-hover:from-primary-yellow/10 group-hover:to-primary-yellow/5 transition-all duration-300" />

                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 relative z-10"
                  >
                    {service.icon}
                  </motion.div>

                  <h3 className="text-xl sm:text-2xl font-bold text-primary-dark mb-3 sm:mb-4 relative z-10">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed relative z-10">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Us Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-24 w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-dark mb-3 sm:mb-4 px-4">
                {content.whyUs.title}
              </h2>
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-primary-yellow rounded-full" />
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
              {content.whyUs.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-2xl transition-all duration-300 border-l-4 border-primary-yellow"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="flex-shrink-0"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-yellow to-primary-yellow/80 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7 text-primary-dark"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </motion.div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-primary-dark mb-1 sm:mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-24 w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-dark mb-3 sm:mb-4 px-4">
                {language === "ar" ? "فريقنا" : "Our Team"}
              </h2>
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-primary-yellow rounded-full" />
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -15, scale: 1.05 }}
                  className="text-center"
                >
                  <div className="relative mb-4 sm:mb-5 md:mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto rounded-full bg-gradient-to-br from-primary-yellow to-primary-dark/80 p-1 shadow-xl"
                    >
                      <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl">
                        👤
                      </div>
                    </motion.div>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-dark mb-1 sm:mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-yellow font-semibold text-sm sm:text-base md:text-lg">
                    {member.role}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="bg-gradient-to-br from-primary-dark to-primary-dark/95 py-24 w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 px-4">
                {language === "ar" ? "آراء عملائنا" : "Client Testimonials"}
              </h2>
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-primary-yellow rounded-full" />
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="bg-white rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl relative"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-4xl sm:text-5xl md:text-6xl text-primary-yellow/20">
                    &ldquo;
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 + i * 0.1 }}
                        className="text-lg sm:text-xl md:text-2xl text-primary-yellow"
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </div>

                  <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-5 md:mb-6 leading-relaxed italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <p className="font-bold text-primary-dark text-base sm:text-lg">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {testimonial.company}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Collection Centers Section */}
        <div className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-dark mb-3 sm:mb-4 px-4">
                {content.offices.collectionCenters.title}
              </h2>
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-primary-yellow rounded-full" />
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto mb-12 sm:mb-16 md:mb-20 lg:mb-24">
              {/* Large Parcels Center */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.03, rotateY: 2 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border-t-4 border-primary-yellow hover:shadow-3xl transition-all duration-300"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-center"
                >
                  📦
                </motion.div>

                <div className="mb-6 sm:mb-7 md:mb-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-dark mb-2 sm:mb-3 text-center">
                    {content.offices.collectionCenters.largeParcels.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm text-center mb-2 sm:mb-3">
                    {content.offices.collectionCenters.largeParcels.description}
                  </p>
                  <div className="text-primary-yellow font-bold text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 text-center">
                    {content.offices.collectionCenters.largeParcels.companyName}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm italic text-center">
                    {content.offices.collectionCenters.largeParcels.tagline}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-yellow/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-dark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                        {content.offices.collectionCenters.largeParcels.address}
                      </p>
                      <p className="text-primary-dark font-semibold mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
                        {content.offices.collectionCenters.largeParcels.storagePoint}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Small Parcels Center */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.03, rotateY: -2 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border-t-4 border-primary-dark hover:shadow-3xl transition-all duration-300"
              >
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-center"
                >
                  📮
                </motion.div>

                <div className="mb-6 sm:mb-7 md:mb-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-dark mb-2 sm:mb-3 text-center">
                    {content.offices.collectionCenters.smallParcels.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm text-center mb-2 sm:mb-3">
                    {content.offices.collectionCenters.smallParcels.description}
                  </p>
                  <div className="text-primary-dark font-bold text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 text-center">
                    {content.offices.collectionCenters.smallParcels.companyName}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-dark/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-dark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                        {content.offices.collectionCenters.smallParcels.address}
                      </p>
                      <p className="text-primary-dark font-semibold mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
                        {content.offices.collectionCenters.smallParcels.storagePoint}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Offices Section */}
        <div className="py-24 w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 w-full max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-dark mb-3 sm:mb-4 px-4">
                {content.offices.title}
              </h2>
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-primary-yellow rounded-full" />
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
            {/* Europe Office */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.03, rotateY: 2 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border-t-4 border-primary-yellow hover:shadow-3xl transition-all duration-300"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-center"
                >
                  🇪🇺
                </motion.div>

                <div className="mb-6 sm:mb-7 md:mb-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-dark mb-2 sm:mb-3 text-center">
                  {content.offices.europe.title}
                </h3>
                  <div className="text-primary-yellow font-bold text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 text-center">
                  {content.offices.europe.companyName}
                </div>
                  <div className="text-gray-600 text-xs sm:text-sm italic text-center">
                  {content.offices.europe.tagline}
                </div>
              </div>

                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-yellow/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                    {content.offices.europe.address}
                  </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-yellow/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                    </div>
                  <a
                    href={`tel:${content.offices.europe.phone}`}
                      className="text-gray-700 text-sm sm:text-base md:text-lg hover:text-primary-yellow transition-colors font-semibold break-all"
                  >
                    {content.offices.europe.phone}
                  </a>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-yellow/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                    </div>
                  <a
                    href={`mailto:${content.offices.europe.email}`}
                      className="text-gray-700 text-sm sm:text-base md:text-lg hover:text-primary-yellow transition-colors font-semibold break-all"
                  >
                    {content.offices.europe.email}
                  </a>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-yellow/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                    </div>
                  <a
                    href={`https://${content.offices.europe.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                      className="text-gray-700 text-sm sm:text-base md:text-lg hover:text-primary-yellow transition-colors font-semibold break-all"
                  >
                    {content.offices.europe.website}
                  </a>
                  </motion.div>
                </div>
              </motion.div>

            {/* Syria Office */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.03, rotateY: -2 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border-t-4 border-primary-dark hover:shadow-3xl transition-all duration-300"
              >
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-center"
                >
                  🌍
                </motion.div>

                <div className="mb-6 sm:mb-7 md:mb-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-dark mb-2 sm:mb-3 text-center">
                  {content.offices.syria.title}
                </h3>
                  <div className="text-primary-dark font-bold text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 text-center">
                  {content.offices.syria.companyName}
                </div>
                  <div className="text-gray-600 text-xs sm:text-sm italic text-center">
                  {content.offices.syria.companyNameEn}
                </div>
              </div>

                <div className="space-y-6">
                {content.offices.syria.locations.map((location, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 10 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-dark/10 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-primary-dark"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                      </div>
                    <div>
                        <div className="font-bold text-primary-dark text-lg mb-1">
                        {location.name}
                      </div>
                      <div className="text-gray-700">{location.address}</div>
                    </div>
                    </motion.div>
                  ))}

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-dark/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                    </div>
                  <a
                    href={`tel:${content.offices.syria.phone}`}
                      className="text-gray-700 text-lg hover:text-primary-yellow transition-colors font-semibold"
                  >
                    {content.offices.syria.phone}
                  </a>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-dark/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                    </div>
                  <a
                    href={`mailto:${content.offices.syria.email}`}
                      className="text-gray-700 text-lg hover:text-primary-yellow transition-colors font-semibold"
                  >
                    {content.offices.syria.email}
                  </a>
                  </motion.div>
                </div>
              </motion.div>
                </div>
              </div>
            </div>

        {/* CTA Section with Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 py-24 w-full max-w-full overflow-x-hidden"
        >
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary-dark via-primary-dark/95 to-primary-dark/90 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 text-white text-center shadow-2xl relative overflow-hidden w-full">
            {/* Animated Background Elements */}
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-primary-yellow/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-primary-yellow/10 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.1, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-4 sm:mb-6 md:mb-8"
              >
                🎉
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4 break-words"
              >
                {content.cta.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-8 sm:mb-10 md:mb-12 text-white/90 leading-relaxed px-2 sm:px-4 break-words"
              >
                {content.cta.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link href="/create-shipment" className="inline-block">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-yellow text-primary-dark px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 xl:px-12 xl:py-6 rounded-lg md:rounded-xl font-bold text-sm sm:text-base md:text-lg lg:text-xl shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10 whitespace-nowrap">{content.cta.button}</span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
          </div>
        </div>
        </motion.div>
      </main>

      <Footer />

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
