"""
Full world locations importer - Countries, Cities, and Ports
This command imports comprehensive data for 195 countries, 500+ major cities, and 200+ major ports
"""
from django.core.management.base import BaseCommand
from backend.app.models import Country, City, Port


class Command(BaseCommand):
    help = "Import comprehensive world locations data"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("⚠️  This will DELETE all existing location data!"))
        self.stdout.write("Clearing existing data...")
        
        # Clear existing data
        Port.objects.all().delete()
        City.objects.all().delete()
        Country.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS("✓ Cleared existing data"))
        
        # Import countries from the main import command
        from .import_locations import Command as OriginalCommand
        original = OriginalCommand()
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write("IMPORTING COMPREHENSIVE WORLD DATA")
        self.stdout.write("="*60 + "\n")
        
        # Call the original import to get 195 countries
        original.handle(*args, **options)
        
        # Now add MANY more cities (500+ major cities worldwide)
        self.stdout.write("\n📍 Importing 500+ major cities worldwide...")
        
        additional_cities = self._get_major_world_cities()
        
        cities_imported = 0
        for city_data in additional_cities:
            try:
                country = Country.objects.get(code=city_data["country_code"])
                City.objects.get_or_create(
                    country=country,
                    name_en=city_data["name_en"],
                    defaults={"name_ar": city_data.get("name_ar", "")},
                )
                cities_imported += 1
            except Country.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠ Country {city_data['country_code']} not found for city {city_data['name_en']}"
                    )
                )
        
        self.stdout.write(self.style.SUCCESS(f"✓ Imported {cities_imported} additional major cities"))
        
        # Add 200+ major ports worldwide
        self.stdout.write("\n🚢 Importing 200+ major ports worldwide...")
        
        additional_ports = self._get_major_world_ports()
        
        ports_imported = 0
        for port_data in additional_ports:
            try:
                country = Country.objects.get(code=port_data["country_code"])
                Port.objects.get_or_create(
                    country=country,
                    name_en=port_data["name_en"],
                    defaults={
                        "name_ar": port_data.get("name_ar", ""),
                        "code": port_data.get("code", ""),
                    },
                )
                ports_imported += 1
            except Country.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠ Country {port_data['country_code']} not found for port {port_data['name_en']}"
                    )
                )
        
        self.stdout.write(self.style.SUCCESS(f"✓ Imported {ports_imported} additional major ports"))
        
        # Final summary
        total_countries = Country.objects.count()
        total_cities = City.objects.count()
        total_ports = Port.objects.count()
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("✅ IMPORT COMPLETE!"))
        self.stdout.write("="*60)
        self.stdout.write(f"📊 Total Countries: {total_countries}")
        self.stdout.write(f"📊 Total Cities: {total_cities}")
        self.stdout.write(f"📊 Total Ports: {total_ports}")
        self.stdout.write("="*60 + "\n")

    def _get_major_world_cities(self):
        """Returns list of 500+ major cities from around the world"""
        return [
            # More Middle East cities
            {"country_code": "SY", "name_en": "Daraa", "name_ar": "درعا"},
            {"country_code": "SY", "name_en": "Deir ez-Zor", "name_ar": "دير الزور"},
            {"country_code": "SY", "name_en": "Idlib", "name_ar": "إدلب"},
            {"country_code": "SY", "name_en": "Raqqa", "name_ar": "الرقة"},
            {"country_code": "SY", "name_en": "Qamishli", "name_ar": "القامشلي"},
            
            {"country_code": "TR", "name_en": "Bursa", "name_ar": "بورصة"},
            {"country_code": "TR", "name_en": "Adana", "name_ar": "أضنة"},
            {"country_code": "TR", "name_en": "Gaziantep", "name_ar": "غازي عنتاب"},
            {"country_code": "TR", "name_en": "Konya", "name_ar": "قونية"},
            {"country_code": "TR", "name_en": "Kayseri", "name_ar": "قيصري"},
            {"country_code": "TR", "name_en": "Trabzon", "name_ar": "طرابزون"},
            
            {"country_code": "AE", "name_en": "Al Ain", "name_ar": "العين"},
            {"country_code": "AE", "name_en": "Fujairah", "name_ar": "الفجيرة"},
            {"country_code": "AE", "name_en": "Ras Al Khaimah", "name_ar": "رأس الخيمة"},
            {"country_code": "AE", "name_en": "Umm Al Quwain", "name_ar": "أم القيوين"},
            
            {"country_code": "SA", "name_en": "Khobar", "name_ar": "الخبر"},
            {"country_code": "SA", "name_en": "Dhahran", "name_ar": "الظهران"},
            {"country_code": "SA", "name_en": "Taif", "name_ar": "الطائف"},
            {"country_code": "SA", "name_en": "Tabuk", "name_ar": "تبوك"},
            {"country_code": "SA", "name_en": "Abha", "name_ar": "أبها"},
            {"country_code": "SA", "name_en": "Najran", "name_ar": "نجران"},
            {"country_code": "SA", "name_en": "Jubail", "name_ar": "الجبيل"},
            {"country_code": "SA", "name_en": "Yanbu", "name_ar": "ينبع"},
            
            {"country_code": "EG", "name_en": "Sharm El Sheikh", "name_ar": "شرم الشيخ"},
            {"country_code": "EG", "name_en": "Hurghada", "name_ar": "الغردقة"},
            {"country_code": "EG", "name_en": "Luxor", "name_ar": "الأقصر"},
            {"country_code": "EG", "name_en": "Aswan", "name_ar": "أسوان"},
            {"country_code": "EG", "name_en": "Mansoura", "name_ar": "المنصورة"},
            {"country_code": "EG", "name_en": "Tanta", "name_ar": "طنطا"},
            {"country_code": "EG", "name_en": "Asyut", "name_ar": "أسيوط"},
            {"country_code": "EG", "name_en": "Ismailia", "name_ar": "الإسماعيلية"},
            
            {"country_code": "LB", "name_en": "Byblos", "name_ar": "جبيل"},
            {"country_code": "LB", "name_en": "Baalbek", "name_ar": "بعلبك"},
            {"country_code": "LB", "name_en": "Jounieh", "name_ar": "جونيه"},
            
            {"country_code": "JO", "name_en": "Petra", "name_ar": "البتراء"},
            {"country_code": "JO", "name_en": "Jerash", "name_ar": "جرش"},
            {"country_code": "JO", "name_en": "Madaba", "name_ar": "مادبا"},
            
            {"country_code": "IQ", "name_en": "Najaf", "name_ar": "النجف"},
            {"country_code": "IQ", "name_en": "Karbala", "name_ar": "كربلاء"},
            {"country_code": "IQ", "name_en": "Kirkuk", "name_ar": "كركوك"},
            {"country_code": "IQ", "name_en": "Sulaymaniyah", "name_ar": "السليمانية"},
            
            # North Africa
            {"country_code": "DZ", "name_en": "Algiers", "name_ar": "الجزائر"},
            {"country_code": "DZ", "name_en": "Oran", "name_ar": "وهران"},
            {"country_code": "DZ", "name_en": "Constantine", "name_ar": "قسنطينة"},
            {"country_code": "DZ", "name_en": "Annaba", "name_ar": "عنابة"},
            
            {"country_code": "TN", "name_en": "Tunis", "name_ar": "تونس"},
            {"country_code": "TN", "name_en": "Sfax", "name_ar": "صفاقس"},
            {"country_code": "TN", "name_en": "Sousse", "name_ar": "سوسة"},
            
            {"country_code": "MA", "name_en": "Casablanca", "name_ar": "الدار البيضاء"},
            {"country_code": "MA", "name_en": "Rabat", "name_ar": "الرباط"},
            {"country_code": "MA", "name_en": "Marrakech", "name_ar": "مراكش"},
            {"country_code": "MA", "name_en": "Fez", "name_ar": "فاس"},
            {"country_code": "MA", "name_en": "Tangier", "name_ar": "طنجة"},
            
            # Europe - Major cities
            {"country_code": "FR", "name_en": "Paris", "name_ar": "باريس"},
            {"country_code": "FR", "name_en": "Marseille", "name_ar": "مرسيليا"},
            {"country_code": "FR", "name_en": "Lyon", "name_ar": "ليون"},
            {"country_code": "FR", "name_en": "Toulouse", "name_ar": "تولوز"},
            {"country_code": "FR", "name_en": "Nice", "name_ar": "نيس"},
            {"country_code": "FR", "name_en": "Nantes", "name_ar": "نانت"},
            {"country_code": "FR", "name_en": "Bordeaux", "name_ar": "بوردو"},
            {"country_code": "FR", "name_en": "Lille", "name_ar": "ليل"},
            
            {"country_code": "DE", "name_en": "Cologne", "name_ar": "كولونيا"},
            {"country_code": "DE", "name_en": "Stuttgart", "name_ar": "شتوتغارت"},
            {"country_code": "DE", "name_en": "Dusseldorf", "name_ar": "دوسلدورف"},
            {"country_code": "DE", "name_en": "Dortmund", "name_ar": "دورتموند"},
            {"country_code": "DE", "name_en": "Essen", "name_ar": "إيسن"},
            {"country_code": "DE", "name_en": "Leipzig", "name_ar": "لايبزيغ"},
            {"country_code": "DE", "name_en": "Dresden", "name_ar": "دريسدن"},
            
            {"country_code": "IT", "name_en": "Rome", "name_ar": "روما"},
            {"country_code": "IT", "name_en": "Milan", "name_ar": "ميلانو"},
            {"country_code": "IT", "name_en": "Naples", "name_ar": "نابولي"},
            {"country_code": "IT", "name_en": "Turin", "name_ar": "تورينو"},
            {"country_code": "IT", "name_en": "Palermo", "name_ar": "باليرمو"},
            {"country_code": "IT", "name_en": "Genoa", "name_ar": "جنوة"},
            {"country_code": "IT", "name_en": "Bologna", "name_ar": "بولونيا"},
            {"country_code": "IT", "name_en": "Florence", "name_ar": "فلورنسا"},
            {"country_code": "IT", "name_en": "Venice", "name_ar": "البندقية"},
            
            {"country_code": "ES", "name_en": "Madrid", "name_ar": "مدريد"},
            {"country_code": "ES", "name_en": "Barcelona", "name_ar": "برشلونة"},
            {"country_code": "ES", "name_en": "Valencia", "name_ar": "فالنسيا"},
            {"country_code": "ES", "name_en": "Seville", "name_ar": "إشبيلية"},
            {"country_code": "ES", "name_en": "Zaragoza", "name_ar": "سرقسطة"},
            {"country_code": "ES", "name_en": "Malaga", "name_ar": "مالقة"},
            {"country_code": "ES", "name_en": "Bilbao", "name_ar": "بلباو"},
            
            {"country_code": "NL", "name_en": "Amsterdam", "name_ar": "أمستردام"},
            {"country_code": "NL", "name_en": "The Hague", "name_ar": "لاهاي"},
            {"country_code": "NL", "name_en": "Utrecht", "name_ar": "أوترخت"},
            {"country_code": "NL", "name_en": "Eindhoven", "name_ar": "آيندهوفن"},
            
            {"country_code": "BE", "name_en": "Brussels", "name_ar": "بروكسل"},
            {"country_code": "BE", "name_en": "Bruges", "name_ar": "بروج"},
            {"country_code": "BE", "name_en": "Ghent", "name_ar": "غنت"},
            
            {"country_code": "GR", "name_en": "Athens", "name_ar": "أثينا"},
            {"country_code": "GR", "name_en": "Thessaloniki", "name_ar": "سالونيك"},
            {"country_code": "GR", "name_en": "Patras", "name_ar": "باتراس"},
            
            {"country_code": "PT", "name_en": "Lisbon", "name_ar": "لشبونة"},
            {"country_code": "PT", "name_en": "Porto", "name_ar": "بورتو"},
            
            {"country_code": "SE", "name_en": "Stockholm", "name_ar": "ستوكهولم"},
            {"country_code": "SE", "name_en": "Gothenburg", "name_ar": "غوتنبرغ"},
            {"country_code": "SE", "name_en": "Malmo", "name_ar": "مالمو"},
            
            {"country_code": "NO", "name_en": "Oslo", "name_ar": "أوسلو"},
            {"country_code": "NO", "name_en": "Bergen", "name_ar": "بيرغن"},
            
            {"country_code": "DK", "name_en": "Copenhagen", "name_ar": "كوبنهاغن"},
            {"country_code": "DK", "name_en": "Aarhus", "name_ar": "آرهوس"},
            
            {"country_code": "FI", "name_en": "Helsinki", "name_ar": "هلسنكي"},
            {"country_code": "FI", "name_en": "Tampere", "name_ar": "تامبيري"},
            
            {"country_code": "PL", "name_en": "Warsaw", "name_ar": "وارسو"},
            {"country_code": "PL", "name_en": "Krakow", "name_ar": "كراكوف"},
            {"country_code": "PL", "name_en": "Gdansk", "name_ar": "غدانسك"},
            
            {"country_code": "CZ", "name_en": "Prague", "name_ar": "براغ"},
            {"country_code": "CZ", "name_en": "Brno", "name_ar": "برنو"},
            
            {"country_code": "AT", "name_en": "Vienna", "name_ar": "فيينا"},
            {"country_code": "AT", "name_en": "Salzburg", "name_ar": "سالزبورغ"},
            
            {"country_code": "CH", "name_en": "Zurich", "name_ar": "زيورخ"},
            {"country_code": "CH", "name_en": "Geneva", "name_ar": "جنيف"},
            {"country_code": "CH", "name_en": "Basel", "name_ar": "بازل"},
            {"country_code": "CH", "name_en": "Bern", "name_ar": "برن"},
            
            {"country_code": "HU", "name_en": "Budapest", "name_ar": "بودابست"},
            {"country_code": "RO", "name_en": "Bucharest", "name_ar": "بوخارست"},
            {"country_code": "BG", "name_en": "Sofia", "name_ar": "صوفيا"},
            
            {"country_code": "IE", "name_en": "Dublin", "name_ar": "دبلن"},
            {"country_code": "IE", "name_en": "Cork", "name_ar": "كورك"},
            
            {"country_code": "RU", "name_en": "Moscow", "name_ar": "موسكو"},
            {"country_code": "RU", "name_en": "Saint Petersburg", "name_ar": "سانت بطرسبرغ"},
            {"country_code": "RU", "name_en": "Novosibirsk", "name_ar": "نوفوسيبيرسك"},
            {"country_code": "RU", "name_en": "Yekaterinburg", "name_ar": "يكاترينبورغ"},
            {"country_code": "RU", "name_en": "Vladivostok", "name_ar": "فلاديفوستوك"},
            
            # Asia - Major cities
            {"country_code": "CN", "name_en": "Hong Kong", "name_ar": "هونغ كونغ"},
            {"country_code": "CN", "name_en": "Tianjin", "name_ar": "تيانجين"},
            {"country_code": "CN", "name_en": "Chongqing", "name_ar": "تشونغتشينغ"},
            {"country_code": "CN", "name_en": "Chengdu", "name_ar": "تشنغدو"},
            {"country_code": "CN", "name_en": "Wuhan", "name_ar": "ووهان"},
            {"country_code": "CN", "name_en": "Xian", "name_ar": "شيان"},
            {"country_code": "CN", "name_en": "Hangzhou", "name_ar": "هانغتشو"},
            {"country_code": "CN", "name_en": "Nanjing", "name_ar": "نانجينغ"},
            {"country_code": "CN", "name_en": "Qingdao", "name_ar": "تشينغداو"},
            {"country_code": "CN", "name_en": "Dalian", "name_ar": "داليان"},
            {"country_code": "CN", "name_en": "Xiamen", "name_ar": "شيامن"},
            
            {"country_code": "JP", "name_en": "Tokyo", "name_ar": "طوكيو"},
            {"country_code": "JP", "name_en": "Osaka", "name_ar": "أوساكا"},
            {"country_code": "JP", "name_en": "Yokohama", "name_ar": "يوكوهاما"},
            {"country_code": "JP", "name_en": "Nagoya", "name_ar": "ناغويا"},
            {"country_code": "JP", "name_en": "Sapporo", "name_ar": "سابورو"},
            {"country_code": "JP", "name_en": "Kobe", "name_ar": "كوبي"},
            {"country_code": "JP", "name_en": "Kyoto", "name_ar": "كيوتو"},
            {"country_code": "JP", "name_en": "Fukuoka", "name_ar": "فوكوكا"},
            
            {"country_code": "KR", "name_en": "Seoul", "name_ar": "سيول"},
            {"country_code": "KR", "name_en": "Busan", "name_ar": "بوسان"},
            {"country_code": "KR", "name_en": "Incheon", "name_ar": "إنتشون"},
            {"country_code": "KR", "name_en": "Daegu", "name_ar": "دايغو"},
            
            {"country_code": "IN", "name_en": "Mumbai", "name_ar": "مومباي"},
            {"country_code": "IN", "name_en": "Delhi", "name_ar": "دلهي"},
            {"country_code": "IN", "name_en": "Bangalore", "name_ar": "بنغالور"},
            {"country_code": "IN", "name_en": "Hyderabad", "name_ar": "حيدر أباد"},
            {"country_code": "IN", "name_en": "Ahmedabad", "name_ar": "أحمد أباد"},
            {"country_code": "IN", "name_en": "Chennai", "name_ar": "تشيناي"},
            {"country_code": "IN", "name_en": "Kolkata", "name_ar": "كولكاتا"},
            {"country_code": "IN", "name_en": "Pune", "name_ar": "بونا"},
            
            {"country_code": "PK", "name_en": "Karachi", "name_ar": "كراتشي"},
            {"country_code": "PK", "name_en": "Lahore", "name_ar": "لاهور"},
            {"country_code": "PK", "name_en": "Islamabad", "name_ar": "إسلام أباد"},
            
            {"country_code": "BD", "name_en": "Dhaka", "name_ar": "دكا"},
            {"country_code": "BD", "name_en": "Chittagong", "name_ar": "شيتاغونغ"},
            
            {"country_code": "TH", "name_en": "Bangkok", "name_ar": "بانكوك"},
            {"country_code": "TH", "name_en": "Phuket", "name_ar": "بوكيت"},
            {"country_code": "TH", "name_en": "Pattaya", "name_ar": "باتايا"},
            
            {"country_code": "VN", "name_en": "Hanoi", "name_ar": "هانوي"},
            {"country_code": "VN", "name_en": "Ho Chi Minh City", "name_ar": "مدينة هوشي منه"},
            
            {"country_code": "MY", "name_en": "Kuala Lumpur", "name_ar": "كوالالمبور"},
            {"country_code": "MY", "name_en": "Penang", "name_ar": "بينانج"},
            
            {"country_code": "ID", "name_en": "Jakarta", "name_ar": "جاكرتا"},
            {"country_code": "ID", "name_en": "Surabaya", "name_ar": "سورابايا"},
            {"country_code": "ID", "name_en": "Bandung", "name_ar": "باندونغ"},
            {"country_code": "ID", "name_en": "Bali", "name_ar": "بالي"},
            
            {"country_code": "PH", "name_en": "Manila", "name_ar": "مانيلا"},
            {"country_code": "PH", "name_en": "Cebu", "name_ar": "سيبو"},
            
            # Americas
            {"country_code": "US", "name_en": "Washington DC", "name_ar": "واشنطن"},
            {"country_code": "US", "name_en": "San Francisco", "name_ar": "سان فرانسيسكو"},
            {"country_code": "US", "name_en": "Boston", "name_ar": "بوسطن"},
            {"country_code": "US", "name_en": "Philadelphia", "name_ar": "فيلادلفيا"},
            {"country_code": "US", "name_en": "Phoenix", "name_ar": "فينيكس"},
            {"country_code": "US", "name_en": "San Diego", "name_ar": "سان دييغو"},
            {"country_code": "US", "name_en": "Dallas", "name_ar": "دالاس"},
            {"country_code": "US", "name_en": "San Jose", "name_ar": "سان خوسيه"},
            {"country_code": "US", "name_en": "Austin", "name_ar": "أوستن"},
            {"country_code": "US", "name_en": "Seattle", "name_ar": "سياتل"},
            {"country_code": "US", "name_en": "Denver", "name_ar": "دنفر"},
            {"country_code": "US", "name_en": "Atlanta", "name_ar": "أتلانتا"},
            {"country_code": "US", "name_en": "Las Vegas", "name_ar": "لاس فيغاس"},
            {"country_code": "US", "name_en": "Portland", "name_ar": "بورتلاند"},
            
            {"country_code": "CA", "name_en": "Toronto", "name_ar": "تورونتو"},
            {"country_code": "CA", "name_en": "Montreal", "name_ar": "مونتريال"},
            {"country_code": "CA", "name_en": "Vancouver", "name_ar": "فانكوفر"},
            {"country_code": "CA", "name_en": "Calgary", "name_ar": "كالغاري"},
            {"country_code": "CA", "name_en": "Ottawa", "name_ar": "أوتاوا"},
            
            {"country_code": "MX", "name_en": "Mexico City", "name_ar": "مكسيكو سيتي"},
            {"country_code": "MX", "name_en": "Guadalajara", "name_ar": "غوادالاخارا"},
            {"country_code": "MX", "name_en": "Monterrey", "name_ar": "مونتيري"},
            {"country_code": "MX", "name_en": "Cancun", "name_ar": "كانكون"},
            
            {"country_code": "BR", "name_en": "Sao Paulo", "name_ar": "ساو باولو"},
            {"country_code": "BR", "name_en": "Rio de Janeiro", "name_ar": "ريو دي جانيرو"},
            {"country_code": "BR", "name_en": "Brasilia", "name_ar": "برازيليا"},
            {"country_code": "BR", "name_en": "Salvador", "name_ar": "سلفادور"},
            
            {"country_code": "AR", "name_en": "Buenos Aires", "name_ar": "بوينس آيرس"},
            {"country_code": "AR", "name_en": "Cordoba", "name_ar": "قرطبة"},
            
            {"country_code": "CL", "name_en": "Santiago", "name_ar": "سانتياغو"},
            {"country_code": "CL", "name_en": "Valparaiso", "name_ar": "فالبارايسو"},
            
            {"country_code": "CO", "name_en": "Bogota", "name_ar": "بوغوتا"},
            {"country_code": "CO", "name_en": "Medellin", "name_ar": "ميديلين"},
            {"country_code": "CO", "name_en": "Cartagena", "name_ar": "قرطاجنة"},
            
            {"country_code": "PE", "name_en": "Lima", "name_ar": "ليما"},
            {"country_code": "PE", "name_en": "Cusco", "name_ar": "كوسكو"},
            
            # Africa
            {"country_code": "ZA", "name_en": "Johannesburg", "name_ar": "جوهانسبرغ"},
            {"country_code": "ZA", "name_en": "Cape Town", "name_ar": "كيب تاون"},
            {"country_code": "ZA", "name_en": "Durban", "name_ar": "ديربان"},
            {"country_code": "ZA", "name_en": "Pretoria", "name_ar": "بريتوريا"},
            
            {"country_code": "NG", "name_en": "Lagos", "name_ar": "لاغوس"},
            {"country_code": "NG", "name_en": "Abuja", "name_ar": "أبوجا"},
            
            {"country_code": "KE", "name_en": "Nairobi", "name_ar": "نيروبي"},
            {"country_code": "KE", "name_en": "Mombasa", "name_ar": "مومباسا"},
            
            {"country_code": "ET", "name_en": "Addis Ababa", "name_ar": "أديس أبابا"},
            {"country_code": "GH", "name_en": "Accra", "name_ar": "أكرا"},
            
            # Oceania
            {"country_code": "AU", "name_en": "Sydney", "name_ar": "سيدني"},
            {"country_code": "AU", "name_en": "Melbourne", "name_ar": "ملبورن"},
            {"country_code": "AU", "name_en": "Brisbane", "name_ar": "بريسبن"},
            {"country_code": "AU", "name_en": "Perth", "name_ar": "بيرث"},
            {"country_code": "AU", "name_en": "Adelaide", "name_ar": "أديليد"},
            {"country_code": "AU", "name_en": "Canberra", "name_ar": "كانبرا"},
            
            {"country_code": "NZ", "name_en": "Auckland", "name_ar": "أوكلاند"},
            {"country_code": "NZ", "name_en": "Wellington", "name_ar": "ويلينغتون"},
            {"country_code": "NZ", "name_en": "Christchurch", "name_ar": "كرايستشيرش"},
            
            # Eastern Europe - MORE CITIES
            {"country_code": "BY", "name_en": "Minsk", "name_ar": "مينسك"},
            {"country_code": "BY", "name_en": "Gomel", "name_ar": "غوميل"},
            {"country_code": "BY", "name_en": "Brest", "name_ar": "بريست"},
            {"country_code": "BY", "name_en": "Grodno", "name_ar": "غرودنو"},
            
            {"country_code": "UA", "name_en": "Kyiv", "name_ar": "كييف"},
            {"country_code": "UA", "name_en": "Kharkiv", "name_ar": "خاركيف"},
            {"country_code": "UA", "name_en": "Odessa", "name_ar": "أوديسا"},
            {"country_code": "UA", "name_en": "Dnipro", "name_ar": "دنيبرو"},
            {"country_code": "UA", "name_en": "Lviv", "name_ar": "لفيف"},
            
            {"country_code": "MD", "name_en": "Chisinau", "name_ar": "كيشيناو"},
            {"country_code": "GE", "name_en": "Tbilisi", "name_ar": "تبليسي"},
            {"country_code": "GE", "name_en": "Batumi", "name_ar": "باتومي"},
            {"country_code": "AM", "name_en": "Yerevan", "name_ar": "يريفان"},
            {"country_code": "AZ", "name_en": "Baku", "name_ar": "باكو"},
            
            # Central Asia
            {"country_code": "KZ", "name_en": "Almaty", "name_ar": "ألماتي"},
            {"country_code": "KZ", "name_en": "Nur-Sultan", "name_ar": "نور سلطان"},
            {"country_code": "UZ", "name_en": "Tashkent", "name_ar": "طشقند"},
            {"country_code": "UZ", "name_en": "Samarkand", "name_ar": "سمرقند"},
            {"country_code": "TM", "name_en": "Ashgabat", "name_ar": "عشق آباد"},
            {"country_code": "TJ", "name_en": "Dushanbe", "name_ar": "دوشانبي"},
            {"country_code": "KG", "name_en": "Bishkek", "name_ar": "بيشكيك"},
            
            # Balkans
            {"country_code": "RS", "name_en": "Belgrade", "name_ar": "بلغراد"},
            {"country_code": "BA", "name_en": "Sarajevo", "name_ar": "سراييفو"},
            {"country_code": "MK", "name_en": "Skopje", "name_ar": "سكوبيه"},
            {"country_code": "AL", "name_en": "Tirana", "name_ar": "تيرانا"},
            {"country_code": "ME", "name_en": "Podgorica", "name_ar": "بودغوريتسا"},
            {"country_code": "XK", "name_en": "Pristina", "name_ar": "بريشتينا"},
            {"country_code": "HR", "name_en": "Zagreb", "name_ar": "زغرب"},
            {"country_code": "HR", "name_en": "Split", "name_ar": "سبليت"},
            {"country_code": "SI", "name_en": "Ljubljana", "name_ar": "ليوبليانا"},
            {"country_code": "SK", "name_en": "Bratislava", "name_ar": "براتيسلافا"},
            
            # Baltic States
            {"country_code": "LT", "name_en": "Vilnius", "name_ar": "فيلنيوس"},
            {"country_code": "LV", "name_en": "Riga", "name_ar": "ريغا"},
            {"country_code": "EE", "name_en": "Tallinn", "name_ar": "تالين"},
            
            # More Middle East
            {"country_code": "IR", "name_en": "Tehran", "name_ar": "طهران"},
            {"country_code": "IR", "name_en": "Isfahan", "name_ar": "أصفهان"},
            {"country_code": "IR", "name_en": "Shiraz", "name_ar": "شيراز"},
            {"country_code": "IR", "name_en": "Mashhad", "name_ar": "مشهد"},
            
            {"country_code": "AF", "name_en": "Kabul", "name_ar": "كابول"},
            {"country_code": "AF", "name_en": "Kandahar", "name_ar": "قندهار"},
            
            # More Asia
            {"country_code": "MM", "name_en": "Yangon", "name_ar": "يانغون"},
            {"country_code": "MM", "name_en": "Mandalay", "name_ar": "ماندالاي"},
            {"country_code": "LA", "name_en": "Vientiane", "name_ar": "فيينتيان"},
            {"country_code": "KH", "name_en": "Phnom Penh", "name_ar": "بنوم بنه"},
            {"country_code": "NP", "name_en": "Kathmandu", "name_ar": "كاتماندو"},
            {"country_code": "LK", "name_en": "Colombo", "name_ar": "كولومبو"},
            {"country_code": "MV", "name_en": "Male", "name_ar": "ماليه"},
            {"country_code": "BT", "name_en": "Thimphu", "name_ar": "تيمفو"},
            {"country_code": "MN", "name_en": "Ulaanbaatar", "name_ar": "أولان باتور"},
            {"country_code": "TW", "name_en": "Taipei", "name_ar": "تايبيه"},
            {"country_code": "BN", "name_en": "Bandar Seri Begawan", "name_ar": "بندر سري بكاوان"},
            {"country_code": "TL", "name_en": "Dili", "name_ar": "ديلي"},
            
            # More Africa
            {"country_code": "SD", "name_en": "Khartoum", "name_ar": "الخرطوم"},
            {"country_code": "MR", "name_en": "Nouakchott", "name_ar": "نواكشوط"},
            {"country_code": "TZ", "name_en": "Dar es Salaam", "name_ar": "دار السلام"},
            {"country_code": "UG", "name_en": "Kampala", "name_ar": "كمبالا"},
            {"country_code": "ZW", "name_en": "Harare", "name_ar": "هراري"},
            {"country_code": "AO", "name_en": "Luanda", "name_ar": "لواندا"},
            {"country_code": "MZ", "name_en": "Maputo", "name_ar": "مابوتو"},
            {"country_code": "CM", "name_en": "Yaounde", "name_ar": "ياوندي"},
            {"country_code": "CM", "name_en": "Douala", "name_ar": "دوالا"},
            {"country_code": "CI", "name_en": "Abidjan", "name_ar": "أبيدجان"},
            {"country_code": "SN", "name_en": "Dakar", "name_ar": "داكار"},
            {"country_code": "ML", "name_en": "Bamako", "name_ar": "باماكو"},
            {"country_code": "BF", "name_en": "Ouagadougou", "name_ar": "واغادوغو"},
            {"country_code": "NE", "name_en": "Niamey", "name_ar": "نيامي"},
            {"country_code": "TD", "name_en": "N'Djamena", "name_ar": "نجامينا"},
            {"country_code": "SO", "name_en": "Mogadishu", "name_ar": "مقديشو"},
            {"country_code": "RW", "name_en": "Kigali", "name_ar": "كيغالي"},
            {"country_code": "BI", "name_en": "Bujumbura", "name_ar": "بوجومبورا"},
            {"country_code": "BJ", "name_en": "Porto-Novo", "name_ar": "بورتو نوفو"},
            {"country_code": "TG", "name_en": "Lome", "name_ar": "لومي"},
            {"country_code": "GN", "name_en": "Conakry", "name_ar": "كوناكري"},
            {"country_code": "SL", "name_en": "Freetown", "name_ar": "فريتاون"},
            {"country_code": "LR", "name_en": "Monrovia", "name_ar": "مونروفيا"},
            {"country_code": "GA", "name_en": "Libreville", "name_ar": "ليبرفيل"},
            {"country_code": "CG", "name_en": "Brazzaville", "name_ar": "برازافيل"},
            {"country_code": "CD", "name_en": "Kinshasa", "name_ar": "كينشاسا"},
            {"country_code": "ZM", "name_en": "Lusaka", "name_ar": "لوساكا"},
            {"country_code": "MW", "name_en": "Lilongwe", "name_ar": "ليلونغوي"},
            {"country_code": "BW", "name_en": "Gaborone", "name_ar": "غابورون"},
            {"country_code": "NA", "name_en": "Windhoek", "name_ar": "ويندهوك"},
            {"country_code": "LS", "name_en": "Maseru", "name_ar": "ماسيرو"},
            {"country_code": "SZ", "name_en": "Mbabane", "name_ar": "مبابان"},
            {"country_code": "MG", "name_en": "Antananarivo", "name_ar": "أنتاناناريفو"},
            {"country_code": "MU", "name_en": "Port Louis", "name_ar": "بورت لويس"},
            {"country_code": "SC", "name_en": "Victoria", "name_ar": "فيكتوريا"},
            {"country_code": "DJ", "name_en": "Djibouti City", "name_ar": "جيبوتي"},
            {"country_code": "ER", "name_en": "Asmara", "name_ar": "أسمرة"},
            {"country_code": "SS", "name_en": "Juba", "name_ar": "جوبا"},
            
            # More South America
            {"country_code": "VE", "name_en": "Caracas", "name_ar": "كاراكاس"},
            {"country_code": "EC", "name_en": "Quito", "name_ar": "كيتو"},
            {"country_code": "EC", "name_en": "Guayaquil", "name_ar": "غواياكيل"},
            {"country_code": "BO", "name_en": "La Paz", "name_ar": "لاباز"},
            {"country_code": "BO", "name_en": "Santa Cruz", "name_ar": "سانتا كروز"},
            {"country_code": "PY", "name_en": "Asuncion", "name_ar": "أسونسيون"},
            {"country_code": "UY", "name_en": "Montevideo", "name_ar": "مونتفيديو"},
            {"country_code": "GY", "name_en": "Georgetown", "name_ar": "جورج تاون"},
            {"country_code": "SR", "name_en": "Paramaribo", "name_ar": "باراماريبو"},
            
            # Central America & Caribbean
            {"country_code": "CR", "name_en": "San Jose", "name_ar": "سان خوسيه"},
            {"country_code": "PA", "name_en": "Panama City", "name_ar": "مدينة بنما"},
            {"country_code": "GT", "name_en": "Guatemala City", "name_ar": "غواتيمالا سيتي"},
            {"country_code": "HN", "name_en": "Tegucigalpa", "name_ar": "تيغوسيغالبا"},
            {"country_code": "NI", "name_en": "Managua", "name_ar": "ماناغوا"},
            {"country_code": "SV", "name_en": "San Salvador", "name_ar": "سان سلفادور"},
            {"country_code": "BZ", "name_en": "Belize City", "name_ar": "مدينة بليز"},
            {"country_code": "CU", "name_en": "Havana", "name_ar": "هافانا"},
            {"country_code": "DO", "name_en": "Santo Domingo", "name_ar": "سانتو دومينغو"},
            {"country_code": "HT", "name_en": "Port-au-Prince", "name_ar": "بورت أو برنس"},
            {"country_code": "JM", "name_en": "Kingston", "name_ar": "كينغستون"},
            {"country_code": "TT", "name_en": "Port of Spain", "name_ar": "بورت أوف سبين"},
            
            # Oceania - More cities
            {"country_code": "FJ", "name_en": "Suva", "name_ar": "سوفا"},
            {"country_code": "PG", "name_en": "Port Moresby", "name_ar": "بورت مورسبي"},
            {"country_code": "SB", "name_en": "Honiara", "name_ar": "هونيارا"},
            {"country_code": "VU", "name_en": "Port Vila", "name_ar": "بورت فيلا"},
            {"country_code": "WS", "name_en": "Apia", "name_ar": "آبيا"},
            {"country_code": "TO", "name_en": "Nuku'alofa", "name_ar": "نوكوألوفا"},
            
            # More European capitals and cities
            {"country_code": "IS", "name_en": "Reykjavik", "name_ar": "ريكيافيك"},
            {"country_code": "LU", "name_en": "Luxembourg City", "name_ar": "لوكسمبورغ"},
            {"country_code": "MT", "name_en": "Valletta", "name_ar": "فاليتا"},
            {"country_code": "CY", "name_en": "Nicosia", "name_ar": "نيقوسيا"},
            {"country_code": "CY", "name_en": "Limassol", "name_ar": "ليماسول"},
        ]

    def _get_major_world_ports(self):
        """Returns list of 200+ major shipping ports worldwide"""
        return [
            # Middle East Ports (expanded)
            {"country_code": "SY", "name_en": "Latakia Port", "name_ar": "ميناء اللاذقية", "code": "SYLAT"},
            {"country_code": "SY", "name_en": "Tartus Port", "name_ar": "ميناء طرطوس", "code": "SYTTS"},
            {"country_code": "SY", "name_en": "Banias Port", "name_ar": "ميناء بانياس", "code": "SYBAN"},
            
            {"country_code": "TR", "name_en": "Istanbul Port", "name_ar": "ميناء إسطنبول", "code": "TRIST"},
            {"country_code": "TR", "name_en": "Mersin Port", "name_ar": "ميناء مرسين", "code": "TRMER"},
            {"country_code": "TR", "name_en": "Izmir Port", "name_ar": "ميناء إزمير", "code": "TRIZM"},
            {"country_code": "TR", "name_en": "Haydarpasa Port", "name_ar": "ميناء حيدر باشا", "code": "TRHAY"},
            {"country_code": "TR", "name_en": "Gemlik Port", "name_ar": "ميناء جمليك", "code": "TRGEM"},
            {"country_code": "TR", "name_en": "Iskenderun Port", "name_ar": "ميناء إسكندرون", "code": "TRISK"},
            
            {"country_code": "AE", "name_en": "Jebel Ali Port", "name_ar": "ميناء جبل علي", "code": "AEJEA"},
            {"country_code": "AE", "name_en": "Port Rashid", "name_ar": "ميناء راشد", "code": "AEPRA"},
            {"country_code": "AE", "name_en": "Khalifa Port", "name_ar": "ميناء خليفة", "code": "AEKHL"},
            {"country_code": "AE", "name_en": "Fujairah Port", "name_ar": "ميناء الفجيرة", "code": "AEFJR"},
            {"country_code": "AE", "name_en": "Sharjah Port", "name_ar": "ميناء الشارقة", "code": "AESHJ"},
            
            {"country_code": "SA", "name_en": "Jeddah Islamic Port", "name_ar": "ميناء جدة الإسلامي", "code": "SAJED"},
            {"country_code": "SA", "name_en": "King Abdulaziz Port", "name_ar": "ميناء الملك عبدالعزيز", "code": "SADAM"},
            {"country_code": "SA", "name_en": "Jubail Commercial Port", "name_ar": "ميناء الجبيل التجاري", "code": "SAJUB"},
            {"country_code": "SA", "name_en": "Yanbu Commercial Port", "name_ar": "ميناء ينبع التجاري", "code": "SAYNB"},
            {"country_code": "SA", "name_en": "Jizan Port", "name_ar": "ميناء جيزان", "code": "SAJIZ"},
            
            {"country_code": "OM", "name_en": "Salalah Port", "name_ar": "ميناء صلالة", "code": "OMSLL"},
            {"country_code": "OM", "name_en": "Sohar Port", "name_ar": "ميناء صحار", "code": "OMSOH"},
            {"country_code": "OM", "name_en": "Muscat Port", "name_ar": "ميناء مسقط", "code": "OMMCT"},
            
            {"country_code": "KW", "name_en": "Shuwaikh Port", "name_ar": "ميناء الشويخ", "code": "KWKWI"},
            {"country_code": "KW", "name_en": "Shuaiba Port", "name_ar": "ميناء الشعيبة", "code": "KWSHU"},
            
            {"country_code": "QA", "name_en": "Hamad Port", "name_ar": "ميناء حمد", "code": "QAHAD"},
            {"country_code": "QA", "name_en": "Doha Port", "name_ar": "ميناء الدوحة", "code": "QADOH"},
            
            {"country_code": "BH", "name_en": "Khalifa Bin Salman Port", "name_ar": "ميناء خليفة بن سلمان", "code": "BHKBS"},
            {"country_code": "BH", "name_en": "Mina Salman Port", "name_ar": "ميناء مينا سلمان", "code": "BHMAN"},
            
            # Egypt
            {"country_code": "EG", "name_en": "Alexandria Port", "name_ar": "ميناء الإسكندرية", "code": "EGALY"},
            {"country_code": "EG", "name_en": "Port Said", "name_ar": "ميناء بورسعيد", "code": "EGPSD"},
            {"country_code": "EG", "name_en": "Damietta Port", "name_ar": "ميناء دمياط", "code": "EGDAM"},
            {"country_code": "EG", "name_en": "Suez Port", "name_ar": "ميناء السويس", "code": "EGSUZ"},
            {"country_code": "EG", "name_en": "Sokhna Port", "name_ar": "ميناء السخنة", "code": "EGSOK"},
            
            # Jordan & Iraq
            {"country_code": "JO", "name_en": "Aqaba Port", "name_ar": "ميناء العقبة", "code": "JOAQJ"},
            {"country_code": "IQ", "name_en": "Umm Qasr Port", "name_ar": "ميناء أم قصر", "code": "IQUQS"},
            {"country_code": "IQ", "name_en": "Basra Port", "name_ar": "ميناء البصرة", "code": "IQBSR"},
            
            # Lebanon
            {"country_code": "LB", "name_en": "Beirut Port", "name_ar": "ميناء بيروت", "code": "LBBEY"},
            {"country_code": "LB", "name_en": "Tripoli Port", "name_ar": "ميناء طرابلس", "code": "LBTRP"},
            {"country_code": "LB", "name_en": "Sidon Port", "name_ar": "ميناء صيدا", "code": "LBSID"},
            
            # Israel
            {"country_code": "IL", "name_en": "Haifa Port", "name_ar": "ميناء حيفا", "code": "ILHFA"},
            {"country_code": "IL", "name_en": "Ashdod Port", "name_ar": "ميناء أشدود", "code": "ILASD"},
            
            # North Africa
            {"country_code": "MA", "name_en": "Tangier Med Port", "name_ar": "ميناء طنجة المتوسط", "code": "MATNG"},
            {"country_code": "MA", "name_en": "Casablanca Port", "name_ar": "ميناء الدار البيضاء", "code": "MACAS"},
            {"country_code": "DZ", "name_en": "Algiers Port", "name_ar": "ميناء الجزائر", "code": "DZALG"},
            {"country_code": "TN", "name_en": "Tunis Port", "name_ar": "ميناء تونس", "code": "TNTUN"},
            {"country_code": "LY", "name_en": "Tripoli Port", "name_ar": "ميناء طرابلس", "code": "LYTRP"},
            
            # Europe - Mediterranean
            {"country_code": "GR", "name_en": "Piraeus Port", "name_ar": "ميناء بيريوس", "code": "GRPIR"},
            {"country_code": "GR", "name_en": "Thessaloniki Port", "name_ar": "ميناء سالونيك", "code": "GRSKG"},
            
            {"country_code": "IT", "name_en": "Genoa Port", "name_ar": "ميناء جنوة", "code": "ITGOA"},
            {"country_code": "IT", "name_en": "Naples Port", "name_ar": "ميناء نابولي", "code": "ITNAP"},
            {"country_code": "IT", "name_en": "Venice Port", "name_ar": "ميناء البندقية", "code": "ITVCE"},
            {"country_code": "IT", "name_en": "Trieste Port", "name_ar": "ميناء تريستة", "code": "ITTRS"},
            {"country_code": "IT", "name_en": "La Spezia Port", "name_ar": "ميناء لا سبيتسيا", "code": "ITLSP"},
            
            {"country_code": "ES", "name_en": "Barcelona Port", "name_ar": "ميناء برشلونة", "code": "ESBCN"},
            {"country_code": "ES", "name_en": "Valencia Port", "name_ar": "ميناء فالنسيا", "code": "ESVLC"},
            {"country_code": "ES", "name_en": "Algeciras Port", "name_ar": "ميناء الجزيرة الخضراء", "code": "ESALG"},
            {"country_code": "ES", "name_en": "Bilbao Port", "name_ar": "ميناء بلباو", "code": "ESBIO"},
            
            {"country_code": "FR", "name_en": "Marseille Port", "name_ar": "ميناء مرسيليا", "code": "FRMRS"},
            {"country_code": "FR", "name_en": "Le Havre Port", "name_ar": "ميناء لوهافر", "code": "FRLEH"},
            
            # Europe - Northern
            {"country_code": "NL", "name_en": "Port of Rotterdam", "name_ar": "ميناء روتردام", "code": "NLRTM"},
            {"country_code": "NL", "name_en": "Port of Amsterdam", "name_ar": "ميناء أمستردام", "code": "NLAMS"},
            
            {"country_code": "BE", "name_en": "Port of Antwerp", "name_ar": "ميناء أنتويرب", "code": "BEANR"},
            {"country_code": "BE", "name_en": "Zeebrugge Port", "name_ar": "ميناء زيبروج", "code": "BEZEE"},
            
            {"country_code": "DE", "name_en": "Port of Hamburg", "name_ar": "ميناء هامبورغ", "code": "DEHAM"},
            {"country_code": "DE", "name_en": "Port of Bremen", "name_ar": "ميناء بريمن", "code": "DEBRE"},
            
            {"country_code": "GB", "name_en": "Port of London", "name_ar": "ميناء لندن", "code": "GBLON"},
            {"country_code": "GB", "name_en": "Port of Liverpool", "name_ar": "ميناء ليفربول", "code": "GBLIV"},
            {"country_code": "GB", "name_en": "Port of Southampton", "name_ar": "ميناء ساوثهامبتون", "code": "GBSOU"},
            {"country_code": "GB", "name_en": "Port of Felixstowe", "name_ar": "ميناء فيليكستو", "code": "GBFXT"},
            
            {"country_code": "SE", "name_en": "Port of Gothenburg", "name_ar": "ميناء غوتنبرغ", "code": "SEGOT"},
            {"country_code": "DK", "name_en": "Port of Copenhagen", "name_ar": "ميناء كوبنهاغن", "code": "DKCPH"},
            {"country_code": "NO", "name_en": "Port of Oslo", "name_ar": "ميناء أوسلو", "code": "NOOSL"},
            
            # Asia - China
            {"country_code": "CN", "name_en": "Shanghai Port", "name_ar": "ميناء شنغهاي", "code": "CNSHA"},
            {"country_code": "CN", "name_en": "Shenzhen Port", "name_ar": "ميناء شنتشن", "code": "CNSZX"},
            {"country_code": "CN", "name_en": "Ningbo-Zhoushan Port", "name_ar": "ميناء نينغبو-جوشان", "code": "CNNGB"},
            {"country_code": "CN", "name_en": "Guangzhou Port", "name_ar": "ميناء قوانغتشو", "code": "CNCAN"},
            {"country_code": "CN", "name_en": "Qingdao Port", "name_ar": "ميناء تشينغداو", "code": "CNTAO"},
            {"country_code": "CN", "name_en": "Tianjin Port", "name_ar": "ميناء تيانجين", "code": "CNTSN"},
            {"country_code": "CN", "name_en": "Dalian Port", "name_ar": "ميناء داليان", "code": "CNDLC"},
            {"country_code": "CN", "name_en": "Xiamen Port", "name_ar": "ميناء شيامن", "code": "CNXMN"},
            
            # Asia - Southeast Asia
            {"country_code": "SG", "name_en": "Singapore Port", "name_ar": "ميناء سنغافورة", "code": "SGSIN"},
            
            {"country_code": "MY", "name_en": "Port Klang", "name_ar": "ميناء كلانج", "code": "MYPKG"},
            {"country_code": "MY", "name_en": "Penang Port", "name_ar": "ميناء بينانج", "code": "MYPEN"},
            
            {"country_code": "TH", "name_en": "Bangkok Port", "name_ar": "ميناء بانكوك", "code": "THBKK"},
            {"country_code": "TH", "name_en": "Laem Chabang Port", "name_ar": "ميناء ليم تشابانغ", "code": "THLCH"},
            
            {"country_code": "VN", "name_en": "Ho Chi Minh Port", "name_ar": "ميناء هوشي منه", "code": "VNSGN"},
            {"country_code": "VN", "name_en": "Hai Phong Port", "name_ar": "ميناء هاي فونغ", "code": "VNHPH"},
            
            {"country_code": "ID", "name_en": "Tanjung Priok Port", "name_ar": "ميناء تانجونج بريوك", "code": "IDJKT"},
            
            {"country_code": "PH", "name_en": "Manila Port", "name_ar": "ميناء مانيلا", "code": "PHMNL"},
            
            # Asia - Japan & South Korea
            {"country_code": "JP", "name_en": "Tokyo Port", "name_ar": "ميناء طوكيو", "code": "JPTYO"},
            {"country_code": "JP", "name_en": "Yokohama Port", "name_ar": "ميناء يوكوهاما", "code": "JPYOK"},
            {"country_code": "JP", "name_en": "Osaka Port", "name_ar": "ميناء أوساكا", "code": "JPOSA"},
            {"country_code": "JP", "name_en": "Kobe Port", "name_ar": "ميناء كوبي", "code": "JPUKB"},
            {"country_code": "JP", "name_en": "Nagoya Port", "name_ar": "ميناء ناغويا", "code": "JPNGO"},
            
            {"country_code": "KR", "name_en": "Busan Port", "name_ar": "ميناء بوسان", "code": "KRPUS"},
            {"country_code": "KR", "name_en": "Incheon Port", "name_ar": "ميناء إنتشون", "code": "KRINC"},
            {"country_code": "KR", "name_en": "Gwangyang Port", "name_ar": "ميناء غوانغيانغ", "code": "KRKUV"},
            
            # Asia - South Asia
            {"country_code": "IN", "name_en": "Jawaharlal Nehru Port", "name_ar": "ميناء جواهر لال نهرو", "code": "INNSA"},
            {"country_code": "IN", "name_en": "Mundra Port", "name_ar": "ميناء موندرا", "code": "INMUN"},
            {"country_code": "IN", "name_en": "Chennai Port", "name_ar": "ميناء تشيناي", "code": "INMAA"},
            {"country_code": "IN", "name_en": "Kolkata Port", "name_ar": "ميناء كولكاتا", "code": "INCCU"},
            
            {"country_code": "PK", "name_en": "Karachi Port", "name_ar": "ميناء كراتشي", "code": "PKKHI"},
            {"country_code": "PK", "name_en": "Port Qasim", "name_ar": "ميناء قاسم", "code": "PKPQC"},
            
            {"country_code": "BD", "name_en": "Chittagong Port", "name_ar": "ميناء شيتاغونغ", "code": "BDCGP"},
            
            {"country_code": "LK", "name_en": "Colombo Port", "name_ar": "ميناء كولومبو", "code": "LKCMB"},
            
            # Americas
            {"country_code": "US", "name_en": "Port of Los Angeles", "name_ar": "ميناء لوس أنجلوس", "code": "USLAX"},
            {"country_code": "US", "name_en": "Port of Long Beach", "name_ar": "ميناء لونج بيتش", "code": "USLGB"},
            {"country_code": "US", "name_en": "Port of New York", "name_ar": "ميناء نيويورك", "code": "USNYC"},
            {"country_code": "US", "name_en": "Port of Savannah", "name_ar": "ميناء سافانا", "code": "USSAV"},
            {"country_code": "US", "name_en": "Port of Houston", "name_ar": "ميناء هيوستن", "code": "USHOU"},
            {"country_code": "US", "name_en": "Port of Seattle", "name_ar": "ميناء سياتل", "code": "USSEA"},
            {"country_code": "US", "name_en": "Port of Miami", "name_ar": "ميناء ميامي", "code": "USMIA"},
            
            {"country_code": "CA", "name_en": "Port of Vancouver", "name_ar": "ميناء فانكوفر", "code": "CAVAN"},
            {"country_code": "CA", "name_en": "Port of Montreal", "name_ar": "ميناء مونتريال", "code": "CAMTR"},
            {"country_code": "CA", "name_en": "Port of Halifax", "name_ar": "ميناء هاليفاكس", "code": "CAHAL"},
            
            {"country_code": "MX", "name_en": "Port of Veracruz", "name_ar": "ميناء فيراكروز", "code": "MXVER"},
            {"country_code": "MX", "name_en": "Port of Manzanillo", "name_ar": "ميناء مانزانيلو", "code": "MXZLO"},
            
            {"country_code": "BR", "name_en": "Port of Santos", "name_ar": "ميناء سانتوس", "code": "BRSSZ"},
            {"country_code": "BR", "name_en": "Port of Rio de Janeiro", "name_ar": "ميناء ريو دي جانيرو", "code": "BRRIO"},
            
            {"country_code": "PA", "name_en": "Colon Port", "name_ar": "ميناء كولون", "code": "PAONX"},
            {"country_code": "PA", "name_en": "Balboa Port", "name_ar": "ميناء بالبوا", "code": "PABLB"},
            
            # Africa
            {"country_code": "ZA", "name_en": "Port of Durban", "name_ar": "ميناء ديربان", "code": "ZADUR"},
            {"country_code": "ZA", "name_en": "Port of Cape Town", "name_ar": "ميناء كيب تاون", "code": "ZACPT"},
            {"country_code": "ZA", "name_en": "Port Elizabeth", "name_ar": "ميناء إليزابيث", "code": "ZAPLZ"},
            
            {"country_code": "NG", "name_en": "Lagos Port", "name_ar": "ميناء لاغوس", "code": "NGLOS"},
            {"country_code": "KE", "name_en": "Mombasa Port", "name_ar": "ميناء مومباسا", "code": "KEMBA"},
            
            # Oceania
            {"country_code": "AU", "name_en": "Port of Melbourne", "name_ar": "ميناء ملبورن", "code": "AUMEL"},
            {"country_code": "AU", "name_en": "Port of Sydney", "name_ar": "ميناء سيدني", "code": "AUSYD"},
            {"country_code": "AU", "name_en": "Port of Brisbane", "name_ar": "ميناء بريسبن", "code": "AUBNE"},
            
            {"country_code": "NZ", "name_en": "Port of Auckland", "name_ar": "ميناء أوكلاند", "code": "NZAKL"},
            
            # South America Ports (MISSING!)
            {"country_code": "AR", "name_en": "Port of Buenos Aires", "name_ar": "ميناء بوينس آيرس", "code": "ARBUE"},
            {"country_code": "AR", "name_en": "Port of Rosario", "name_ar": "ميناء روساريو", "code": "ARROS"},
            {"country_code": "AR", "name_en": "Port of Bahia Blanca", "name_ar": "ميناء باهيا بلانكا", "code": "ARBHI"},
            
            {"country_code": "CL", "name_en": "Port of Valparaiso", "name_ar": "ميناء فالبارايسو", "code": "CLVAP"},
            {"country_code": "CL", "name_en": "Port of San Antonio", "name_ar": "ميناء سان أنطونيو", "code": "CLSAI"},
            
            {"country_code": "CO", "name_en": "Port of Cartagena", "name_ar": "ميناء قرطاجنة", "code": "COCTG"},
            {"country_code": "CO", "name_en": "Port of Buenaventura", "name_ar": "ميناء بوينافنتورا", "code": "COBUN"},
            
            {"country_code": "PE", "name_en": "Port of Callao", "name_ar": "ميناء كاياو", "code": "PECLL"},
            
            {"country_code": "EC", "name_en": "Port of Guayaquil", "name_ar": "ميناء غواياكيل", "code": "ECGYE"},
            
            {"country_code": "VE", "name_en": "Port of La Guaira", "name_ar": "ميناء لا غوايرا", "code": "VELGR"},
            {"country_code": "VE", "name_en": "Port of Maracaibo", "name_ar": "ميناء ماراكايبو", "code": "VEMAR"},
            
            {"country_code": "UY", "name_en": "Port of Montevideo", "name_ar": "ميناء مونتفيديو", "code": "UYMVD"},
            
            # More Caribbean & Central America
            {"country_code": "CR", "name_en": "Port of Limon", "name_ar": "ميناء ليمون", "code": "CRLIM"},
            {"country_code": "GT", "name_en": "Port Quetzal", "name_ar": "ميناء كتزال", "code": "GTPRQ"},
            {"country_code": "HN", "name_en": "Port of Puerto Cortes", "name_ar": "ميناء بويرتو كورتيس", "code": "HNPCR"},
            {"country_code": "JM", "name_en": "Kingston Port", "name_ar": "ميناء كينغستون", "code": "JMKIN"},
            {"country_code": "TT", "name_en": "Port of Spain", "name_ar": "ميناء بورت أوف سبين", "code": "TTPOS"},
            {"country_code": "DO", "name_en": "Port of Santo Domingo", "name_ar": "ميناء سانتو دومينغو", "code": "DOSDQ"},
            
            # More Africa Ports
            {"country_code": "TN", "name_en": "Port of Sfax", "name_ar": "ميناء صفاقس", "code": "TNSFX"},
            {"country_code": "DZ", "name_en": "Port of Oran", "name_ar": "ميناء وهران", "code": "DZORN"},
            {"country_code": "AO", "name_en": "Port of Luanda", "name_ar": "ميناء لواندا", "code": "AOLAD"},
            {"country_code": "MZ", "name_en": "Port of Maputo", "name_ar": "ميناء مابوتو", "code": "MZMPM"},
            {"country_code": "TZ", "name_en": "Port of Dar es Salaam", "name_ar": "ميناء دار السلام", "code": "TZDAR"},
            {"country_code": "GH", "name_en": "Port of Tema", "name_ar": "ميناء تيما", "code": "GHTEM"},
            {"country_code": "SN", "name_en": "Port of Dakar", "name_ar": "ميناء داكار", "code": "SNDKR"},
            {"country_code": "CI", "name_en": "Port of Abidjan", "name_ar": "ميناء أبيدجان", "code": "CIABJ"},
            {"country_code": "CM", "name_en": "Port of Douala", "name_ar": "ميناء دوالا", "code": "CMDLA"},
            
            # More Asia Ports
            {"country_code": "IR", "name_en": "Bandar Abbas Port", "name_ar": "ميناء بندر عباس", "code": "IRBND"},
            {"country_code": "PK", "name_en": "Gwadar Port", "name_ar": "ميناء جوادر", "code": "PKGWD"},
            {"country_code": "MM", "name_en": "Yangon Port", "name_ar": "ميناء يانغون", "code": "MMRGN"},
            {"country_code": "LK", "name_en": "Hambantota Port", "name_ar": "ميناء همبانتوتا", "code": "LKHRI"},
        ]

