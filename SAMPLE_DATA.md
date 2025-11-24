# 📦 Sample Data untuk Testing

## Cara Menggunakan

Buka Console Browser (F12) dan paste salah satu script di bawah, lalu tekan Enter.

---

## 🎯 Sample Data 1: Produk Bayi

```javascript
const babyProducts = [
  { id: 1, name: "Baju Bayi Keren", url: "https://tokopedia.link/baju-bayi" },
  { id: 2, name: "Botol Anti Tumpah", url: "https://shopee.co.id/botol-bayi" },
  { id: 3, name: "Popok Premium", url: "https://lazada.co.id/popok" },
  { id: 4, name: "Mainan Edukatif", url: "https://tokopedia.link/mainan" },
  { id: 5, name: "Stroller Lipat", url: "https://shopee.co.id/stroller" }
];
localStorage.setItem('affiliate_items', JSON.stringify(babyProducts));
alert('✅ Data produk bayi berhasil ditambahkan!');
location.reload();
```

---

## 🍳 Sample Data 2: Peralatan Dapur

```javascript
const kitchenProducts = [
  { id: 1, name: "Alat Pemasak Nasi", url: "https://tokopedia.link/rice-cooker" },
  { id: 2, name: "Blender Multifungsi", url: "https://shopee.co.id/blender" },
  { id: 3, name: "Panci Set Premium", url: "https://lazada.co.id/panci" },
  { id: 4, name: "Air Fryer Digital", url: "https://tokopedia.link/airfryer" },
  { id: 5, name: "Kompor Gas 2 Tungku", url: "https://shopee.co.id/kompor" },
  { id: 6, name: "Mixer Kue", url: "https://lazada.co.id/mixer" }
];
localStorage.setItem('affiliate_items', JSON.stringify(kitchenProducts));
alert('✅ Data peralatan dapur berhasil ditambahkan!');
location.reload();
```

---

## 👕 Sample Data 3: Fashion

```javascript
const fashionProducts = [
  { id: 1, name: "Kaos Premium Cotton", url: "https://tokopedia.link/kaos" },
  { id: 2, name: "Celana Jeans Slim Fit", url: "https://shopee.co.id/jeans" },
  { id: 3, name: "Jaket Hoodie", url: "https://lazada.co.id/hoodie" },
  { id: 4, name: "Sepatu Sneakers", url: "https://tokopedia.link/sneakers" },
  { id: 5, name: "Tas Ransel", url: "https://shopee.co.id/backpack" },
  { id: 6, name: "Jam Tangan Smart", url: "https://lazada.co.id/smartwatch" },
  { id: 7, name: "Kacamata Hitam", url: "https://tokopedia.link/sunglasses" }
];
localStorage.setItem('affiliate_items', JSON.stringify(fashionProducts));
alert('✅ Data fashion berhasil ditambahkan!');
location.reload();
```

---

## 💻 Sample Data 4: Elektronik

```javascript
const electronicProducts = [
  { id: 1, name: "Laptop Gaming", url: "https://tokopedia.link/laptop" },
  { id: 2, name: "Mouse Wireless", url: "https://shopee.co.id/mouse" },
  { id: 3, name: "Keyboard Mechanical", url: "https://lazada.co.id/keyboard" },
  { id: 4, name: "Headset Gaming", url: "https://tokopedia.link/headset" },
  { id: 5, name: "Webcam HD", url: "https://shopee.co.id/webcam" },
  { id: 6, name: "Monitor 24 inch", url: "https://lazada.co.id/monitor" },
  { id: 7, name: "Power Bank 20000mAh", url: "https://tokopedia.link/powerbank" },
  { id: 8, name: "Charger Fast Charging", url: "https://shopee.co.id/charger" }
];
localStorage.setItem('affiliate_items', JSON.stringify(electronicProducts));
alert('✅ Data elektronik berhasil ditambahkan!');
location.reload();
```

---

## 📚 Sample Data 5: Buku & Edukasi

```javascript
const bookProducts = [
  { id: 1, name: "Buku Motivasi Best Seller", url: "https://tokopedia.link/buku-motivasi" },
  { id: 2, name: "Novel Fiksi Populer", url: "https://shopee.co.id/novel" },
  { id: 3, name: "Buku Resep Masakan", url: "https://lazada.co.id/resep" },
  { id: 4, name: "Kamus Bahasa Inggris", url: "https://tokopedia.link/kamus" },
  { id: 5, name: "Buku Anak Bergambar", url: "https://shopee.co.id/buku-anak" }
];
localStorage.setItem('affiliate_items', JSON.stringify(bookProducts));
alert('✅ Data buku berhasil ditambahkan!');
location.reload();
```

---

## 🏋️ Sample Data 6: Olahraga & Fitness

