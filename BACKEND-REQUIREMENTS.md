# 🔴 Backend Requirements - ما يحتاج Backend

هذا الملف يحتوي على جميع الصفحات والميزات التي تحتاج إلى Backend API.

---

## ✅ الصفحات الجاهزة (لا تحتاج Backend)

هذه الصفحات **جاهزة وتعمل بدون backend**:

1. ✅ `/` - الصفحة الرئيسية
2. ✅ `/about` - من نحن
3. ✅ `/europe-centers` - مراكز أوروبا
4. ✅ `/aleppo-center` - مركز حلب والتوزيع
5. ✅ `/faq` - الأسئلة الشائعة
6. ✅ `/privacy` - سياسة الخصوصية
7. ✅ `/terms` - الشروط والأحكام
8. ✅ `/prohibited-goods` - البضائع المحظورة
9. ✅ `/appendix-b` - الملحق B
10. ✅ `/contracts` - العقود والمستندات (تحميل PDF)

---

## 🔴 الصفحات التي تحتاج Backend

### 1️⃣ صفحة التواصل `/contact` ⚠️

**الملف:** `frontend/app/contact/page.tsx`

**API المطلوب:**
```
POST /api/contact/
```

**البيانات المرسلة (Request Body):**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "subject": "string",
  "message": "string"
}
```

**الاستجابة المتوقعة (Response):**
```json
{
  "success": true,
  "message": "تم إرسال الرسالة بنجاح"
}
```

**المطلوب من Backend:**
- ✅ استقبال البيانات من الفورم
- ✅ Validation للحقول
- ✅ حفظ الرسالة في قاعدة البيانات (جدول `contact_messages`)
- ✅ إرسال إيميل للإدارة (optional لكن موصى به)
- ✅ إرجاع رسالة نجاح أو خطأ

**جدول قاعدة البيانات المقترح:**
```python
class ContactMessage(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
```

---

### 2️⃣ صفحة تسجيل الدخول `/auth` ✅ (موجود جزئياً)

**الملف:** `frontend/app/auth/page.tsx`

**APIs الموجودة حالياً:**
- ✅ `POST /api/register/` - إنشاء حساب جديد
- ✅ `POST /api/login/` - تسجيل دخول
- ✅ `POST /api/logout/` - تسجيل خروج
- ✅ `POST /api/token/refresh/` - تحديث التوكن

**حالة Backend:** ✅ جاهز ويعمل!

---

### 3️⃣ صفحة إنشاء شحنة `/create-shipment` 🔴

**الملف:** `frontend/app/create-shipment/page.tsx`

**الحالة الحالية:** الصفحة موجودة لكن فاضية أو قيد التطوير

**API المطلوب:**
```
POST /api/shipments/create/
```

**البيانات المتوقعة:**
```json
{
  "sender": {
    "fullName": "string",
    "phone": "string",
    "email": "string",
    "address": {
      "country": "string",
      "city": "string",
      "street": "string",
      "postalCode": "string"
    }
  },
  "receiver": {
    "fullName": "string",
    "phone": "string",
    "email": "string",
    "address": {
      "province": "string",
      "city": "string",
      "street": "string"
    }
  },
  "shipment": {
    "serviceType": "LCL | FCL",
    "containerSize": "20ft | 40ft | 40ft HC" (if FCL),
    "weight": "number (kg)",
    "dimensions": {
      "length": "number",
      "width": "number",
      "height": "number"
    },
    "packages": "number",
    "description": "string",
    "value": "number"
  },
  "options": {
    "insurance": "boolean",
    "specialPackaging": "boolean",
    "doorToDoor": "boolean",
    "storage": "boolean"
  },
  "notes": "string",
  "acceptedTerms": "boolean",
  "acceptedProhibited": "boolean"
}
```

**المطلوب من Backend:**
- ✅ استقبال طلب الشحن
- ✅ حفظه في قاعدة البيانات
- ✅ إعطاء رقم تتبع (tracking number)
- ✅ إرسال تأكيد عبر الإيميل/SMS
- ✅ حساب السعر (optional)

---

### 4️⃣ صفحة التتبع `/tracking` 🔴

**الملف:** `frontend/app/tracking/page.tsx`

**الحالة الحالية:** الصفحة موجودة لكن فاضية أو قيد التطوير

**API المطلوب:**
```
GET /api/shipments/track/:trackingNumber/
```

**الاستجابة المتوقعة:**
```json
{
  "trackingNumber": "string",
  "status": "pending | in_transit | customs | out_for_delivery | delivered",
  "currentLocation": "string",
  "estimatedDelivery": "date",
  "timeline": [
    {
      "status": "string",
      "location": "string",
      "timestamp": "datetime",
      "description": "string"
    }
  ],
  "sender": {
    "name": "string",
    "country": "string"
  },
  "receiver": {
    "name": "string",
    "city": "string"
  }
}
```

**المطلوب من Backend:**
- ✅ البحث عن الشحنة برقم التتبع
- ✅ إرجاع حالة الشحنة والتفاصيل
- ✅ Timeline للشحنة (المراحل المختلفة)

---

### 5️⃣ صفحة الأسعار والحاسبة `/pricing` 🔴

**الملف:** `frontend/app/pricing/page.tsx`

**الحالة الحالية:** الصفحة موجودة لكن فاضية أو قيد التطوير

**API المطلوب:**
```
POST /api/pricing/calculate/
```

**البيانات المرسلة:**
```json
{
  "from": "country",
  "to": "city/province",
  "serviceType": "LCL | FCL",
  "containerSize": "20ft | 40ft | 40ft HC" (if FCL),
  "weight": "number (kg)",
  "dimensions": {
    "length": "number",
    "width": "number",
    "height": "number"
  },
  "options": {
    "insurance": "boolean",
    "doorToDoor": "boolean"
  }
}
```

**الاستجابة المتوقعة:**
```json
{
  "basePrice": "number",
  "insurance": "number",
  "doorToDoor": "number",
  "customs": "number",
  "total": "number",
  "currency": "EUR",
  "estimatedDays": "20-30"
}
```

**المطلوب من Backend:**
- ✅ حاسبة أسعار ديناميكية
- ✅ حساب السعر بناءً على الوزن/الحجم
- ✅ إضافة الخدمات الإضافية
- ✅ قاعدة بيانات للأسعار (pricing_rules)

---

### 6️⃣ لوحة التحكم `/dashboard` 🔴

**الملف:** `frontend/app/dashboard/page.tsx`

**الحالة الحالية:** الصفحة موجودة لكن فاضية أو قيد التطوير

**APIs المطلوبة:**
```
GET /api/user/shipments/          # جميع شحنات المستخدم
GET /api/user/profile/             # معلومات المستخدم (موجود)
PUT /api/user/profile/             # تعديل الملف الشخصي (موجود)
POST /api/user/change-password/    # تغيير كلمة المرور (موجود)
```

**المطلوب من Backend:**
- ✅ عرض جميع شحنات المستخدم
- ✅ تصفية حسب الحالة
- ✅ البحث في الشحنات
- ✅ معلومات إحصائية

---

### 7️⃣ صفحة الطوارئ `/emergency` 🔴 (optional)

**الملف:** `frontend/app/emergency/page.tsx`

**الحالة الحالية:** الصفحة موجودة لكن فاضية

**ملاحظة:** هذه الصفحة ممكن تكون **static** (بدون backend)
- يمكن عرض رقم الطوارئ: `+31683083916`
- نموذج اتصال سريع (يستخدم نفس API صفحة `/contact`)

---

## 📊 ملخص الأولويات

### 🔴 أولوية عالية (High Priority):
1. ✅ `/contact` - نموذج التواصل (جاهز Frontend، يحتاج Backend)
2. ⏳ `/create-shipment` - إنشاء شحنة (يحتاج تطوير كامل)
3. ⏳ `/tracking` - تتبع الشحنة (يحتاج تطوير كامل)

### 🟡 أولوية متوسطة (Medium Priority):
4. ⏳ `/pricing` - حاسبة الأسعار (يحتاج تطوير كامل)
5. ⏳ `/dashboard` - لوحة التحكم (يحتاج APIs إضافية)

### 🟢 أولوية منخفضة (Low Priority):
6. ⏳ `/emergency` - صفحة الطوارئ (ممكن تكون static)

---

## 🔧 ملاحظات تقنية

### Authentication:
- ✅ النظام يستخدم **JWT Tokens**
- ✅ الـ tokens محفوظة في `localStorage`
- ✅ Auto-refresh للـ access token

### File Structure:
```
frontend/
├── app/
│   ├── contact/          ✅ جاهز (يحتاج Backend)
│   ├── create-shipment/  🔴 قيد التطوير
│   ├── tracking/         🔴 قيد التطوير
│   ├── pricing/          🔴 قيد التطوير
│   ├── dashboard/        🔴 قيد التطوير
│   └── auth/             ✅ جاهز وموصول بالـ Backend
├── content/
│   ├── contact.json      ✅ جاهز
│   └── ...
└── lib/
    └── api.ts            ✅ Axios client جاهز
```

### Environment Variables المطلوبة:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-key-here
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_WHATSAPP_NUMBER=31683083916
```

---

## 📞 معلومات الاتصال

- **المكتب الأوروبي:** +31683083916
- **المكتب السوري:** +9639954778188
- **البريد الإلكتروني:** contact@medo-freight.eu

---

## 📅 آخر تحديث

**التاريخ:** 18 نوفمبر 2025
**الحالة:** Frontend جاهز لصفحة `/contact` - ينتظر Backend API

---

**ملاحظة:** الملفات PDF الموجودة في `frontend/public/documents/` جاهزة ومتاحة للتحميل.

