# 📊 Import Products - Template Guide

## ✅ **Excel Template Format**

File Excel harus memiliki kolom-kolom berikut:

### **Required Columns (Wajib):**
1. **Product Name** atau **Name** - Nama produk
2. **Affiliate Link** - Link affiliate produk

### **Optional Columns (Opsional):**
3. **Description** - Deskripsi produk
4. **Price** - Harga produk (angka)
5. **Image URL** - URL gambar produk
6. **Category** - Kategori produk
7. **Badge** - Badge produk (NEW, HOT, SALE, dll)
8. **Clicks** - Jumlah klik (akan diabaikan saat import)

---

## 📋 **Contoh Template Excel:**

### **Format 1 (Recommended):**
| Product Name | Category | Affiliate Link | Badge | Clicks |
|--------------|----------|----------------|-------|--------|
| Contoh Produk Baru 1 | Fashion Pria | https://example.com/product1 | NEW | 0 |
| Contoh Produk Baru 2 | Elektronik | https://example.com/product2 | HOT | 0 |

### **Format 2 (Also Supported):**
| Name | Affiliate Link | Description | Price | Image URL | Category | Badge |
|------|---------------|-------------|-------|-----------|----------|-------|
| Produk A | https://tokopedia.link/abc123 | Deskripsi produk A | 100000 | https://example.com/img1.jpg | Elektronik | NEW |
| Produk B | https://shopee.co.id/xyz789 | Deskripsi produk B | 250000 | https://example.com/img2.jpg | Fashion | HOT |

---

## 🚀 **Cara Import:**

### **Import New (Tambah Produk Baru):**
1. Buka halaman **Manage Products** untuk collection yang diinginkan
2. Klik tombol **Import** → **Import New**
3. Pilih file Excel (.xlsx atau .xls)
4. ✅ Produk baru akan ditambahkan tanpa menghapus produk existing

### **Import Replace (Ganti Semua Produk):**
1. Buka halaman **Manage Products** untuk collection yang diinginkan
2. Klik tombol **Import** → **Import Replace**
3. Pilih file Excel (.xlsx atau .xls)
4. ⚠️ **WARNING:** Semua produk existing akan dihapus dan diganti dengan produk dari Excel

---

## ⚠️ **Important Notes:**

### **1. Required Fields:**
- **Name** dan **Affiliate Link** WAJIB diisi
- Jika salah satu kosong, produk akan di-skip

### **2. Column Names:**
- Nama kolom harus **PERSIS** seperti di template
- Supported formats:
  - **Product Name** atau **Name** (untuk nama produk)
  - **Affiliate Link** (untuk link affiliate)
  - **Category**, **Badge**, **Description**, **Price**, **Image URL**
- Gunakan spasi: "Affiliate Link" ✅, "AffiliateLink" ❌
- Gunakan spasi: "Product Name" ✅, "ProductName" ❌

### **3. Data Types:**
- **Price** harus angka (tanpa Rp, tanpa titik/koma)
  - ✅ Benar: `100000`
  - ❌ Salah: `Rp 100.000`, `100,000`
- **URLs** harus lengkap dengan `https://`
  - ✅ Benar: `https://tokopedia.link/abc123`
  - ❌ Salah: `tokopedia.link/abc123`

### **4. Empty Cells:**
- Kolom optional boleh kosong
- Akan diisi dengan default value:
  - Description: `''` (kosong)
  - Price: `0`
  - Image URL: `''` (kosong)
  - Category: `'Uncategorized'`
  - Badge: `''` (kosong)

---

## 🔍 **Troubleshooting:**

### **Error: "Failed to create product"**
**Penyebab:**
- Name atau Affiliate Link kosong
- Format kolom salah

**Solusi:**
1. Cek nama kolom (harus persis seperti template)
2. Pastikan Name dan Affiliate Link terisi
3. Cek format URL (harus lengkap dengan https://)

### **Error: "File Excel kosong"**
**Penyebab:**
- Sheet Excel tidak ada data
- Hanya ada header tanpa data

**Solusi:**
- Pastikan ada minimal 1 baris data (selain header)

### **Notif: "X produk baru ditambahkan. Total produk: Y"**
**Jika X < jumlah baris di Excel:**
- Beberapa produk di-skip karena Name atau Affiliate Link kosong
- Cek console browser (F12) untuk detail error

---

## 📥 **Download Template:**

Buat file Excel baru dengan struktur ini:

**Sheet 1 (Format Recommended):**
```
Row 1 (Header): Product Name | Category | Affiliate Link | Badge | Clicks
Row 2 (Data):   Contoh Produk 1 | Fashion Pria | https://example.com/product1 | NEW | 0
Row 3 (Data):   Contoh Produk 2 | Elektronik | https://example.com/product2 | HOT | 0
...
```

**Sheet 1 (Format Alternative):**
```
Row 1 (Header): Name | Affiliate Link | Description | Price | Image URL | Category | Badge
Row 2 (Data):   Produk 1 | https://... | Deskripsi | 100000 | https://... | Elektronik | NEW
Row 3 (Data):   Produk 2 | https://... | Deskripsi | 200000 | https://... | Fashion | HOT
...
```

Save as: `template-import-products.xlsx`

---

## ✅ **Best Practices:**

1. **Test dengan 1-2 produk dulu** sebelum import banyak
2. **Backup data** sebelum Import Replace
3. **Gunakan Import New** jika ingin menambah produk
4. **Gunakan Import Replace** jika ingin reset semua produk
5. **Cek hasil import** di halaman Manage Products

---

**Happy Importing!** 🚀✨
