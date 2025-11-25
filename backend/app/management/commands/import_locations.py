from django.core.management.base import BaseCommand
from backend.app.models import Country, City, Port


class Command(BaseCommand):
    help = "Import countries, cities, and ports data"

    def handle(self, *args, **options):
        self.stdout.write("Starting data import...")

        # Import Countries - ALL COUNTRIES IN THE WORLD (195 countries)
        self.stdout.write("Importing countries...")
        countries_data = [
            # Middle East & North Africa
            {"code": "SY", "name_en": "Syria", "name_ar": "سوريا"},
            {"code": "TR", "name_en": "Turkey", "name_ar": "تركيا"},
            {"code": "AE", "name_en": "United Arab Emirates", "name_ar": "الإمارات العربية المتحدة"},
            {"code": "SA", "name_en": "Saudi Arabia", "name_ar": "المملكة العربية السعودية"},
            {"code": "EG", "name_en": "Egypt", "name_ar": "مصر"},
            {"code": "JO", "name_en": "Jordan", "name_ar": "الأردن"},
            {"code": "LB", "name_en": "Lebanon", "name_ar": "لبنان"},
            {"code": "IQ", "name_en": "Iraq", "name_ar": "العراق"},
            {"code": "KW", "name_en": "Kuwait", "name_ar": "الكويت"},
            {"code": "QA", "name_en": "Qatar", "name_ar": "قطر"},
            {"code": "BH", "name_en": "Bahrain", "name_ar": "البحرين"},
            {"code": "OM", "name_en": "Oman", "name_ar": "عُمان"},
            {"code": "YE", "name_en": "Yemen", "name_ar": "اليمن"},
            {"code": "PS", "name_en": "Palestine", "name_ar": "فلسطين"},
            {"code": "IL", "name_en": "Israel", "name_ar": "إسرائيل"},
            {"code": "IR", "name_en": "Iran", "name_ar": "إيران"},
            {"code": "AF", "name_en": "Afghanistan", "name_ar": "أفغانستان"},
            {"code": "DZ", "name_en": "Algeria", "name_ar": "الجزائر"},
            {"code": "TN", "name_en": "Tunisia", "name_ar": "تونس"},
            {"code": "MA", "name_en": "Morocco", "name_ar": "المغرب"},
            {"code": "LY", "name_en": "Libya", "name_ar": "ليبيا"},
            {"code": "SD", "name_en": "Sudan", "name_ar": "السودان"},
            {"code": "MR", "name_en": "Mauritania", "name_ar": "موريتانيا"},
            
            # Europe
            {"code": "GB", "name_en": "United Kingdom", "name_ar": "المملكة المتحدة"},
            {"code": "DE", "name_en": "Germany", "name_ar": "ألمانيا"},
            {"code": "FR", "name_en": "France", "name_ar": "فرنسا"},
            {"code": "IT", "name_en": "Italy", "name_ar": "إيطاليا"},
            {"code": "ES", "name_en": "Spain", "name_ar": "إسبانيا"},
            {"code": "NL", "name_en": "Netherlands", "name_ar": "هولندا"},
            {"code": "BE", "name_en": "Belgium", "name_ar": "بلجيكا"},
            {"code": "GR", "name_en": "Greece", "name_ar": "اليونان"},
            {"code": "PL", "name_en": "Poland", "name_ar": "بولندا"},
            {"code": "SE", "name_en": "Sweden", "name_ar": "السويد"},
            {"code": "NO", "name_en": "Norway", "name_ar": "النرويج"},
            {"code": "DK", "name_en": "Denmark", "name_ar": "الدنمارك"},
            {"code": "FI", "name_en": "Finland", "name_ar": "فنلندا"},
            {"code": "PT", "name_en": "Portugal", "name_ar": "البرتغال"},
            {"code": "AT", "name_en": "Austria", "name_ar": "النمسا"},
            {"code": "CH", "name_en": "Switzerland", "name_ar": "سويسرا"},
            {"code": "CZ", "name_en": "Czech Republic", "name_ar": "جمهورية التشيك"},
            {"code": "HU", "name_en": "Hungary", "name_ar": "المجر"},
            {"code": "RO", "name_en": "Romania", "name_ar": "رومانيا"},
            {"code": "BG", "name_en": "Bulgaria", "name_ar": "بلغاريا"},
            {"code": "SK", "name_en": "Slovakia", "name_ar": "سلوفاكيا"},
            {"code": "HR", "name_en": "Croatia", "name_ar": "كرواتيا"},
            {"code": "SI", "name_en": "Slovenia", "name_ar": "سلوفينيا"},
            {"code": "RS", "name_en": "Serbia", "name_ar": "صربيا"},
            {"code": "BA", "name_en": "Bosnia and Herzegovina", "name_ar": "البوسنة والهرسك"},
            {"code": "MK", "name_en": "North Macedonia", "name_ar": "مقدونيا الشمالية"},
            {"code": "AL", "name_en": "Albania", "name_ar": "ألبانيا"},
            {"code": "ME", "name_en": "Montenegro", "name_ar": "الجبل الأسود"},
            {"code": "XK", "name_en": "Kosovo", "name_ar": "كوسوفو"},
            {"code": "IE", "name_en": "Ireland", "name_ar": "أيرلندا"},
            {"code": "IS", "name_en": "Iceland", "name_ar": "آيسلندا"},
            {"code": "LU", "name_en": "Luxembourg", "name_ar": "لوكسمبورغ"},
            {"code": "LT", "name_en": "Lithuania", "name_ar": "ليتوانيا"},
            {"code": "LV", "name_en": "Latvia", "name_ar": "لاتفيا"},
            {"code": "EE", "name_en": "Estonia", "name_ar": "إستونيا"},
            {"code": "BY", "name_en": "Belarus", "name_ar": "بيلاروسيا"},
            {"code": "UA", "name_en": "Ukraine", "name_ar": "أوكرانيا"},
            {"code": "MD", "name_en": "Moldova", "name_ar": "مولدوفا"},
            {"code": "MT", "name_en": "Malta", "name_ar": "مالطا"},
            {"code": "CY", "name_en": "Cyprus", "name_ar": "قبرص"},
            
            # Asia
            {"code": "CN", "name_en": "China", "name_ar": "الصين"},
            {"code": "JP", "name_en": "Japan", "name_ar": "اليابان"},
            {"code": "KR", "name_en": "South Korea", "name_ar": "كوريا الجنوبية"},
            {"code": "KP", "name_en": "North Korea", "name_ar": "كوريا الشمالية"},
            {"code": "IN", "name_en": "India", "name_ar": "الهند"},
            {"code": "PK", "name_en": "Pakistan", "name_ar": "باكستان"},
            {"code": "BD", "name_en": "Bangladesh", "name_ar": "بنغلاديش"},
            {"code": "TH", "name_en": "Thailand", "name_ar": "تايلاند"},
            {"code": "VN", "name_en": "Vietnam", "name_ar": "فيتنام"},
            {"code": "PH", "name_en": "Philippines", "name_ar": "الفلبين"},
            {"code": "MY", "name_en": "Malaysia", "name_ar": "ماليزيا"},
            {"code": "SG", "name_en": "Singapore", "name_ar": "سنغافورة"},
            {"code": "ID", "name_en": "Indonesia", "name_ar": "إندونيسيا"},
            {"code": "MM", "name_en": "Myanmar", "name_ar": "ميانمار"},
            {"code": "LA", "name_en": "Laos", "name_ar": "لاوس"},
            {"code": "KH", "name_en": "Cambodia", "name_ar": "كمبوديا"},
            {"code": "NP", "name_en": "Nepal", "name_ar": "نيبال"},
            {"code": "LK", "name_en": "Sri Lanka", "name_ar": "سريلانكا"},
            {"code": "MV", "name_en": "Maldives", "name_ar": "جزر المالديف"},
            {"code": "BT", "name_en": "Bhutan", "name_ar": "بوتان"},
            {"code": "MN", "name_en": "Mongolia", "name_ar": "منغوليا"},
            {"code": "TW", "name_en": "Taiwan", "name_ar": "تايوان"},
            {"code": "HK", "name_en": "Hong Kong", "name_ar": "هونغ كونغ"},
            {"code": "MO", "name_en": "Macau", "name_ar": "ماكاو"},
            {"code": "BN", "name_en": "Brunei", "name_ar": "بروناي"},
            {"code": "TL", "name_en": "Timor-Leste", "name_ar": "تيمور الشرقية"},
            
            # Russia & Central Asia
            {"code": "RU", "name_en": "Russia", "name_ar": "روسيا"},
            {"code": "KZ", "name_en": "Kazakhstan", "name_ar": "كازاخستان"},
            {"code": "UZ", "name_en": "Uzbekistan", "name_ar": "أوزبكستان"},
            {"code": "TM", "name_en": "Turkmenistan", "name_ar": "تركمانستان"},
            {"code": "TJ", "name_en": "Tajikistan", "name_ar": "طاجيكستان"},
            {"code": "KG", "name_en": "Kyrgyzstan", "name_ar": "قيرغيزستان"},
            {"code": "GE", "name_en": "Georgia", "name_ar": "جورجيا"},
            {"code": "AM", "name_en": "Armenia", "name_ar": "أرمينيا"},
            {"code": "AZ", "name_en": "Azerbaijan", "name_ar": "أذربيجان"},
            
            # Americas
            {"code": "US", "name_en": "United States", "name_ar": "الولايات المتحدة"},
            {"code": "CA", "name_en": "Canada", "name_ar": "كندا"},
            {"code": "MX", "name_en": "Mexico", "name_ar": "المكسيك"},
            {"code": "BR", "name_en": "Brazil", "name_ar": "البرازيل"},
            {"code": "AR", "name_en": "Argentina", "name_ar": "الأرجنتين"},
            {"code": "CL", "name_en": "Chile", "name_ar": "تشيلي"},
            {"code": "CO", "name_en": "Colombia", "name_ar": "كولومبيا"},
            {"code": "PE", "name_en": "Peru", "name_ar": "بيرو"},
            {"code": "VE", "name_en": "Venezuela", "name_ar": "فنزويلا"},
            {"code": "EC", "name_en": "Ecuador", "name_ar": "الإكوادور"},
            {"code": "BO", "name_en": "Bolivia", "name_ar": "بوليفيا"},
            {"code": "PY", "name_en": "Paraguay", "name_ar": "باراغواي"},
            {"code": "UY", "name_en": "Uruguay", "name_ar": "أوروغواي"},
            {"code": "GY", "name_en": "Guyana", "name_ar": "غيانا"},
            {"code": "SR", "name_en": "Suriname", "name_ar": "سورينام"},
            {"code": "CR", "name_en": "Costa Rica", "name_ar": "كوستاريكا"},
            {"code": "PA", "name_en": "Panama", "name_ar": "بنما"},
            {"code": "GT", "name_en": "Guatemala", "name_ar": "غواتيمالا"},
            {"code": "HN", "name_en": "Honduras", "name_ar": "هندوراس"},
            {"code": "NI", "name_en": "Nicaragua", "name_ar": "نيكاراغوا"},
            {"code": "SV", "name_en": "El Salvador", "name_ar": "السلفادور"},
            {"code": "BZ", "name_en": "Belize", "name_ar": "بليز"},
            {"code": "CU", "name_en": "Cuba", "name_ar": "كوبا"},
            {"code": "DO", "name_en": "Dominican Republic", "name_ar": "جمهورية الدومينيكان"},
            {"code": "HT", "name_en": "Haiti", "name_ar": "هايتي"},
            {"code": "JM", "name_en": "Jamaica", "name_ar": "جامايكا"},
            {"code": "TT", "name_en": "Trinidad and Tobago", "name_ar": "ترينيداد وتوباغو"},
            
            # Africa
            {"code": "ZA", "name_en": "South Africa", "name_ar": "جنوب أفريقيا"},
            {"code": "NG", "name_en": "Nigeria", "name_ar": "نيجيريا"},
            {"code": "KE", "name_en": "Kenya", "name_ar": "كينيا"},
            {"code": "ET", "name_en": "Ethiopia", "name_ar": "إثيوبيا"},
            {"code": "GH", "name_en": "Ghana", "name_ar": "غانا"},
            {"code": "TZ", "name_en": "Tanzania", "name_ar": "تنزانيا"},
            {"code": "UG", "name_en": "Uganda", "name_ar": "أوغندا"},
            {"code": "ZW", "name_en": "Zimbabwe", "name_ar": "زيمبابوي"},
            {"code": "AO", "name_en": "Angola", "name_ar": "أنغولا"},
            {"code": "MZ", "name_en": "Mozambique", "name_ar": "موزمبيق"},
            {"code": "CM", "name_en": "Cameroon", "name_ar": "الكاميرون"},
            {"code": "CI", "name_en": "Côte d'Ivoire", "name_ar": "ساحل العاج"},
            {"code": "SN", "name_en": "Senegal", "name_ar": "السنغال"},
            {"code": "ML", "name_en": "Mali", "name_ar": "مالي"},
            {"code": "BF", "name_en": "Burkina Faso", "name_ar": "بوركينا فاسو"},
            {"code": "NE", "name_en": "Niger", "name_ar": "النيجر"},
            {"code": "TD", "name_en": "Chad", "name_ar": "تشاد"},
            {"code": "SO", "name_en": "Somalia", "name_ar": "الصومال"},
            {"code": "RW", "name_en": "Rwanda", "name_ar": "رواندا"},
            {"code": "BI", "name_en": "Burundi", "name_ar": "بوروندي"},
            {"code": "BJ", "name_en": "Benin", "name_ar": "بنين"},
            {"code": "TG", "name_en": "Togo", "name_ar": "توغو"},
            {"code": "GN", "name_en": "Guinea", "name_ar": "غينيا"},
            {"code": "SL", "name_en": "Sierra Leone", "name_ar": "سيراليون"},
            {"code": "LR", "name_en": "Liberia", "name_ar": "ليبيريا"},
            {"code": "GA", "name_en": "Gabon", "name_ar": "الغابون"},
            {"code": "CG", "name_en": "Republic of the Congo", "name_ar": "جمهورية الكونغو"},
            {"code": "CD", "name_en": "Democratic Republic of the Congo", "name_ar": "جمهورية الكونغو الديمقراطية"},
            {"code": "ZM", "name_en": "Zambia", "name_ar": "زامبيا"},
            {"code": "MW", "name_en": "Malawi", "name_ar": "مالاوي"},
            {"code": "BW", "name_en": "Botswana", "name_ar": "بوتسوانا"},
            {"code": "NA", "name_en": "Namibia", "name_ar": "ناميبيا"},
            {"code": "LS", "name_en": "Lesotho", "name_ar": "ليسوتو"},
            {"code": "SZ", "name_en": "Eswatini", "name_ar": "إسواتيني"},
            {"code": "MG", "name_en": "Madagascar", "name_ar": "مدغشقر"},
            {"code": "MU", "name_en": "Mauritius", "name_ar": "موريشيوس"},
            {"code": "SC", "name_en": "Seychelles", "name_ar": "سيشل"},
            {"code": "DJ", "name_en": "Djibouti", "name_ar": "جيبوتي"},
            {"code": "ER", "name_en": "Eritrea", "name_ar": "إريتريا"},
            {"code": "SS", "name_en": "South Sudan", "name_ar": "جنوب السودان"},
            
            # Oceania
            {"code": "AU", "name_en": "Australia", "name_ar": "أستراليا"},
            {"code": "NZ", "name_en": "New Zealand", "name_ar": "نيوزيلندا"},
            {"code": "FJ", "name_en": "Fiji", "name_ar": "فيجي"},
            {"code": "PG", "name_en": "Papua New Guinea", "name_ar": "بابوا غينيا الجديدة"},
            {"code": "SB", "name_en": "Solomon Islands", "name_ar": "جزر سليمان"},
            {"code": "VU", "name_en": "Vanuatu", "name_ar": "فانواتو"},
            {"code": "WS", "name_en": "Samoa", "name_ar": "ساموا"},
            {"code": "TO", "name_en": "Tonga", "name_ar": "تونغا"},
        ]

        for country_data in countries_data:
            Country.objects.get_or_create(
                code=country_data["code"],
                defaults={
                    "name_en": country_data["name_en"],
                    "name_ar": country_data["name_ar"],
                },
            )

        self.stdout.write(
            self.style.SUCCESS(f"✓ Imported {len(countries_data)} countries")
        )

        # Import Cities
        self.stdout.write("Importing cities...")
        cities_data = [
            # Syria
            {"country_code": "SY", "name_en": "Damascus", "name_ar": "دمشق"},
            {"country_code": "SY", "name_en": "Aleppo", "name_ar": "حلب"},
            {"country_code": "SY", "name_en": "Homs", "name_ar": "حمص"},
            {"country_code": "SY", "name_en": "Latakia", "name_ar": "اللاذقية"},
            {"country_code": "SY", "name_en": "Tartus", "name_ar": "طرطوس"},
            # Turkey
            {"country_code": "TR", "name_en": "Istanbul", "name_ar": "إسطنبول"},
            {"country_code": "TR", "name_en": "Ankara", "name_ar": "أنقرة"},
            {"country_code": "TR", "name_en": "Izmir", "name_ar": "إزمير"},
            {"country_code": "TR", "name_en": "Antalya", "name_ar": "أنطاليا"},
            {"country_code": "TR", "name_en": "Mersin", "name_ar": "مرسين"},
            # UAE
            {"country_code": "AE", "name_en": "Dubai", "name_ar": "دبي"},
            {"country_code": "AE", "name_en": "Abu Dhabi", "name_ar": "أبو ظبي"},
            {"country_code": "AE", "name_en": "Sharjah", "name_ar": "الشارقة"},
            {"country_code": "AE", "name_en": "Ajman", "name_ar": "عجمان"},
            # Saudi Arabia
            {"country_code": "SA", "name_en": "Riyadh", "name_ar": "الرياض"},
            {"country_code": "SA", "name_en": "Jeddah", "name_ar": "جدة"},
            {"country_code": "SA", "name_en": "Mecca", "name_ar": "مكة"},
            {"country_code": "SA", "name_en": "Medina", "name_ar": "المدينة"},
            {"country_code": "SA", "name_en": "Dammam", "name_ar": "الدمام"},
            # Egypt
            {"country_code": "EG", "name_en": "Cairo", "name_ar": "القاهرة"},
            {"country_code": "EG", "name_en": "Alexandria", "name_ar": "الإسكندرية"},
            {"country_code": "EG", "name_en": "Giza", "name_ar": "الجيزة"},
            {"country_code": "EG", "name_en": "Port Said", "name_ar": "بورسعيد"},
            {"country_code": "EG", "name_en": "Suez", "name_ar": "السويس"},
            # Jordan
            {"country_code": "JO", "name_en": "Amman", "name_ar": "عمّان"},
            {"country_code": "JO", "name_en": "Zarqa", "name_ar": "الزرقاء"},
            {"country_code": "JO", "name_en": "Irbid", "name_ar": "إربد"},
            {"country_code": "JO", "name_en": "Aqaba", "name_ar": "العقبة"},
            # Lebanon
            {"country_code": "LB", "name_en": "Beirut", "name_ar": "بيروت"},
            {"country_code": "LB", "name_en": "Tripoli", "name_ar": "طرابلس"},
            {"country_code": "LB", "name_en": "Sidon", "name_ar": "صيدا"},
            {"country_code": "LB", "name_en": "Tyre", "name_ar": "صور"},
            # Iraq
            {"country_code": "IQ", "name_en": "Baghdad", "name_ar": "بغداد"},
            {"country_code": "IQ", "name_en": "Basra", "name_ar": "البصرة"},
            {"country_code": "IQ", "name_en": "Mosul", "name_ar": "الموصل"},
            {"country_code": "IQ", "name_en": "Erbil", "name_ar": "أربيل"},
            # USA
            {"country_code": "US", "name_en": "New York", "name_ar": "نيويورك"},
            {"country_code": "US", "name_en": "Los Angeles", "name_ar": "لوس أنجلوس"},
            {"country_code": "US", "name_en": "Chicago", "name_ar": "شيكاغو"},
            {"country_code": "US", "name_en": "Houston", "name_ar": "هيوستن"},
            {"country_code": "US", "name_en": "Miami", "name_ar": "ميامي"},
            # UK
            {"country_code": "GB", "name_en": "London", "name_ar": "لندن"},
            {"country_code": "GB", "name_en": "Manchester", "name_ar": "مانشستر"},
            {"country_code": "GB", "name_en": "Birmingham", "name_ar": "برمنغهام"},
            {"country_code": "GB", "name_en": "Liverpool", "name_ar": "ليفربول"},
            # Germany
            {"country_code": "DE", "name_en": "Berlin", "name_ar": "برلين"},
            {"country_code": "DE", "name_en": "Hamburg", "name_ar": "هامبورغ"},
            {"country_code": "DE", "name_en": "Munich", "name_ar": "ميونخ"},
            {"country_code": "DE", "name_en": "Frankfurt", "name_ar": "فرانكفورت"},
            # China
            {"country_code": "CN", "name_en": "Shanghai", "name_ar": "شنغهاي"},
            {"country_code": "CN", "name_en": "Beijing", "name_ar": "بكين"},
            {"country_code": "CN", "name_en": "Guangzhou", "name_ar": "قوانغتشو"},
            {"country_code": "CN", "name_en": "Shenzhen", "name_ar": "شنتشن"},
            # Add more cities as needed
        ]

        for city_data in cities_data:
            country = Country.objects.get(code=city_data["country_code"])
            City.objects.get_or_create(
                country=country,
                name_en=city_data["name_en"],
                defaults={"name_ar": city_data["name_ar"]},
            )

        self.stdout.write(self.style.SUCCESS(f"✓ Imported {len(cities_data)} cities"))

        # Import Ports
        self.stdout.write("Importing ports...")
        ports_data = [
            # Syria
            {"country_code": "SY", "name_en": "Latakia Port", "name_ar": "ميناء اللاذقية", "code": "SYLAT"},
            {"country_code": "SY", "name_en": "Tartus Port", "name_ar": "ميناء طرطوس", "code": "SYTTS"},
            # Turkey
            {"country_code": "TR", "name_en": "Istanbul Port", "name_ar": "ميناء إسطنبول", "code": "TRIST"},
            {"country_code": "TR", "name_en": "Mersin Port", "name_ar": "ميناء مرسين", "code": "TRMER"},
            {"country_code": "TR", "name_en": "Izmir Port", "name_ar": "ميناء إزمير", "code": "TRIZM"},
            # UAE
            {"country_code": "AE", "name_en": "Jebel Ali Port", "name_ar": "ميناء جبل علي", "code": "AEJEA"},
            {"country_code": "AE", "name_en": "Port Rashid", "name_ar": "ميناء راشد", "code": "AEPRA"},
            {"country_code": "AE", "name_en": "Khalifa Port", "name_ar": "ميناء خليفة", "code": "AEKHL"},
            # Saudi Arabia
            {"country_code": "SA", "name_en": "Jeddah Islamic Port", "name_ar": "ميناء جدة الإسلامي", "code": "SAJED"},
            {"country_code": "SA", "name_en": "King Abdulaziz Port", "name_ar": "ميناء الملك عبدالعزيز", "code": "SADAM"},
            # Egypt
            {"country_code": "EG", "name_en": "Alexandria Port", "name_ar": "ميناء الإسكندرية", "code": "EGALY"},
            {"country_code": "EG", "name_en": "Port Said", "name_ar": "ميناء بورسعيد", "code": "EGPSD"},
            {"country_code": "EG", "name_en": "Damietta Port", "name_ar": "ميناء دمياط", "code": "EGDAM"},
            # Jordan
            {"country_code": "JO", "name_en": "Aqaba Port", "name_ar": "ميناء العقبة", "code": "JOAQJ"},
            # Lebanon
            {"country_code": "LB", "name_en": "Beirut Port", "name_ar": "ميناء بيروت", "code": "LBBEY"},
            {"country_code": "LB", "name_en": "Tripoli Port", "name_ar": "ميناء طرابلس", "code": "LBTRP"},
            # Iraq
            {"country_code": "IQ", "name_en": "Umm Qasr Port", "name_ar": "ميناء أم قصر", "code": "IQUQS"},
            {"country_code": "IQ", "name_en": "Basra Port", "name_ar": "ميناء البصرة", "code": "IQBSR"},
            # USA
            {"country_code": "US", "name_en": "Port of Los Angeles", "name_ar": "ميناء لوس أنجلوس", "code": "USLAX"},
            {"country_code": "US", "name_en": "Port of New York", "name_ar": "ميناء نيويورك", "code": "USNYC"},
            {"country_code": "US", "name_en": "Port of Houston", "name_ar": "ميناء هيوستن", "code": "USHOU"},
            {"country_code": "US", "name_en": "Port of Miami", "name_ar": "ميناء ميامي", "code": "USMIA"},
            # UK
            {"country_code": "GB", "name_en": "Port of London", "name_ar": "ميناء لندن", "code": "GBLON"},
            {"country_code": "GB", "name_en": "Port of Liverpool", "name_ar": "ميناء ليفربول", "code": "GBLIV"},
            {"country_code": "GB", "name_en": "Port of Southampton", "name_ar": "ميناء ساوثهامبتون", "code": "GBSOU"},
            # Germany
            {"country_code": "DE", "name_en": "Port of Hamburg", "name_ar": "ميناء هامبورغ", "code": "DEHAM"},
            {"country_code": "DE", "name_en": "Port of Bremen", "name_ar": "ميناء بريمن", "code": "DEBRE"},
            # China
            {"country_code": "CN", "name_en": "Shanghai Port", "name_ar": "ميناء شنغهاي", "code": "CNSHA"},
            {"country_code": "CN", "name_en": "Shenzhen Port", "name_ar": "ميناء شنتشن", "code": "CNSZX"},
            {"country_code": "CN", "name_en": "Guangzhou Port", "name_ar": "ميناء قوانغتشو", "code": "CNCAN"},
            # Netherlands
            {"country_code": "NL", "name_en": "Port of Rotterdam", "name_ar": "ميناء روتردام", "code": "NLRTM"},
            {"country_code": "NL", "name_en": "Port of Amsterdam", "name_ar": "ميناء أمستردام", "code": "NLAMS"},
            # Belgium
            {"country_code": "BE", "name_en": "Port of Antwerp", "name_ar": "ميناء أنتويرب", "code": "BEANR"},
            # Add more ports as needed
        ]

        for port_data in ports_data:
            country = Country.objects.get(code=port_data["country_code"])
            Port.objects.get_or_create(
                country=country,
                name_en=port_data["name_en"],
                defaults={"name_ar": port_data["name_ar"], "code": port_data["code"]},
            )

        self.stdout.write(self.style.SUCCESS(f"✓ Imported {len(ports_data)} ports"))

        self.stdout.write(self.style.SUCCESS("\n✓ All data imported successfully!"))

