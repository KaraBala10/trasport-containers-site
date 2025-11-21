# متطلبات توليد مستندات التصدير (Export Documents)

## نظرة عامة

يتم توليد مستندات التصدير **فقط** للشحنات من **أوروبا إلى سورية (EU → SY)** بعد الدفع وتأكيد الحجز.

---

## 1. Packing List (PDF)

### البيانات المطلوبة:

#### معلومات الشحنة:
- **رقم الشحنة** (Shipment ID): `MF-EU-YYYY-XXXXX`
- **تاريخ الإنشاء**: تاريخ إنشاء الشحنة
- **الاتجاه**: من أوروبا إلى سورية

#### بيانات المرسل (Sender):
- الاسم الكامل
- العنوان الكامل
- المدينة
- الدولة
- رقم الهاتف
- البريد الإلكتروني
- رقم الهوية/الجواز (إن وجد)

#### بيانات المستلم (Receiver):
- الاسم الكامل
- العنوان الكامل
- المدينة
- المحافظة (Syria)
- رقم الهاتف
- البريد الإلكتروني

#### تفاصيل الطرود:
- **عدد الطرود الإجمالي**
- **الوزن الكلي** (بالكيلوغرام)
- **الحجم الكلي (CBM)** (بالمتر المكعب)

#### لكل طرد:
- رقم الطرد (1, 2, 3...)
- **الوصف** (Description)
- **نوع المنتج** (Product Category)
- **HS Code** (يتم توليده تلقائياً حسب نوع المنتج)
- **الكمية** (Quantity)
- **الوزن** (Weight in kg)
- **الأبعاد** (Length × Width × Height in cm)
- **CBM** (الحجم)
- **ملاحظات**:
  - Fragile (إن كان الطرد هشاً)
  - Electronics (إن كان المنتج إلكترونياً)
  - Large Item (إن كان المنتج قطعة كبيرة)

---

## 2. Commercial Invoice (PDF)

### البيانات المطلوبة:

#### معلومات الفاتورة:
- **رقم الفاتورة**: نفس رقم الشحنة أو رقم فريد
- **تاريخ الفاتورة**: تاريخ إنشاء الشحنة
- **رقم الشحنة**: `MF-EU-YYYY-XXXXX`

#### بيانات المصدّر (Exporter):
**Medo-Freight EU**
- الاسم: Medo-Freight EU
- العنوان: Meekrapweg 2, 4571 RX Axel, Zeeland, Netherlands
- الهاتف: +31 683083916
- البريد الإلكتروني: contact@medo-freight.eu
- الموقع: www.medo-freight.eu
- رقم الضريبة/التسجيل: (يجب إضافته من Backend)

#### بيانات المستورد (Importer):
**شركة الإكرام التجارية (Al Ikram Trading Co.)**
- الاسم: شركة الإكرام التجارية / Al Ikram Trading Co.
- العنوان: 
  - الراموسة (بجانب كراج البولمان) – حلب
  - المدينة الصناعية – الشيخ نجار (منطقة مكاتب الشحن الدولي) – حلب
- الهاتف: +963 995 477 8188
- البريد الإلكتروني: alikramtrading.co@gmail.com
- رقم التسجيل: (يجب إضافته من Backend)

#### وصف البضاعة:
- **قائمة تفصيلية لكل طرد**:
  - رقم الطرد
  - وصف المنتج
  - نوع المنتج
  - **HS Code**
  - الكمية
  - **القيمة المصرّح بها** (Declared Value باليورو)
  - **بلد المنشأ** (Country of Origin):
    - EU (إن كان المنتج من أوروبا)
    - Mixed (إن كان المنتج من مصادر مختلفة)
    - يجب تحديده لكل طرد

#### التكاليف:
- **القيمة الإجمالية المصرّح بها** (Total Declared Value): مجموع قيم جميع الطرود
- **تكلفة الشحن** (Shipping Cost): السعر النهائي للشحنة (من `pricing.grandTotal`)
- **التأمين** (Insurance): إن وجد
- **التغليف** (Packaging): إن وجد
- **النقل الداخلي** (Internal Transport): إن وجد
- **الإجمالي** (Total): مجموع جميع التكاليف

#### التوقيع والختم:
- **توقيع إلكتروني** أو **صورة ختم** لـ Medo-Freight EU
- **تاريخ التوقيع**
- **مكان التوقيع**: Axel, Netherlands

---

## 3. API Endpoints المطلوبة

### GET `/api/shipments/{shipmentId}/packing-list/`

**الاستجابة:**
- Content-Type: `application/pdf`
- Response Type: `blob`
- يجب أن يعيد PDF جاهز للتحميل

**المعاملات:**
- `shipmentId` (path parameter): رقم الشحنة

**البيانات المطلوبة من قاعدة البيانات:**
- جميع بيانات الشحنة
- بيانات المرسل والمستلم
- جميع الطرود مع تفاصيلها
- HS Codes لكل منتج

---

### GET `/api/shipments/{shipmentId}/commercial-invoice/`

**الاستجابة:**
- Content-Type: `application/pdf`
- Response Type: `blob`
- يجب أن يعيد PDF جاهز للتحميل

**المعاملات:**
- `shipmentId` (path parameter): رقم الشحنة

