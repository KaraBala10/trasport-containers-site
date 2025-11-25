"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/lib/api";

// Extend Window interface for grecaptcha
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          size?: "normal" | "compact" | "invisible";
          theme?: "light" | "dark";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => number;
    };
  }
}

export default function FCLQuotePage() {
  const router = useRouter();
  const { language, isRTL, mounted } = useLanguage();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [currentSection, setCurrentSection] = useState<string>("route");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [showContainerImages, setShowContainerImages] = useState(false);

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
    certificate_of_origin_type: "none",
    destination_customs_clearance: false,

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

  // reCAPTCHA state
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Store env variable in constant to avoid issues with conditional access
  // Use Google's test key for localhost development (works without domain configuration)
  const isDevelopment = process.env.NODE_ENV === "development";
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Use test key on localhost, otherwise use configured key
  const recaptchaSiteKey =
    isDevelopment && isLocalhost
      ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Google's test key (works with localhost)
      : process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  // European countries and cities data
  const europeanCountries = {
    Netherlands: {
      cities: [
        "Amsterdam",
        "Rotterdam",
        "The Hague",
        "Utrecht",
        "Eindhoven",
        "Groningen",
        "Tilburg",
        "Almere",
        "Breda",
        "Nijmegen",
      ],
      ar: {
        name: "هولندا",
        cities: [
          "أمستردام",
          "روتردام",
          "لاهاي",
          "أوتريخت",
          "آيندهوفن",
          "خرونينجن",
          "تيلبورخ",
          "ألميره",
          "بريدا",
          "نايميخن",
        ],
      },
    },
    Germany: {
      cities: [
        "Berlin",
        "Hamburg",
        "Munich",
        "Cologne",
        "Frankfurt",
        "Stuttgart",
        "Düsseldorf",
        "Dortmund",
        "Essen",
        "Leipzig",
        "Bremen",
        "Dresden",
      ],
      ar: {
        name: "ألمانيا",
        cities: [
          "برلين",
          "هامبورغ",
          "ميونخ",
          "كولونيا",
          "فرانكفورت",
          "شتوتغارت",
          "دوسلدورف",
          "دورتموند",
          "إيسن",
          "لايبزيغ",
          "بريمن",
          "درسدن",
        ],
      },
    },
    Belgium: {
      cities: [
        "Brussels",
        "Antwerp",
        "Ghent",
        "Charleroi",
        "Liège",
        "Bruges",
        "Namur",
        "Leuven",
        "Mons",
        "Aalst",
      ],
      ar: {
        name: "بلجيكا",
        cities: [
          "بروكسل",
          "أنتويرب",
          "غنت",
          "شارلوروا",
          "لييج",
          "بروج",
          "نامور",
          "لوفان",
          "مونس",
          "آلست",
        ],
      },
    },
    France: {
      cities: [
        "Paris",
        "Marseille",
        "Lyon",
        "Toulouse",
        "Nice",
        "Nantes",
        "Strasbourg",
        "Montpellier",
        "Bordeaux",
        "Lille",
      ],
      ar: {
        name: "فرنسا",
        cities: [
          "باريس",
          "مرسيليا",
          "ليون",
          "تولوز",
          "نيس",
          "نانت",
          "ستراسبورغ",
          "مونبلييه",
          "بوردو",
          "ليل",
        ],
      },
    },
    Italy: {
      cities: [
        "Rome",
        "Milan",
        "Naples",
        "Turin",
        "Palermo",
        "Genoa",
        "Bologna",
        "Florence",
        "Bari",
        "Catania",
      ],
      ar: {
        name: "إيطاليا",
        cities: [
          "روما",
          "ميلانو",
          "نابولي",
          "تورينو",
          "باليرمو",
          "جنوة",
          "بولونيا",
          "فلورنسا",
          "باري",
          "كاتانيا",
        ],
      },
    },
    Spain: {
      cities: [
        "Madrid",
        "Barcelona",
        "Valencia",
        "Seville",
        "Zaragoza",
        "Málaga",
        "Murcia",
        "Palma",
        "Las Palmas",
        "Bilbao",
      ],
      ar: {
        name: "إسبانيا",
        cities: [
          "مدريد",
          "برشلونة",
          "بلنسية",
          "إشبيلية",
          "سرقسطة",
          "مالقة",
          "مرسية",
          "بالما",
          "لاس بالماس",
          "بلباو",
        ],
      },
    },
    Poland: {
      cities: [
        "Warsaw",
        "Kraków",
        "Łódź",
        "Wrocław",
        "Poznań",
        "Gdańsk",
        "Szczecin",
        "Bydgoszcz",
        "Lublin",
        "Katowice",
      ],
      ar: {
        name: "بولندا",
        cities: [
          "وارسو",
          "كراكوف",
          "وودج",
          "فروتسواف",
          "بوزنان",
          "غدانسك",
          "شتشيتسين",
          "بيدغوشتش",
          "لوبلين",
          "كاتوفيتسه",
        ],
      },
    },
    Austria: {
      cities: [
        "Vienna",
        "Graz",
        "Linz",
        "Salzburg",
        "Innsbruck",
        "Klagenfurt",
        "Villach",
        "Wels",
        "Sankt Pölten",
        "Dornbirn",
      ],
      ar: {
        name: "النمسا",
        cities: [
          "فيينا",
          "غراتس",
          "لينتس",
          "سالزبورغ",
          "إنسبروك",
          "كلاغنفورت",
          "فيلاخ",
          "فيلس",
          "سانكت بولتن",
          "دورنبيرن",
        ],
      },
    },
    Switzerland: {
      cities: [
        "Zurich",
        "Geneva",
        "Basel",
        "Bern",
        "Lausanne",
        "St. Gallen",
        "Lucerne",
        "Lugano",
        "Biel",
        "Thun",
      ],
      ar: {
        name: "سويسرا",
        cities: [
          "زيورخ",
          "جنيف",
          "بازل",
          "برن",
          "لوزان",
          "سانت غالن",
          "لوسيرن",
          "لوغانو",
          "بييل",
          "تون",
        ],
      },
    },
    Denmark: {
      cities: [
        "Copenhagen",
        "Aarhus",
        "Odense",
        "Aalborg",
        "Esbjerg",
        "Randers",
        "Kolding",
        "Horsens",
        "Vejle",
        "Roskilde",
      ],
      ar: {
        name: "الدنمارك",
        cities: [
          "كوبنهاغن",
          "آرهوس",
          "أودنسه",
          "ألبورغ",
          "إسبيرغ",
          "رانديرس",
          "كولدينغ",
          "هورسينس",
          "فيلي",
          "روسكيلد",
        ],
      },
    },
    Sweden: {
      cities: [
        "Stockholm",
        "Gothenburg",
        "Malmö",
        "Uppsala",
        "Västerås",
        "Örebro",
        "Linköping",
        "Helsingborg",
        "Jönköping",
        "Norrköping",
      ],
      ar: {
        name: "السويد",
        cities: [
          "ستوكهولم",
          "غوتنبرغ",
          "مالمو",
          "أوبسالا",
          "فيستيروس",
          "أوريبرو",
          "لينشوبينغ",
          "هلسينغبورغ",
          "يونشوبينغ",
          "نورشوبينغ",
        ],
      },
    },
    Norway: {
      cities: [
        "Oslo",
        "Bergen",
        "Trondheim",
        "Stavanger",
        "Bærum",
        "Kristiansand",
        "Fredrikstad",
        "Sandnes",
        "Tromsø",
        "Sarpsborg",
      ],
      ar: {
        name: "النرويج",
        cities: [
          "أوسلو",
          "برغن",
          "تروندهايم",
          "ستافانغر",
          "بيروم",
          "كريستيانساند",
          "فريدريكستاد",
          "ساندنس",
          "ترومسو",
          "ساربسبورغ",
        ],
      },
    },
    Finland: {
      cities: [
        "Helsinki",
        "Espoo",
        "Tampere",
        "Vantaa",
        "Oulu",
        "Turku",
        "Jyväskylä",
        "Lahti",
        "Kuopio",
        "Pori",
      ],
      ar: {
        name: "فنلندا",
        cities: [
          "هلسنكي",
          "إسبو",
          "تامبيري",
          "فانتا",
          "أولو",
          "توركو",
          "يوفاسكيلا",
          "لاهتي",
          "كووبيو",
          "بوري",
        ],
      },
    },
    "Czech Republic": {
      cities: [
        "Prague",
        "Brno",
        "Ostrava",
        "Plzeň",
        "Liberec",
        "Olomouc",
        "Ústí nad Labem",
        "České Budějovice",
        "Hradec Králové",
        "Pardubice",
      ],
      ar: {
        name: "جمهورية التشيك",
        cities: [
          "براغ",
          "برنو",
          "أوسترافا",
          "بلزن",
          "ليبيريتس",
          "أولوموتس",
          "أوستي ناد لابم",
          "تشيسكي بوديوفيتسه",
          "هراديتس كرالوفه",
          "باردوبيتسه",
        ],
      },
    },
    Portugal: {
      cities: [
        "Lisbon",
        "Porto",
        "Vila Nova de Gaia",
        "Amadora",
        "Braga",
        "Funchal",
        "Coimbra",
        "Setúbal",
        "Almada",
        "Agualva-Cacém",
      ],
      ar: {
        name: "البرتغال",
        cities: [
          "لشبونة",
          "بورتو",
          "فيلا نوفا دي غايا",
          "أمادورا",
          "براغا",
          "فونشال",
          "كويمبرا",
          "سيطوبال",
          "ألمادا",
          "أغوالفا-كاسيم",
        ],
      },
    },
    Greece: {
      cities: [
        "Athens",
        "Thessaloniki",
        "Patras",
        "Piraeus",
        "Larissa",
        "Heraklion",
        "Peristeri",
        "Kallithea",
        "Acharnes",
        "Kalamaria",
      ],
      ar: {
        name: "اليونان",
        cities: [
          "أثينا",
          "سالونيك",
          "باتراس",
          "بيرايوس",
          "لاريسا",
          "هراكليون",
          "بيريستيري",
          "كاليذيا",
          "أخارنيس",
          "كالاماريا",
        ],
      },
    },
    Hungary: {
      cities: [
        "Budapest",
        "Debrecen",
        "Szeged",
        "Miskolc",
        "Pécs",
        "Győr",
        "Nyíregyháza",
        "Kecskemét",
        "Székesfehérvár",
        "Szombathely",
      ],
      ar: {
        name: "المجر",
        cities: [
          "بودابست",
          "دبرتسن",
          "سجيد",
          "ميشكولتس",
          "بيكس",
          "جيور",
          "نييريغيهازا",
          "كيشكيميت",
          "سيكشفهيرفار",
          "سومباتهي",
        ],
      },
    },
    Romania: {
      cities: [
        "Bucharest",
        "Cluj-Napoca",
        "Timișoara",
        "Iași",
        "Constanța",
        "Craiova",
        "Brașov",
        "Galați",
        "Ploiești",
        "Oradea",
      ],
      ar: {
        name: "رومانيا",
        cities: [
          "بوخارست",
          "كلوج نابوكا",
          "تيميشوارا",
          "ياش",
          "كونستانتسا",
          "كرايوفا",
          "براشوف",
          "غالاتسي",
          "بلويشت",
          "أوراديا",
        ],
      },
    },
    Bulgaria: {
      cities: [
        "Sofia",
        "Plovdiv",
        "Varna",
        "Burgas",
        "Ruse",
        "Stara Zagora",
        "Pleven",
        "Sliven",
        "Dobrich",
        "Shumen",
      ],
      ar: {
        name: "بلغاريا",
        cities: [
          "صوفيا",
          "بلوفديف",
          "فارنا",
          "بورغاس",
          "روسيه",
          "ستارا زاغورا",
          "بليفين",
          "سليفن",
          "دوبريتش",
          "شومن",
        ],
      },
    },
    Croatia: {
      cities: [
        "Zagreb",
        "Split",
        "Rijeka",
        "Osijek",
        "Zadar",
        "Slavonski Brod",
        "Pula",
        "Sesvete",
        "Karlovac",
        "Varaždin",
      ],
      ar: {
        name: "كرواتيا",
        cities: [
          "زغرب",
          "سبليت",
          "رييكا",
          "أوسييك",
          "زادار",
          "سلافونسكي برود",
          "بولا",
          "سيسفيتي",
          "كارلوفاتس",
          "فاراجدين",
        ],
      },
    },
    Slovakia: {
      cities: [
        "Bratislava",
        "Košice",
        "Prešov",
        "Žilina",
        "Banská Bystrica",
        "Nitra",
        "Trnava",
        "Trenčín",
        "Martin",
        "Poprad",
      ],
      ar: {
        name: "سلوفاكيا",
        cities: [
          "براتيسلافا",
          "كوشيتسه",
          "بريشوف",
          "جيلينا",
          "بانسكا بيستريتسا",
          "نيترا",
          "ترنافا",
          "ترنتشين",
          "مارتن",
          "بوبراد",
        ],
      },
    },
    Slovenia: {
      cities: [
        "Ljubljana",
        "Maribor",
        "Celje",
        "Kranj",
        "Velenje",
        "Koper",
        "Novo Mesto",
        "Ptuj",
        "Trbovlje",
        "Kamnik",
      ],
      ar: {
        name: "سلوفينيا",
        cities: [
          "ليوبليانا",
          "ماريبور",
          "تسليي",
          "كراني",
          "فيلينيه",
          "كوبر",
          "نوفو ميستو",
          "بتوي",
          "تربوفلي",
          "كامنيك",
        ],
      },
    },
    Estonia: {
      cities: [
        "Tallinn",
        "Tartu",
        "Narva",
        "Pärnu",
        "Kohtla-Järve",
        "Viljandi",
        "Rakvere",
        "Maardu",
        "Kuressaare",
        "Sillamäe",
      ],
      ar: {
        name: "إستونيا",
        cities: [
          "تالين",
          "تارتو",
          "نارفا",
          "بارنو",
          "كوهتلا-يارفه",
          "فيلجاندي",
          "راكفيري",
          "ماردو",
          "كوريسار",
          "سيلامي",
        ],
      },
    },
    Latvia: {
      cities: [
        "Riga",
        "Daugavpils",
        "Liepāja",
        "Jelgava",
        "Jūrmala",
        "Ventspils",
        "Rēzekne",
        "Valmiera",
        "Ogre",
        "Cēsis",
      ],
      ar: {
        name: "لاتفيا",
        cities: [
          "ريغا",
          "داوغافبيلس",
          "لييباجا",
          "ييلغافا",
          "يورمالا",
          "فنتسبيلس",
          "ريزكني",
          "فالميرا",
          "أوغري",
          "تسيسيس",
        ],
      },
    },
    Lithuania: {
      cities: [
        "Vilnius",
        "Kaunas",
        "Klaipėda",
        "Šiauliai",
        "Panevėžys",
        "Alytus",
        "Marijampolė",
        "Mazeikiai",
        "Jonava",
        "Utena",
      ],
      ar: {
        name: "ليتوانيا",
        cities: [
          "فيلنيوس",
          "كاوناس",
          "كلايبيدا",
          "شياولياي",
          "بانيفيزيس",
          "أليتوس",
          "ماريامبولي",
          "مازيكياي",
          "يونافا",
          "أوتينا",
        ],
      },
    },
    Ireland: {
      cities: [
        "Dublin",
        "Cork",
        "Limerick",
        "Galway",
        "Waterford",
        "Drogheda",
        "Kilkenny",
        "Wexford",
        "Sligo",
        "Clonmel",
      ],
      ar: {
        name: "أيرلندا",
        cities: [
          "دبلن",
          "كورك",
          "ليميريك",
          "غالواي",
          "واترفورد",
          "دروغيدا",
          "كيلكيني",
          "ويكسفورد",
          "سليغو",
          "كلونميل",
        ],
      },
    },
    Luxembourg: {
      cities: [
        "Luxembourg City",
        "Esch-sur-Alzette",
        "Differdange",
        "Dudelange",
        "Pétange",
        "Sanem",
        "Hesperange",
        "Bettembourg",
        "Schifflange",
        "Ettelbruck",
      ],
      ar: {
        name: "لوكسمبورغ",
        cities: [
          "مدينة لوكسمبورغ",
          "إيش سور ألزيت",
          "ديفردانج",
          "دوديلانج",
          "بيتانج",
          "سانيم",
          "هيسبيرانج",
          "بيتمبورغ",
          "شيفلانج",
          "إيتلبروك",
        ],
      },
    },
    Malta: {
      cities: [
        "Valletta",
        "Birkirkara",
        "Mosta",
        "Qormi",
        "Żabbar",
        "Sliema",
        "San Ġwann",
        "Fgura",
        "Żejtun",
        "Marsaskala",
      ],
      ar: {
        name: "مالطا",
        cities: [
          "فاليتا",
          "بيركيركارا",
          "موستا",
          "كورمي",
          "زابار",
          "سليما",
          "سان جوان",
          "فغورا",
          "زيتون",
          "مارساسكالا",
        ],
      },
    },
    Cyprus: {
      cities: [
        "Nicosia",
        "Limassol",
        "Larnaca",
        "Paphos",
        "Famagusta",
        "Kyrenia",
        "Aradippou",
        "Paralimni",
        "Aglandjia",
        "Morphou",
      ],
      ar: {
        name: "قبرص",
        cities: [
          "نيقوسيا",
          "ليماسول",
          "لارنكا",
          "بافوس",
          "فاماغوستا",
          "كيرينيا",
          "أراديبو",
          "باراليمني",
          "أغلاندجيا",
          "مورفو",
        ],
      },
    },
    Syria: {
      cities: [
        "Damascus",
        "Aleppo",
        "Latakia",
        "Tartus",
        "Homs",
        "Hama",
        "Deir ez-Zor",
        "Raqqa",
        "Idlib",
        "Daraa",
      ],
      ar: {
        name: "سوريا",
        cities: [
          "دمشق",
          "حلب",
          "اللاذقية",
          "طرطوس",
          "حمص",
          "حماة",
          "دير الزور",
          "الرقة",
          "إدلب",
          "درعا",
        ],
      },
    },
  };

  // Extended countries list for customer country field (includes all countries)
  const allCountries = [
    // European countries
    ...Object.keys(europeanCountries).map((country) => ({
      en: country,
      ar:
        europeanCountries[country as keyof typeof europeanCountries]?.ar
          ?.name || country,
    })),
    // Other important countries
    { en: "Syria", ar: "سوريا" },
    { en: "United States", ar: "الولايات المتحدة" },
    { en: "Canada", ar: "كندا" },
    { en: "United Kingdom", ar: "المملكة المتحدة" },
    { en: "Australia", ar: "أستراليا" },
    { en: "New Zealand", ar: "نيوزيلندا" },
    { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
    { en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
    { en: "Qatar", ar: "قطر" },
    { en: "Kuwait", ar: "الكويت" },
    { en: "Bahrain", ar: "البحرين" },
    { en: "Oman", ar: "عمان" },
    { en: "Jordan", ar: "الأردن" },
    { en: "Lebanon", ar: "لبنان" },
    { en: "Iraq", ar: "العراق" },
    { en: "Egypt", ar: "مصر" },
    { en: "Turkey", ar: "تركيا" },
    { en: "China", ar: "الصين" },
    { en: "Japan", ar: "اليابان" },
    { en: "South Korea", ar: "كوريا الجنوبية" },
    { en: "India", ar: "الهند" },
    { en: "Brazil", ar: "البرازيل" },
    { en: "Mexico", ar: "المكسيك" },
    { en: "Argentina", ar: "الأرجنتين" },
    { en: "South Africa", ar: "جنوب أفريقيا" },
    { en: "Other", ar: "أخرى" },
  ];

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
      viewContainerImages: "عرض صور الحاويات",
      container_20ft_standard: "حاوية 20 قدم قياسية - للحمولات العامة",
      container_40ft_standard: "حاوية 40 قدم قياسية - للبضائع العامة",
      container_40ft_high_cube: "حاوية 40 قدم هاي كيوب - ارتفاع إضافي 30 سم",
      container_reefer: "حاوية مبردة - للأغذية والأدوية",
      container_open_top: "حاوية مفتوحة السقف - للبضائع الطويلة",
      container_flat_rack: "حاوية فلات راك - للمعدات الثقيلة",
      container_flat_bed: "حاوية منصة (فلات بيد) - للبضائع الكبيرة جداً",
      container_iso_tank: "حاوية تانك - للسوائل والكيماويات",
      container_bulk: "حاوية بضائع سائبة - للحبوب والمعادن",
      container_ventilated: "حاوية مهواة - للأخشاب والقهوة",
      container_insulated: "حاوية معزولة/حرارية - للحفاظ على درجة الحرارة",
      container_car_carrier: "حاوية نقل سيارات",
      container_double_door: "حاوية ببابين أمامي وخلفي",
      container_side_door: "حاوية باب جانبي - فتح جانبي كامل",

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
      dangerousGoodsInfo: "معلومات مهمة",
      unNumberDescription: "UN Number هو رقم تعريف فريد من 4 أرقام يُستخدم لتحديد المواد الخطرة أثناء النقل. مثال: UN 1202 (البنزين)، UN 1963 (غاز البترول المسال).",
      classDescription: "Class هو تصنيف المواد الخطرة إلى 9 فئات حسب نوع الخطر: الفئة 1 (متفجرات)، الفئة 2 (غازات)، الفئة 3 (سوائل قابلة للاشتعال)، الفئة 4 (مواد صلبة قابلة للاشتعال)، الفئة 5 (مواد مؤكسدة)، الفئة 6 (مواد سامة)، الفئة 7 (مواد مشعة)، الفئة 8 (مواد مسببة للتآكل)، الفئة 9 (مواد وأشياء خطرة متنوعة).",

      // Additional Services
      pickupRequired: "Pickup من الباب في المنشأ؟",
      pickupAddress: "عنوان الاستلام",
      forkliftAvailable: "Forklift available",
      euExportClearance: "تخليص جمركي EU Export Clearance",
      cargoInsurance: "تأمين الشحنة Cargo Insurance",
      onCarriage: "نقل داخلي في بلد الوصول (On-carriage)",
      certificateOfOrigin: "شهادة المنشأ",
      certificateOfOriginSelect: "اختر نوع شهادة المنشأ",
      destinationCustomsClearance: "تخليص جمركي في الوجهة",
      
      // Certificate of Origin Types
      cert_none: "بدون شهادة",
      cert_non_preferential: "شهادة منشأ غير تفضيلية",
      cert_preferential: "شهادة منشأ تفضيلية",
      cert_chamber_of_commerce: "شهادة منشأ من الغرفة التجارية",
      cert_manufacturer: "شهادة منشأ من المصنع (MCO)",
      cert_electronic: "شهادة منشأ إلكترونية (e-CO)",
      cert_eur1: "شهادة منشأ EUR.1",
      cert_eur_med: "شهادة منشأ EUR-MED",
      cert_gsp_form_a: "شهادة منشأ بنظام GSP – نموذج A",
      cert_consular: "شهادة منشأ موثّقة قنصليًا",
      cert_product_specific: "شهادات منشأ خاصة حسب نوع البضاعة",

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
      recaptchaRequired: "يرجى إكمال التحقق من reCAPTCHA",
      recaptchaLoading: "جاري تحميل reCAPTCHA...",
      recaptchaDevelopment: "reCAPTCHA v2 (وضع التطوير)",
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
      viewContainerImages: "View Container Images",
      container_20ft_standard: "20ft Standard Dry Container - Most commonly used worldwide",
      container_40ft_standard: "40ft Standard Dry Container - Double capacity of 20ft",
      container_40ft_high_cube: "40ft High Cube Container (HC) - Extra 30cm height",
      container_reefer: "Reefer Container - For refrigerated/frozen goods",
      container_open_top: "Open Top Container - For tall cargo loaded from top",
      container_flat_rack: "Flat Rack Container - For heavy machinery and oversized cargo",
      container_flat_bed: "Flat Bed / Flat Platform Container - For very long/large cargo",
      container_iso_tank: "ISO Tank Container - For liquids: chemicals, oils, food liquids",
      container_bulk: "Bulk Container - For bulk materials like grains and metals",
      container_ventilated: "Ventilated Container - For wood, coffee, and items needing ventilation",
      container_insulated: "Insulated / Thermal Container - Temperature maintenance without mechanical cooling",
      container_car_carrier: "Car Carrier Container - For vehicle transportation",
      container_double_door: "Double Door Container - Doors on both ends for easy loading",
      container_side_door: "Side Door Container - Full side opening for quick loading",

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
      dangerousGoodsInfo: "Important Information",
      unNumberDescription: "UN Number is a unique 4-digit identification number used to identify dangerous goods during transport. Example: UN 1202 (Gasoline), UN 1963 (Liquefied petroleum gas).",
      classDescription: "Class is a classification of dangerous goods into 9 main categories according to the type of hazard: Class 1 (Explosives), Class 2 (Gases), Class 3 (Flammable liquids), Class 4 (Flammable solids), Class 5 (Oxidizing substances), Class 6 (Toxic substances), Class 7 (Radioactive materials), Class 8 (Corrosive substances), Class 9 (Miscellaneous dangerous substances and articles).",

      // Additional Services
      pickupRequired: "Pickup from door at origin?",
      pickupAddress: "Pickup Address",
      forkliftAvailable: "Forklift available",
      euExportClearance: "EU Export Clearance",
      cargoInsurance: "Cargo Insurance",
      onCarriage: "On-carriage in destination country",
      certificateOfOrigin: "Certificate of Origin",
      certificateOfOriginSelect: "Select Certificate of Origin Type",
      destinationCustomsClearance: "Destination Customs Clearance",
      
      // Certificate of Origin Types
      cert_none: "None",
      cert_non_preferential: "Non-Preferential Certificate of Origin",
      cert_preferential: "Preferential Certificate of Origin",
      cert_chamber_of_commerce: "Chamber of Commerce Certificate of Origin",
      cert_manufacturer: "Manufacturer Certificate of Origin (MCO)",
      cert_electronic: "Electronic Certificate of Origin (e-CO)",
      cert_eur1: "EUR.1 Movement Certificate",
      cert_eur_med: "EUR-MED Movement Certificate",
      cert_gsp_form_a: "GSP Certificate of Origin – Form A",
      cert_consular: "Consular Certificate of Origin",
      cert_product_specific: "Special Certificates of Origin (Product-Specific)",

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
      confirmBooking: "Confirm Booking",
      next: "Next",
      previous: "Previous",

      // Price
      pricePerContainer: "Price Per Container",
      totalPrice: "Total Price",
      priceNote: "Price is estimated until booking confirmation",

      // Messages
      success:
        "Your request has been sent successfully! We will contact you soon.",
      error: "An error occurred. Please try again.",
      required: "This field is required",
      recaptchaRequired: "Please complete the reCAPTCHA verification",
      recaptchaLoading: "Loading reCAPTCHA...",
      recaptchaDevelopment: "reCAPTCHA v2 (Development Mode)",
    },
  };

  const t = translations[language];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "packing_list" | "photos"
  ) => {
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
      if (!formData.destination_country)
        newErrors.destination_country = t.required;
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
      if (
        formData.is_dangerous &&
        (!formData.un_number || !formData.dangerous_class)
      ) {
        newErrors.dangerous =
          language === "ar"
            ? "UN Number و Class مطلوبان للمواد الخطرة"
            : "UN Number and Class are required for dangerous goods";
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

  // Check if current section is valid (without setting errors)
  const isCurrentSectionValid = (): boolean => {
    if (currentSection === "route") {
      return !!(
        formData.origin_country &&
        formData.origin_city &&
        formData.port_of_loading &&
        formData.destination_country &&
        formData.destination_city &&
        formData.port_of_discharge
      );
    } else if (currentSection === "container") {
      return !!(formData.container_type && formData.cargo_ready_date);
    } else if (currentSection === "cargo") {
      const cargoValid = !!(
        formData.commodity_type &&
        formData.usage_type &&
        formData.total_weight &&
        formData.total_volume &&
        formData.cargo_value
      );
      const dangerousValid =
        !formData.is_dangerous ||
        !!(formData.un_number && formData.dangerous_class);
      return cargoValid && dangerousValid;
    } else if (currentSection === "services") {
      return !formData.pickup_required || !!formData.pickup_address;
    } else if (currentSection === "customer") {
      return !!(
        formData.full_name &&
        formData.country &&
        formData.phone &&
        formData.email &&
        formData.accepted_terms
      );
    }
    return true;
  };

  const handleNext = () => {
    // Validate current section before moving to next
    if (!validateSection(currentSection)) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    // Move to next section
    const sections = ["route", "container", "cargo", "services", "customer"];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
      // Clear errors when moving to next section
      setErrors({});
    }
  };

  const handlePrevious = () => {
    const sections = ["route", "container", "cargo", "services", "customer"];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
      // Clear errors when going back
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all sections including terms acceptance
    const routeValid = validateSection("route");
    const containerValid = validateSection("container");
    const cargoValid = validateSection("cargo");
    const servicesValid = validateSection("services");
    const customerValid = validateSection("customer");

    if (
      !routeValid ||
      !containerValid ||
      !cargoValid ||
      !servicesValid ||
      !customerValid
    ) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    // Double check terms acceptance
    if (!formData.accepted_terms) {
      setErrors((prev) => ({ ...prev, accepted_terms: t.required }));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const formDataToSend = new FormData();

      // Add user ID to form data (for debugging and verification)
      if (user && user.id) {
        formDataToSend.append("user_id", String(user.id));
        console.log("Adding user ID to form:", user.id);
      } else {
        console.warn("User ID not available - user may not be authenticated");
      }

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];

        // Skip null, undefined, and empty strings (except for files and booleans)
        if (value === null || value === undefined) {
          return;
        }

        if (key === "packing_list" || key === "photos") {
          // File fields
          if (value instanceof File) {
            formDataToSend.append(key, value);
          }
        } else if (
          key === "accepted_terms" ||
          key === "is_dangerous" ||
          key === "pickup_required" ||
          key === "forklift_available" ||
          key === "eu_export_clearance" ||
          key === "cargo_insurance" ||
          key === "on_carriage" ||
          key === "destination_customs_clearance"
        ) {
          // Boolean fields - always send
          formDataToSend.append(key, value ? "true" : "false");
        } else if (key === "number_of_containers") {
          // Integer field
          if (value !== "" && value !== null) {
            formDataToSend.append(key, String(value));
          }
        } else if (
          key === "total_weight" ||
          key === "total_volume" ||
          key === "cargo_value"
        ) {
          // Decimal fields
          if (value !== "" && value !== null && value !== undefined) {
            formDataToSend.append(key, String(value));
          }
        } else if (key === "cargo_ready_date") {
          // Date field
          if (value !== "" && value !== null) {
            formDataToSend.append(key, String(value));
          }
        } else {
          // String fields - skip empty strings for optional fields
          const optionalFields = [
            "origin_zip",
            "company_name",
            "un_number",
            "dangerous_class",
            "pickup_address",
          ];
          if (value !== "" || !optionalFields.includes(key)) {
            formDataToSend.append(key, String(value));
          }
        }
      });

      const response = await apiService.createFCLQuote(formDataToSend);

      // The API returns the created quote object, not a success flag
      if (response.data && (response.data.id || response.status === 201)) {
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
      console.error("Error details:", error.response?.data);
      setSubmitStatus("error");
      // Show error message to user
      if (error.response?.data?.error) {
        setErrors((prev) => ({ ...prev, api: error.response.data.error }));
      } else if (
        error.response?.data?.details &&
        process.env.NODE_ENV === "development"
      ) {
        setErrors((prev) => ({ ...prev, api: error.response.data.details }));
      } else {
        setErrors((prev) => ({
          ...prev,
          api:
            language === "ar"
              ? "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى."
              : "An error occurred while submitting your request. Please try again.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common ports list (you can expand this)
  const commonPorts = [
    // Netherlands
    "Rotterdam, Netherlands",
    "Amsterdam, Netherlands",
    "Vlissingen, Netherlands",
    "Terneuzen, Netherlands",
    // Belgium
    "Antwerp, Belgium",
    "Ghent, Belgium",
    "Zeebrugge, Belgium",
    "Brussels, Belgium",
    // Germany
    "Hamburg, Germany",
    "Bremen, Germany",
    "Bremerhaven, Germany",
    "Wilhelmshaven, Germany",
    "Rostock, Germany",
    "Lübeck, Germany",
    // France
    "Le Havre, France",
    "Marseille, France",
    "Dunkirk, France",
    "Nantes, France",
    "Bordeaux, France",
    "La Rochelle, France",
    // Italy
    "Genoa, Italy",
    "Naples, Italy",
    "La Spezia, Italy",
    "Livorno, Italy",
    "Venice, Italy",
    "Trieste, Italy",
    "Gioia Tauro, Italy",
    // Spain
    "Algeciras, Spain",
    "Valencia, Spain",
    "Barcelona, Spain",
    "Bilbao, Spain",
    "Cartagena, Spain",
    "Vigo, Spain",
    // United Kingdom
    "Felixstowe, United Kingdom",
    "Southampton, United Kingdom",
    "London, United Kingdom",
    "Liverpool, United Kingdom",
    "Bristol, United Kingdom",
    // Poland
    "Gdansk, Poland",
    "Gdynia, Poland",
    "Szczecin, Poland",
    "Swinoujscie, Poland",
    // Greece
    "Piraeus, Greece",
    "Thessaloniki, Greece",
    "Patras, Greece",
    "Heraklion, Greece",
    // Portugal
    "Lisbon, Portugal",
    "Leixoes, Portugal",
    "Sines, Portugal",
    // Denmark
    "Copenhagen, Denmark",
    "Aarhus, Denmark",
    // Sweden
    "Gothenburg, Sweden",
    "Stockholm, Sweden",
    "Malmö, Sweden",
    // Norway
    "Oslo, Norway",
    "Bergen, Norway",
    // Finland
    "Helsinki, Finland",
    "Turku, Finland",
    // Austria (via river ports)
    "Vienna, Austria",
    // Switzerland (via river ports)
    "Basel, Switzerland",
    // Croatia
    "Rijeka, Croatia",
    "Split, Croatia",
    // Romania
    "Constanta, Romania",
    // Bulgaria
    "Varna, Bulgaria",
    "Burgas, Bulgaria",
    // Turkey
    "Istanbul, Turkey",
    "Mersin, Turkey",
    "Izmir, Turkey",
    // Syria
    "Latakia, Syria",
    "Tartous, Syria",
    "Baniyas, Syria",
  ];

  // Progress calculation
  const sections = ["route", "container", "cargo", "services", "customer"];
  const currentStep = sections.indexOf(currentSection) + 1;
  const progress = (currentStep / sections.length) * 100;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initialize reCAPTCHA widget after component mounts and script loads
  useEffect(() => {
    if (!mounted || !isDevelopment || !recaptchaSiteKey) return;

    // Wait for script to load and widget element to exist
    const initRecaptcha = () => {
      const widgetElement = document.getElementById("recaptcha-widget-fcl");
      if (!widgetElement) {
        setTimeout(initRecaptcha, 200);
        return;
      }

      if (!window.grecaptcha) {
        setTimeout(initRecaptcha, 200);
        return;
      }

      // Check if already rendered
      if (widgetElement.hasChildNodes()) {
        setRecaptchaLoaded(true);
        return;
      }

      window.grecaptcha.ready(() => {
        try {
          const widgetId = window.grecaptcha!.render("recaptcha-widget-fcl", {
            sitekey: recaptchaSiteKey,
            size: "normal",
            theme: "light",
            callback: (token: string) => {
              console.log(
                "reCAPTCHA verified:",
                token.substring(0, 20) + "..."
              );
              setRecaptchaToken(token);
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired");
              setRecaptchaToken("");
            },
            "error-callback": () => {
              console.error("reCAPTCHA error");
              setRecaptchaToken("");
            },
          });
          console.log("reCAPTCHA widget rendered, widgetId:", widgetId);
          setRecaptchaLoaded(true);
        } catch (error) {
          console.error("Error rendering reCAPTCHA:", error);
          setRecaptchaLoaded(false);
        }
      });
    };

    // Start initialization after a delay to ensure script is loaded
    const timer = setTimeout(initRecaptcha, 1000);
    return () => clearTimeout(timer);
  }, [mounted, isDevelopment, recaptchaSiteKey]);

  // Check if reCAPTCHA is required and completed
  const isRecaptchaValid = useMemo(() => {
    // If no reCAPTCHA key is configured, it's not required
    if (!recaptchaSiteKey) {
      return true;
    }

    // In development mode with v2 widget (visible checkbox)
    // Button should be disabled if widget is loaded but not checked
    if (isDevelopment && recaptchaLoaded) {
      return !!recaptchaToken; // Must have token if widget is loaded
    }

    // In production with v3 (invisible, executed on submit)
    // Allow button to be enabled (v3 executes on submit)
    if (!isDevelopment) {
      return true;
    }

    // If widget hasn't loaded yet, allow button (will be disabled once loaded)
    return true;
  }, [recaptchaSiteKey, isDevelopment, recaptchaLoaded, recaptchaToken]);

  // Show loading state while checking authentication
  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* reCAPTCHA Script */}
      {isDevelopment && recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=explicit&hl=${language}`}
          strategy="lazyOnload"
          onLoad={() => {
            console.log("reCAPTCHA v2 script loaded successfully");
          }}
          onError={(e) => {
            console.error("Failed to load reCAPTCHA script:", e);
          }}
        />
      )}
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
                      {section === "route" && t.routeDetails}
                      {section === "container" && t.containerDetails}
                      {section === "cargo" && t.cargoDetails}
                      {section === "services" && t.additionalServices}
                      {section === "customer" && t.customerDetails}
                    </span>
                  </div>
                  {index < sections.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-all ${
                        index + 1 < currentStep
                          ? "bg-primary-yellow"
                          : "bg-gray-300"
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
                    <h2 className="text-3xl font-bold text-primary-dark">
                      {t.routeDetails}
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.originCountry}</span>
                        {!formData.origin_country && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <select
                        name="origin_country"
                        value={formData.origin_country}
                        onChange={(e) => {
                          handleChange(e);
                          setFormData((prev) => ({ ...prev, origin_city: "" })); // Reset city when country changes
                        }}
                        className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                          errors.origin_country
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-primary-yellow/50"
                        }`}
                      >
                        <option value="">
                          {language === "ar" ? "اختر البلد" : "Select Country"}
                        </option>
                        {Object.keys(europeanCountries).map((country) => (
                          <option key={country} value={country}>
                            {language === "ar"
                              ? europeanCountries[
                                  country as keyof typeof europeanCountries
                                ].ar.name
                              : country}
                          </option>
                        ))}
                      </select>
                      {errors.origin_country && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
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
                        {!formData.origin_city && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <select
                        name="origin_city"
                        value={formData.origin_city}
                        onChange={handleChange}
                        disabled={!formData.origin_country}
                        className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                          errors.origin_city
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-primary-yellow/50"
                        } ${
                          !formData.origin_country
                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      >
                        <option value="">
                          {formData.origin_country
                            ? language === "ar"
                              ? "اختر المدينة"
                              : "Select City"
                            : language === "ar"
                            ? "اختر البلد أولاً"
                            : "Select Country First"}
                        </option>
                        {formData.origin_country &&
                          europeanCountries[
                            formData.origin_country as keyof typeof europeanCountries
                          ]?.cities.map((city, index) => (
                            <option key={city} value={city}>
                              {language === "ar"
                                ? europeanCountries[
                                    formData.origin_country as keyof typeof europeanCountries
                                  ].ar.cities[index]
                                : city}
                            </option>
                          ))}
                      </select>
                      {errors.origin_city && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
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
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t.originZip}
                      </label>
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
                        {!formData.port_of_loading && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="port_of_loading"
                        value={formData.port_of_loading}
                        onChange={handleChange}
                        list="ports-list"
                        className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                          errors.port_of_loading
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-primary-yellow/50"
                        }`}
                        placeholder={
                          language === "ar"
                            ? "اختر أو اكتب الميناء"
                            : "Select or type port"
                        }
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
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
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
                        {!formData.destination_country && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <select
                        name="destination_country"
                        value={formData.destination_country}
                        onChange={(e) => {
                          handleChange(e);
                          setFormData((prev) => ({
                            ...prev,
                            destination_city: "",
                          })); // Reset city when country changes
                        }}
                        className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                          errors.destination_country
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-primary-yellow/50"
                        }`}
                      >
                        <option value="">
                          {language === "ar" ? "اختر البلد" : "Select Country"}
                        </option>
                        {/* Show Syria first for destination */}
                        <option value="Syria">
                          {language === "ar"
                            ? europeanCountries.Syria.ar.name
                            : "Syria"}
                        </option>
                        {Object.keys(europeanCountries)
                          .filter((c) => c !== "Syria")
                          .map((country) => (
                            <option key={country} value={country}>
                              {language === "ar"
                                ? europeanCountries[
                                    country as keyof typeof europeanCountries
                                  ].ar.name
                                : country}
                            </option>
                          ))}
                      </select>
                      {errors.destination_country && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
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
                        {!formData.destination_city && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <select
                        name="destination_city"
                        value={formData.destination_city}
                        onChange={handleChange}
                        disabled={!formData.destination_country}
                        className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                          errors.destination_city
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-primary-yellow/50"
                        } ${
                          !formData.destination_country
                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      >
                        <option value="">
                          {formData.destination_country
                            ? language === "ar"
                              ? "اختر المدينة"
                              : "Select City"
                            : language === "ar"
                            ? "اختر البلد أولاً"
                            : "Select Country First"}
                        </option>
                        {formData.destination_country &&
                          europeanCountries[
                            formData.destination_country as keyof typeof europeanCountries
                          ]?.cities.map((city, index) => (
                            <option key={city} value={city}>
                              {language === "ar"
                                ? europeanCountries[
                                    formData.destination_country as keyof typeof europeanCountries
                                  ].ar.cities[index]
                                : city}
                            </option>
                          ))}
                      </select>
                      {errors.destination_city && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
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
                        {!formData.port_of_discharge && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="port_of_discharge"
                        value={formData.port_of_discharge}
                        onChange={handleChange}
                        list="ports-list"
                        className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                          errors.port_of_discharge
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-primary-yellow/50"
                        }`}
                        placeholder={
                          language === "ar"
                            ? "اختر أو اكتب الميناء"
                            : "Select or type port"
                        }
                      />
                      {errors.port_of_discharge && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.port_of_discharge}
                        </motion.p>
                      )}
                    </motion.div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      disabled={!isCurrentSectionValid()}
                      whileHover={
                        isCurrentSectionValid() ? { scale: 1.05 } : {}
                      }
                      whileTap={isCurrentSectionValid() ? { scale: 0.95 } : {}}
                      className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                        isCurrentSectionValid()
                          ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-xl"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <span>{t.next}</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                              : "M14 5l7 7m0 0l-7 7m7-7H3"
                          }
                        />
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">
                      {t.containerDetails}
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.containerType}</span>
                        {!formData.container_type && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <select
                        name="container_type"
                        value={formData.container_type}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                          errors.container_type
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-primary-yellow/50"
                        }`}
                      >
                        <option value="">{t.containerType}</option>
                        <option value="20ft_standard">{t.container_20ft_standard}</option>
                        <option value="40ft_standard">{t.container_40ft_standard}</option>
                        <option value="40ft_high_cube">{t.container_40ft_high_cube}</option>
                        <option value="reefer">{t.container_reefer}</option>
                        <option value="open_top">{t.container_open_top}</option>
                        <option value="flat_rack">{t.container_flat_rack}</option>
                        <option value="flat_bed">{t.container_flat_bed}</option>
                        <option value="iso_tank">{t.container_iso_tank}</option>
                        <option value="bulk">{t.container_bulk}</option>
                        <option value="ventilated">{t.container_ventilated}</option>
                        <option value="insulated">{t.container_insulated}</option>
                        <option value="car_carrier">{t.container_car_carrier}</option>
                        <option value="double_door">{t.container_double_door}</option>
                        <option value="side_door">{t.container_side_door}</option>
                      </select>
                      
                      {/* View Container Images Button */}
                      <motion.button
                        type="button"
                        onClick={() => setShowContainerImages(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-2 w-full px-4 py-2 text-sm font-semibold text-primary-dark bg-gradient-to-r from-primary-yellow/20 to-primary-yellow/30 hover:from-primary-yellow/30 hover:to-primary-yellow/40 rounded-xl transition-all duration-200 border border-primary-yellow/30 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{t.viewContainerImages}</span>
                      </motion.button>
                      {errors.container_type && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
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
                        {!formData.number_of_containers && (
                          <span className="text-red-500">*</span>
                        )}
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
                        {!formData.cargo_ready_date && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="date"
                        name="cargo_ready_date"
                        value={formData.cargo_ready_date}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                          errors.cargo_ready_date
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-primary-yellow/50"
                        }`}
                      />
                      {errors.cargo_ready_date && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.cargo_ready_date}
                        </motion.p>
                      )}
                    </motion.div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M14 5l7 7m0 0l-7 7m7-7H3"
                              : "M10 19l-7-7m0 0l7-7m-7 7h18"
                          }
                        />
                      </svg>
                      {t.previous}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      disabled={!isCurrentSectionValid()}
                      whileHover={
                        isCurrentSectionValid() ? { scale: 1.05 } : {}
                      }
                      whileTap={isCurrentSectionValid() ? { scale: 0.95 } : {}}
                      className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                        isCurrentSectionValid()
                          ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-xl"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <span>{t.next}</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                              : "M14 5l7 7m0 0l-7 7m7-7H3"
                          }
                        />
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">
                      {t.cargoDetails}
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.commodityType}</span>
                        {!formData.commodity_type && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="commodity_type"
                        value={formData.commodity_type}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.commodity_type
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.commodity_type && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.commodity_type}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.usageType}</span>
                        {!formData.usage_type && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <select
                        name="usage_type"
                        value={formData.usage_type}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.usage_type
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">{t.usageType}</option>
                        <option value="commercial">{t.commercial}</option>
                        <option value="personal">{t.personal}</option>
                      </select>
                      {errors.usage_type && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.usage_type}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.totalWeight}</span>
                        {!formData.total_weight && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="number"
                        name="total_weight"
                        value={formData.total_weight}
                        onChange={handleChange}
                        step="0.01"
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.total_weight
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.total_weight && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.total_weight}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.totalVolume}</span>
                        {!formData.total_volume && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="number"
                        name="total_volume"
                        value={formData.total_volume}
                        onChange={handleChange}
                        step="0.01"
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.total_volume
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.total_volume && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.total_volume}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.cargoValue}</span>
                        {!formData.cargo_value && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="number"
                        name="cargo_value"
                        value={formData.cargo_value}
                        onChange={handleChange}
                        step="0.01"
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.cargo_value
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.cargo_value && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.cargo_value}
                        </p>
                      )}
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
                        {/* Info Box */}
                        <div className="md:col-span-2 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
                          <div className="flex items-start gap-3">
                            <svg
                              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div className="flex-1">
                              <h4 className="font-bold text-blue-900 mb-2 text-sm">
                                {t.dangerousGoodsInfo}
                              </h4>
                              <div className="space-y-2 text-xs text-blue-800">
                                <p>
                                  <strong>UN Number:</strong> {t.unNumberDescription}
                                </p>
                                <p>
                                  <strong>Class:</strong> {t.classDescription}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            {t.unNumber} *
                          </label>
                          <input
                            type="text"
                            name="un_number"
                            value={formData.un_number}
                            onChange={handleChange}
                            placeholder="مثال: UN 1202"
                            className={`w-full px-4 py-3 border rounded-lg ${
                              errors.dangerous
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            {t.dangerousClass} *
                          </label>
                          <input
                            type="text"
                            name="dangerous_class"
                            value={formData.dangerous_class}
                            onChange={handleChange}
                            placeholder="مثال: 3"
                            className={`w-full px-4 py-3 border rounded-lg ${
                              errors.dangerous
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.dangerous && (
                          <p className="text-red-600 text-sm mt-1 md:col-span-2">
                            {errors.dangerous}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M14 5l7 7m0 0l-7 7m7-7H3"
                              : "M10 19l-7-7m0 0l7-7m-7 7h18"
                          }
                        />
                      </svg>
                      {t.previous}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      disabled={!isCurrentSectionValid()}
                      whileHover={
                        isCurrentSectionValid() ? { scale: 1.05 } : {}
                      }
                      whileTap={isCurrentSectionValid() ? { scale: 0.95 } : {}}
                      className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                        isCurrentSectionValid()
                          ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-xl"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <span>{t.next}</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                              : "M14 5l7 7m0 0l-7 7m7-7H3"
                          }
                        />
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
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">
                      {t.additionalServices}
                    </h2>
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
                          <label className="block text-gray-700 font-semibold mb-2">
                            {t.pickupAddress} *
                          </label>
                          <textarea
                            name="pickup_address"
                            value={formData.pickup_address}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full px-4 py-3 border rounded-lg ${
                              errors.pickup_address
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.pickup_address && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.pickup_address}
                            </p>
                          )}
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

                    {/* Certificate of Origin */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.certificateOfOrigin}
                      </label>
                      <select
                        name="certificate_of_origin_type"
                        value={formData.certificate_of_origin_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-yellow focus:ring focus:ring-primary-yellow/20 transition-all duration-300"
                      >
                        <option value="none">{t.cert_none}</option>
                        <option value="non_preferential">{t.cert_non_preferential}</option>
                        <option value="preferential">{t.cert_preferential}</option>
                        <option value="chamber_of_commerce">{t.cert_chamber_of_commerce}</option>
                        <option value="manufacturer">{t.cert_manufacturer}</option>
                        <option value="electronic">{t.cert_electronic}</option>
                        <option value="eur1">{t.cert_eur1}</option>
                        <option value="eur_med">{t.cert_eur_med}</option>
                        <option value="gsp_form_a">{t.cert_gsp_form_a}</option>
                        <option value="consular">{t.cert_consular}</option>
                        <option value="product_specific">{t.cert_product_specific}</option>
                      </select>
                    </div>

                    {/* Destination Customs Clearance */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="destination_customs_clearance"
                          checked={formData.destination_customs_clearance}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>{t.destinationCustomsClearance}</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M14 5l7 7m0 0l-7 7m7-7H3"
                              : "M10 19l-7-7m0 0l7-7m-7 7h18"
                          }
                        />
                      </svg>
                      {t.previous}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      disabled={!isCurrentSectionValid()}
                      whileHover={
                        isCurrentSectionValid() ? { scale: 1.05 } : {}
                      }
                      whileTap={isCurrentSectionValid() ? { scale: 0.95 } : {}}
                      className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                        isCurrentSectionValid()
                          ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-xl"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <span>{t.next}</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                              : "M14 5l7 7m0 0l-7 7m7-7H3"
                          }
                        />
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary-dark">
                      {t.customerDetails}
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.fullName}</span>
                        {!formData.full_name && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.full_name
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.full_name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.full_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t.companyName}
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.customerCountry}</span>
                        {!formData.country && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          list="country-list"
                          placeholder={
                            language === "ar"
                              ? "اكتب أو اختر الدولة"
                              : "Type or select country"
                          }
                          className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
                            errors.country
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 hover:border-primary-yellow/50"
                          }`}
                        />
                        <datalist id="country-list">
                          {allCountries.map((country) => (
                            <option key={country.en} value={country.en}>
                              {language === "ar" ? country.ar : country.en}
                            </option>
                          ))}
                        </datalist>
                      </div>
                      {errors.country && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.phone}</span>
                        {!formData.phone && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.email}</span>
                        {!formData.email && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <span>{t.preferredContact}</span>
                        {!formData.preferred_contact && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
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
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t.packingList}
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, "packing_list")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        accept=".pdf,.doc,.docx"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t.photos}
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, "photos")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        accept="image/*"
                        multiple
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div
                        className={`p-4 rounded-lg border-2 transition-all ${
                          errors.accepted_terms
                            ? "border-red-500 bg-red-50"
                            : formData.accepted_terms
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="accepted_terms"
                            checked={formData.accepted_terms}
                            onChange={handleChange}
                            className="mr-3 w-5 h-5 text-primary-yellow rounded focus:ring-2 focus:ring-primary-yellow cursor-pointer"
                          />
                          <span className="text-gray-700">
                            {t.acceptTerms}{" "}
                            <a
                              href="/terms"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-yellow hover:underline font-semibold"
                            >
                              {t.privacyPolicy}
                            </a>
                            {!formData.accepted_terms && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </span>
                        </label>
                        {errors.accepted_terms && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.accepted_terms}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* reCAPTCHA Widget (Development Only) */}
                  {isDevelopment && recaptchaSiteKey && (
                    <div className="flex flex-col items-center justify-center py-4 mt-4">
                      <div
                        id="recaptcha-widget-fcl"
                        className="flex justify-center items-center min-h-[78px] w-full"
                        style={{ minWidth: "304px" }}
                      ></div>
                      {recaptchaSiteKey ===
                        "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" && (
                        <p className="mt-2 text-xs text-yellow-600 text-center">
                          {language === "ar"
                            ? "⚠️ استخدام مفتاح اختبار Google (localhost غير مدعوم)"
                            : "⚠️ Using Google test key (localhost not supported)"}
                        </p>
                      )}
                      {recaptchaLoaded && (
                        <p className="mt-2 text-xs text-gray-500 text-center">
                          {t.recaptchaDevelopment}
                        </p>
                      )}
                      {!recaptchaLoaded && (
                        <p className="mt-2 text-xs text-gray-400 text-center animate-pulse">
                          {t.recaptchaLoading}
                        </p>
                      )}
                    </div>
                  )}

                  {/* reCAPTCHA Required Message */}
                  {isDevelopment &&
                    recaptchaSiteKey &&
                    recaptchaLoaded &&
                    !recaptchaToken && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 rounded-r-lg flex items-start gap-3 mt-4">
                        <svg
                          className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {t.recaptchaRequired}
                        </span>
                      </div>
                    )}

                  {/* Submit Button */}
                  <div className="mt-8 flex justify-between">
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M14 5l7 7m0 0l-7 7m7-7H3"
                              : "M10 19l-7-7m0 0l7-7m-7 7h18"
                          }
                        />
                      </svg>
                      {t.previous}
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !formData.accepted_terms ||
                        !isRecaptchaValid
                      }
                      whileHover={
                        !isSubmitting && formData.accepted_terms
                          ? { scale: 1.05 }
                          : {}
                      }
                      whileTap={
                        !isSubmitting && formData.accepted_terms
                          ? { scale: 0.95 }
                          : {}
                      }
                      className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>
                            {language === "ar"
                              ? "جاري الإرسال..."
                              : "Sending..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
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
                        <svg
                          className="w-6 h-6 text-green-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
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
                        <svg
                          className="w-6 h-6 text-red-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
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

      {/* Container Images Modal */}
      <AnimatePresence>
        {showContainerImages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-dark to-primary-dark/90">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{t.viewContainerImages}</span>
                </h2>
                <button
                  onClick={() => setShowContainerImages(false)}
                  className="text-white hover:text-primary-yellow transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Container Images */}
                  {[
                    { image: "photo_2025-11-25_21-08-11.jpg", name: language === "ar" ? "حاوية 20 قدم قياسية" : "20ft Standard Container" },
                    { image: "photo_2025-11-25_21-08-12.jpg", name: language === "ar" ? "حاوية 40 قدم قياسية" : "40ft Standard Container" },
                    { image: "photo_2025-11-25_21-08-12 (2).jpg", name: language === "ar" ? "حاوية 40 قدم هاي كيوب" : "40ft High Cube Container" },
                    { image: "photo_2025-11-25_21-08-13.jpg", name: language === "ar" ? "حاوية مبردة" : "Reefer Container" },
                    { image: "photo_2025-11-25_21-08-14.jpg", name: language === "ar" ? "حاوية مفتوحة السقف" : "Open Top Container" },
                    { image: "photo_2025-11-25_21-08-15.jpg", name: language === "ar" ? "حاوية فلات راك" : "Flat Rack Container" },
                  ].map((container, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-primary-yellow transition-all"
                    >
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={`/images/containers/${container.image}`}
                          alt={container.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-800 text-center">
                          {container.name}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer language={language} />
    </div>
  );
}