```javascript
const sportsProducts = [
  { id: 1, name: "Matras Yoga Premium", url: "https://tokopedia.link/yoga-mat" },
  { id: 2, name: "Dumbbell Set 5kg", url: "https://shopee.co.id/dumbbell" },
  { id: 3, name: "Resistance Band", url: "https://lazada.co.id/resistance-band" },
  { id: 4, name: "Sepeda Lipat", url: "https://tokopedia.link/sepeda" },
  { id: 5, name: "Treadmill Elektrik", url: "https://shopee.co.id/treadmill" },
  { id: 6, name: "Botol Minum Sport", url: "https://lazada.co.id/botol-sport" }
];
localStorage.setItem('affiliate_items', JSON.stringify(sportsProducts));
alert('✅ Data olahraga berhasil ditambahkan!');
location.reload();
```

---

## 🎮 Sample Data 7: Gaming

```javascript
const gamingProducts = [
  { id: 1, name: "PlayStation 5", url: "https://tokopedia.link/ps5" },
  { id: 2, name: "Nintendo Switch", url: "https://shopee.co.id/switch" },
  { id: 3, name: "Gaming Chair", url: "https://lazada.co.id/gaming-chair" },
  { id: 4, name: "Controller Wireless", url: "https://tokopedia.link/controller" },
  { id: 5, name: "VR Headset", url: "https://shopee.co.id/vr" },
  { id: 6, name: "Gaming Desk", url: "https://lazada.co.id/gaming-desk" },
  { id: 7, name: "RGB LED Strip", url: "https://tokopedia.link/led-strip" }
];
localStorage.setItem('affiliate_items', JSON.stringify(gamingProducts));
alert('✅ Data gaming berhasil ditambahkan!');
location.reload();
```

---

## 🏠 Sample Data 8: Home & Living

```javascript
const homeProducts = [
  { id: 1, name: "Kasur Spring Bed", url: "https://tokopedia.link/kasur" },
  { id: 2, name: "Lemari Pakaian", url: "https://shopee.co.id/lemari" },
  { id: 3, name: "Meja Belajar", url: "https://lazada.co.id/meja" },
  { id: 4, name: "Kursi Kantor Ergonomis", url: "https://tokopedia.link/kursi" },
  { id: 5, name: "Lampu Tidur LED", url: "https://shopee.co.id/lampu" },
  { id: 6, name: "Karpet Bulu Lembut", url: "https://lazada.co.id/karpet" },
  { id: 7, name: "Gorden Minimalis", url: "https://tokopedia.link/gorden" },
  { id: 8, name: "Rak Buku Dinding", url: "https://shopee.co.id/rak" }
];
localStorage.setItem('affiliate_items', JSON.stringify(homeProducts));
alert('✅ Data home & living berhasil ditambahkan!');
location.reload();
```

---

## 🧹 Clear All Data

Untuk menghapus semua data dan mulai dari awal:

```javascript
localStorage.clear();
alert('✅ Semua data berhasil dihapus!');
location.reload();
```

---

## 🔄 Reset to Empty

Untuk reset ke array kosong:

```javascript
localStorage.setItem('affiliate_items', JSON.stringify([]));
alert('✅ Data direset ke kosong!');
location.reload();
```

---

## 📝 Custom Data Template

Gunakan template ini untuk membuat data custom Anda:

```javascript
const customProducts = [
  { id: 1, name: "Nama Produk 1", url: "https://link-affiliate-1.com" },
  { id: 2, name: "Nama Produk 2", url: "https://link-affiliate-2.com" },
  { id: 3, name: "Nama Produk 3", url: "https://link-affiliate-3.com" },
  // Tambahkan lebih banyak produk di sini
];
localStorage.setItem('affiliate_items', JSON.stringify(customProducts));
alert('✅ Data custom berhasil ditambahkan!');
location.reload();
```

---

## 💡 Tips

1. **ID harus unik** - Jangan ada ID yang sama
2. **ID berurutan** - Mulai dari 1, 2, 3, dst
3. **URL valid** - Pastikan URL lengkap dengan https://
4. **Nama jelas** - Gunakan nama produk yang deskriptif
5. **Reload otomatis** - Script akan reload halaman setelah data ditambahkan

---

## 🎯 Testing Scenarios

### Scenario 1: Empty State
```javascript
localStorage.setItem('affiliate_items', JSON.stringify([]));
location.reload();
```

### Scenario 2: Single Item
```javascript
localStorage.setItem('affiliate_items', JSON.stringify([
  { id: 1, name: "Produk Pertama", url: "https://example.com" }
]));
location.reload();
```

### Scenario 3: Many Items (10+)
```javascript
const manyProducts = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Produk ${i + 1}`,
  url: `https://example.com/product-${i + 1}`
}));
localStorage.setItem('affiliate_items', JSON.stringify(manyProducts));
location.reload();
```

---

## 🔍 View Current Data

Untuk melihat data yang sedang tersimpan:

```javascript
const data = localStorage.getItem('affiliate_items');
console.log('Current Data:', JSON.parse(data));
```

---

## 📊 Count Items

Untuk menghitung jumlah produk:

```javascript
const data = JSON.parse(localStorage.getItem('affiliate_items') || '[]');
console.log(`Total Produk: ${data.length}`);
alert(`Total Produk: ${data.length}`);
```

---

Selamat mencoba! 🎉
