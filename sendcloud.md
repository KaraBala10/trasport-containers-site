All requests use:

```bash
export SENDCLOUD_PUBLIC_KEY="YOUR_PUBLIC_KEY"
export SENDCLOUD_SECRET_KEY="YOUR_SECRET_KEY"
```

Base API URL:

```
https://panel.sendcloud.sc/api/v2
```

Authentication:

```
-u "$SENDCLOUD_PUBLIC_KEY:$SENDCLOUD_SECRET_KEY"
```

---

## 1️⃣ List Shipping Methods

Use this first to get a valid `shipping_method` ID.

```bash
curl -X GET \
  -u "$SENDCLOUD_PUBLIC_KEY:$SENDCLOUD_SECRET_KEY" \
  "https://panel.sendcloud.sc/api/v2/shipping_methods" \
  -H "Accept: application/json"
```

You will get a JSON with shipping methods → pick one valid for EU transport.

---

## 2️⃣ List All Parcels

```bash
curl -X GET \
  -u "$SENDCLOUD_PUBLIC_KEY:$SENDCLOUD_SECRET_KEY" \
  "https://panel.sendcloud.sc/api/v2/parcels" \
  -H "Accept: application/json"
```

---

## 3️⃣ Create Parcel + Generate Label

⚠️ Replace `357` with a real `shipping_method` ID from step 1.

```bash
curl -X POST \
  -u "$SENDCLOUD_PUBLIC_KEY:$SENDCLOUD_SECRET_KEY" \
  "https://panel.sendcloud.sc/api/v2/parcels" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "parcel": {
      "name": "Test Receiver",
      "company_name": "Test Company",
      "address": "Teststreet 1",
      "house_number": "1",
      "city": "Berlin",
      "postal_code": "10115",
      "country": "DE",
      "email": "test@example.com",
      "telephone": "+49123456789",
      "weight": 10.5,
      "request_label": true,
      "shipping_method": 357
    }
  }'
```

**Response key points:**

* `parcel.id`
* `parcel.tracking_number`
* `parcel.documents[0].link` (A6 label)
* `parcel.label.normal_printer[]` (A4 printable labels)

---

## 4️⃣ Get Parcel by ID

Replace `580720117` with real parcel ID.

```bash
curl -X GET \
  -u "$SENDCLOUD_PUBLIC_KEY:$SENDCLOUD_SECRET_KEY" \
  "https://panel.sendcloud.sc/api/v2/parcels/580720117" \
  -H "Accept: application/json"
```

---

## 5️⃣ Download Label (A6 — from `documents.link`)

```bash
curl -X GET \
  -u "$SENDCLOUD_PUBLIC_KEY:$SENDCLOUD_SECRET_KEY" \
  "https://panel.sendcloud.sc/api/v2/parcels/580720117/documents/label" \
  -H "Accept: application/pdf" \
  -o label_580720117_a6.pdf
```

---

## 6️⃣ Download Label (A4 — `normal_printer`)

```bash
curl -X GET \
  -u "$SENDCLOUD_PUBLIC_KEY:$SENDCLOUD_SECRET_KEY" \
  "https://panel.sendcloud.sc/api/v2/labels/normal_printer/580720117?start_from=0" \
  -H "Accept: application/pdf" \
  -o label_580720117_normal_printer.pdf
```

---

## 7️⃣ Tracking URL (Directly from API response)

Example field:

```
parcel.tracking_url
```