**البيانات المطلوبة من قاعدة البيانات:**
- جميع بيانات الشحنة
- بيانات المرسل والمستلم
- جميع الطرود مع تفاصيلها
- القيم المصرّح بها
- HS Codes
- بلد المنشأ لكل منتج
- السعر النهائي

---

## 4. متطلبات قاعدة البيانات

### حفظ PDFs:
- يجب حفظ مسار (Path) كل PDF في قاعدة البيانات
- يجب ربط PDF بالشحنة (Shipment)
- يجب حفظ تاريخ الإنشاء

### الحقول المطلوبة في جدول Shipment:
```sql
- packing_list_pdf_path: VARCHAR(500) NULL
- commercial_invoice_pdf_path: VARCHAR(500) NULL
- packing_list_generated_at: TIMESTAMP NULL
- commercial_invoice_generated_at: TIMESTAMP NULL
```

---

## 5. إرسال البريد الإلكتروني

بعد توليد المستندات، يجب إرسال بريد إلكتروني للعميل يتضمن:

- **الموضوع**: Shipment Created – Medo-Freight EU
- **المحتوى**:
  - رقم الشحنة
  - تفاصيل الشحنة
  - السعر الإجمالي
  - التعليمات
- **المرفقات**:
  - Packing List PDF
  - Commercial Invoice PDF

---

## 6. لوحة التحكم (Dashboard)

يجب إتاحة تحميل المستندات من لوحة التحكم:
- زر تحميل Packing List
- زر تحميل Commercial Invoice
- عرض تاريخ الإنشاء
- إمكانية إعادة توليد المستندات (إن لزم)

---

## 7. ملاحظات مهمة

1. **المستندات تُولد فقط لـ EU → SY**: لا حاجة لتوليد مستندات تصدير من سورية إلى أوروبا في المرحلة الأولى.

2. **HS Codes**: يجب أن تكون مرتبطة بنوع المنتج (Product Category) كما هو محدد في `lib/pricing.ts`:
   - CLOTHES → 6204 / 6203
   - SHOES → 6403
   - MOBILE_PHONE → 8517.12
   - LAPTOP → 8471.30
   - LARGE_MIRROR → 7009
   - وغيرها...

3. **بلد المنشأ**: يجب تحديده لكل طرد:
   - EU: للمنتجات من أوروبا
   - Mixed: للمنتجات من مصادر مختلفة
   - يمكن أن يكون حقل اختياري في نموذج الطرد

4. **التوقيع والختم**: يمكن استخدام:
   - توقيع إلكتروني (Digital Signature)
   - صورة ختم (Stamp Image)
   - أو نص بسيط "Authorized Signature"

5. **التنسيق**: يجب أن يكون PDF بتنسيق احترافي:
   - استخدام شعار الشركة
   - ألوان الهوية البصرية (Dark Blue #002E5D, Yellow #FFD200)
   - خط Arial
   - تنسيق واضح ومنظم

---

## 8. مكتبات Python المقترحة لتوليد PDF

- **ReportLab**: لتوليد PDFs احترافية
- **WeasyPrint**: لتحويل HTML/CSS إلى PDF
- **FPDF**: مكتبة بسيطة لتوليد PDFs
- **xhtml2pdf**: لتحويل HTML إلى PDF

---

## 9. مثال على البيانات المطلوبة من API

عند استدعاء `/api/shipments/{shipmentId}/packing-list/`، يجب أن يعيد Backend:

```json
{
  "shipment": {
    "id": "MF-EU-2025-00123",
    "direction": "eu-sy",
    "created_at": "2025-01-15T10:30:00Z",
    "sender": {
      "fullName": "John Doe",
      "address": "123 Main St",
      "city": "Amsterdam",
      "country": "Netherlands",
      "phone": "+31 123456789",
      "email": "john@example.com"
    },
    "receiver": {
      "fullName": "أحمد محمد",
      "address": "شارع الرئيسي 123",
      "city": "حلب",
      "province": "حلب",
      "phone": "+963 123456789",
      "email": "ahmed@example.com"
    },
    "parcels": [
      {
        "id": 1,
        "description": "Clothes and shoes",
        "productCategory": "CLOTHES",
        "hsCode": "6204",
        "quantity": 5,
        "weight": 15.5,
        "length": 50,
        "width": 40,
        "height": 30,
        "cbm": 0.06,
        "declaredValue": 200,
        "countryOfOrigin": "EU",
        "fragile": false,
        "isElectronics": false
      }
    ],
    "totalWeight": 15.5,
    "totalCBM": 0.06,
    "pricing": {
      "grandTotal": 75.00
    }
  }
}
```

---

## 10. حالة التنفيذ

✅ **Frontend جاهز:**
- Step11Confirmation يعرض أزرار التحميل
- API calls جاهزة في `lib/api.ts`
- المستندات تظهر فقط لـ EU → SY
- معالجة الأخطاء موجودة

⏳ **Backend مطلوب:**
- إنشاء API endpoints
- توليد PDFs
- حفظ PDFs في قاعدة البيانات
- إرسال البريد الإلكتروني
- ربط مع لوحة التحكم

---

**آخر تحديث:** 2025-01-15

