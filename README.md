# Affiliate Microsite

Microsite React.js modern untuk menampilkan daftar affiliate link dengan admin panel lengkap.

## 🚀 Fitur

- ✅ Halaman Public untuk menampilkan produk (urutan descending)
- ✅ Admin Login dengan password terenkripsi SHA-256
- ✅ Dashboard Admin dengan CRUD lengkap
- ✅ Search bar untuk mencari produk
- ✅ UI Modern dengan Tailwind CSS
- ✅ Responsive mobile-friendly
- ✅ Data disimpan di localStorage (no backend)
- ✅ Siap deploy ke Cloudflare Pages

## 🔐 Login Admin

**URL:** `/admin`  
**Password:** `affindo2025`

## 🛠️ Tech Stack

- React.js 18
- Vite
- React Router DOM
- Tailwind CSS
- localStorage untuk data storage

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build
```

## 🌐 Deploy ke Cloudflare Pages

### Cara 1: Via Dashboard Cloudflare

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih **Pages** > **Create a project**
3. Connect repository GitHub Anda
4. Set build configuration:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (atau folder project jika ada)
5. Klik **Save and Deploy**

### Cara 2: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login ke Cloudflare
wrangler login

# Build project
npm run build

# Deploy
wrangler pages deploy dist
```

## 📁 Struktur Project

```
affiliate-microsite/
├── src/
│   ├── components/
│   │   ├── ProductCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── Dashboard.jsx
│   │   ├── AddProduct.jsx
│   │   └── EditProduct.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── utils/
│   │   ├── auth.js
│   │   └── storage.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🎨 Halaman

### 1. Public Page (`/`)
- Menampilkan semua produk dalam card
- Urutan descending (terbaru di atas)
- Tombol "Lihat Produk" membuka link di tab baru

### 2. Admin Login (`/admin`)
- Form login dengan password
- Password di-hash dengan SHA-256
- Redirect ke dashboard setelah login

### 3. Dashboard (`/dashboard`)
- List semua produk
- Search bar
- Tombol Edit & Delete
- Konfirmasi sebelum delete

### 4. Add Product (`/add`)
- Form tambah produk baru
- Validasi input
- Auto redirect ke dashboard

### 5. Edit Product (`/edit/:id`)
- Form edit produk existing
- Pre-filled dengan data lama
- Update dan simpan

## 💾 Data Structure

Data disimpan di localStorage dengan key `affiliate_items`:

```json
[
  {
    "id": 1,
    "name": "Baju Bayi Keren",
    "url": "https://affiliate.link/produk"
  }
]
```

## 🔒 Security

- Password admin di-hash menggunakan SHA-256
- Protected routes dengan authentication check
- Auto redirect jika belum login

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: mobile, tablet, desktop
- Touch-friendly buttons

## 🎯 Testing Checklist

- [x] CRUD berfungsi 100%
- [x] Sorting descending benar
- [x] Password login benar
- [x] Protected routes berfungsi
- [x] Redirect otomatis
- [x] Responsive di mobile
- [x] localStorage persistence

## 📝 Notes

- Tidak menggunakan backend atau database
- Semua data di localStorage browser
- Cocok untuk personal use atau demo
- Untuk production dengan banyak user, pertimbangkan backend

## 🤝 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.

---

Made with ❤️ using React + Vite + Tailwind CSS
