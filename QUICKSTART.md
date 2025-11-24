# ⚡ Quick Start Guide

## 🚀 Mulai dalam 3 Langkah

### 1. Install Dependencies

```bash
cd affiliate-microsite
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Buka browser: `http://localhost:5173`

### 3. Login Admin

1. Klik menu atau buka: `http://localhost:5173/admin`
2. Password: `affindo2025`
3. Mulai tambah produk!

---

## 📖 Panduan Cepat

### Tambah Produk Pertama

1. Login ke admin (`/admin`)
2. Klik **"➕ Tambah Produk"** di sidebar
3. Isi form:
   - **Nama Produk:** Contoh: "Baju Bayi Keren"
   - **Link Affiliate:** Contoh: "https://tokopedia.link/abc123"
4. Klik **"💾 Simpan Produk"**
5. Produk akan muncul di halaman utama!

### Edit Produk

1. Di Dashboard, klik **"✏️ Edit"** pada produk
2. Update nama atau link
3. Klik **"💾 Update Produk"**

### Hapus Produk

1. Di Dashboard, klik **"🗑️ Hapus"** pada produk
2. Konfirmasi dengan klik **"Hapus"**
3. Produk akan terhapus

### Lihat Website Public

1. Klik **"🏠 Lihat Website"** di sidebar
2. Atau buka: `http://localhost:5173/`
3. Produk akan tampil dengan urutan terbaru di atas

---

## 🎯 Tips & Tricks

### 1. Testing Lokal

```bash
# Development
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

### 2. Data Persistence

- Data disimpan di **localStorage** browser
- Tidak hilang saat refresh
- Bersifat lokal per browser
- Clear localStorage untuk reset data

### 3. Reset Data

Buka Console Browser (F12) dan jalankan:

```javascript
localStorage.clear()
location.reload()
```

### 4. Tambah Data Dummy

Buka Console Browser (F12) dan jalankan:

```javascript
const dummyData = [
  { id: 1, name: "Baju Bayi Keren", url: "https://tokopedia.link/1" },
  { id: 2, name: "Botol Anti Tumpah", url: "https://tokopedia.link/2" },
  { id: 3, name: "Alat Pemasak Nasi", url: "https://tokopedia.link/3" }
];
localStorage.setItem('affiliate_items', JSON.stringify(dummyData));
location.reload();
```

---

## 🔧 Troubleshooting

### Port sudah digunakan

```bash
# Ganti port
npm run dev -- --port 3000
```

### Build error

```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tailwind tidak muncul

```bash
# Restart dev server
# Ctrl+C untuk stop
npm run dev
```

---

## 📦 Deploy ke Cloudflare Pages

### Cara Cepat

1. Push ke GitHub
2. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Pages > Create a project > Connect to Git
4. Pilih repository
5. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
6. Deploy!

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.

---

## 🎨 Customization

### Ganti Warna

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Ganti Font

Edit `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;600;700&display=swap');
```

### Ganti Password

Edit `src/utils/auth.js`:

```javascript
// Ganti 'affindo2025' dengan password baru
export async function verifyPassword(inputPassword) {
  const hashedInput = await hashPassword(inputPassword);
  const correctHash = await hashPassword('password-baru-anda');
  return hashedInput === correctHash;
}
```

---

## 📚 Dokumentasi Lengkap

- [README.md](./README.md) - Overview & instalasi
- [FEATURES.md](./FEATURES.md) - Daftar fitur lengkap
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Panduan deploy
- [QUICKSTART.md](./QUICKSTART.md) - Panduan cepat (file ini)

---

## 🆘 Butuh Bantuan?

1. Baca dokumentasi di atas
2. Check console browser untuk error (F12)
3. Pastikan Node.js versi 18+
4. Pastikan npm dependencies ter-install

---

## ✅ Checklist Sebelum Deploy

- [ ] Test semua fitur lokal
- [ ] Build berhasil (`npm run build`)
- [ ] Preview production (`npm run preview`)
- [ ] Tidak ada error di console
- [ ] Test di mobile browser
- [ ] Push ke GitHub
- [ ] Deploy ke Cloudflare Pages

---

Selamat menggunakan! 🎉

Jika ada pertanyaan, silakan buat issue di repository.
