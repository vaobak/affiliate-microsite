# 🔄 Rebuild Plan - Affiliate Microsite dengan Cloudflare D1

## 📊 Status Saat Ini

### ❌ Masalah:
1. Dashboard blank setelah login
2. Data tidak sinkron antar perangkat/browser
3. Aplikasi masih menggunakan localStorage (data lokal per browser)
4. Fungsi async/await tidak di-handle dengan benar

### ✅ Yang Sudah Ada:
1. ✅ Database schema (`schema.sql`)
2. ✅ API endpoints (`functions/api/*.js`)
3. ✅ API client (`src/utils/api.js`)
4. ✅ Cloudflare D1 database sudah dibuat
5. ✅ D1 binding sudah ditambahkan (perlu verifikasi)
6. ✅ GitHub repository sudah ada
7. ✅ Cloudflare Pages sudah setup

## 🎯 Tujuan Rebuild

Membuat aplikasi affiliate microsite yang:
- ✅ 100% menggunakan Cloudflare D1 (no localStorage)
- ✅ Data sinkron untuk semua user/device
- ✅ Production-ready
- ✅ Semua fungsi async/await yang benar
- ✅ Dashboard tidak blank
- ✅ Semua fitur berfungsi normal

## 📋 Fitur yang Harus Ada

### Admin Panel:
1. ✅ Login system
2. ✅ Dashboard dengan stats real-time
3. ✅ Collections management (CRUD)
4. ✅ Products management per collection (CRUD)
5. ✅ Import/Export Excel
6. ✅ Analytics dashboard
7. ✅ Bulk operations
8. ✅ Notifications system
9. ✅ Dark mode

### Public Site:
1. ✅ Home page dengan products
2. ✅ Collection pages (dynamic routing)
3. ✅ Product cards dengan affiliate links
4. ✅ Click tracking
5. ✅ View tracking
6. ✅ Responsive design

## 🏗️ Arsitektur Baru

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  - All components use async/await       │
│  - Loading states everywhere            │
│  - Error handling                       │
└──────────────┬──────────────────────────┘
               │ HTTP Requests
               ▼
┌─────────────────────────────────────────┐
│    Cloudflare Pages Functions           │
│  - /api/collections (GET, POST, DELETE) │
│  - /api/products (GET, POST, PUT, DEL)  │
│  - /api/analytics (GET, POST)           │
└──────────────┬──────────────────────────┘
               │ SQL Queries
               ▼
┌─────────────────────────────────────────┐
│         Cloudflare D1 Database          │
│  - collections table                    │
│  - products table                       │
│  - click_history table                  │
│  - collection_views table               │
│  - page_views table                     │
│  - recent_activity table                │
└─────────────────────────────────────────┘
```

## 📝 File yang Perlu Diubah/Dibuat

### Utils (Prioritas Tinggi):
- [ ] `src/utils/api.js` - Sudah ada, perlu test
- [ ] `src/utils/collections.js` - Rebuild total (async)
- [ ] `src/utils/storage.js` - Rebuild total (async)
- [ ] `src/utils/analytics.js` - Rebuild total (async)
- [ ] `src/utils/auth.js` - Keep as-is (localStorage OK untuk auth)

### Pages (Prioritas Tinggi):
- [ ] `src/pages/Dashboard.jsx` - Rebuild dengan async/await
- [ ] `src/pages/Home.jsx` - Rebuild dengan async/await
- [ ] `src/pages/Collections.jsx` - Rebuild dengan async/await
- [ ] `src/pages/CollectionProducts.jsx` - Rebuild dengan async/await
- [ ] `src/pages/AddCollectionProduct.jsx` - Rebuild dengan async/await
- [ ] `src/pages/EditCollectionProduct.jsx` - Rebuild dengan async/await
- [ ] `src/pages/Analytics.jsx` - Rebuild dengan async/await

### Components (Prioritas Medium):
- [ ] `src/components/ProductCard.jsx` - Update untuk tracking
- [ ] `src/components/Sidebar.jsx` - Update untuk async data
- [ ] `src/components/NotificationPanel.jsx` - Keep as-is

### API Functions (Sudah Ada):
- [x] `functions/api/collections.js`
- [x] `functions/api/products.js`
- [x] `functions/api/analytics.js`

### Database (Sudah Ada):
- [x] `schema.sql`
- [x] `wrangler.toml`

## 🔧 Strategi Rebuild

### Phase 1: Core Utils (30 menit)
1. Rebuild `collections.js` - Pure async, no localStorage
2. Rebuild `storage.js` - Pure async, no localStorage
3. Rebuild `analytics.js` - Pure async, no localStorage

### Phase 2: Main Pages (60 menit)
1. Rebuild `Dashboard.jsx` - Async data loading, loading states
2. Rebuild `Home.jsx` - Async data loading
3. Rebuild `Collections.jsx` - Async CRUD operations

### Phase 3: Product Pages (45 menit)
1. Rebuild `CollectionProducts.jsx` - Async operations
2. Rebuild `AddCollectionProduct.jsx` - Async save
3. Rebuild `EditCollectionProduct.jsx` - Async update

### Phase 4: Analytics & Components (30 menit)
1. Rebuild `Analytics.jsx` - Async data
2. Update `ProductCard.jsx` - Async tracking
3. Update `Sidebar.jsx` - Async data

### Phase 5: Testing & Deploy (15 menit)
1. Test build locally
2. Fix any errors
3. Deploy to Cloudflare Pages
4. Test production

**Total Estimasi: 3 jam**

## ✅ Checklist Sebelum Mulai

Pastikan ini sudah ada:
- [ ] Cloudflare D1 database created (`affiliate-db`)
- [ ] Database schema executed (`wrangler d1 execute affiliate-db --file=./schema.sql`)
- [ ] D1 binding added di Cloudflare Pages (Variable: `DB`, Database: `affiliate-db`)
- [ ] GitHub repository ready
- [ ] Cloudflare Pages project ready

## 🚀 Next Session Plan

Di session berikutnya, kita akan:
1. Verifikasi D1 binding
2. Rebuild utils files (collections, storage, analytics)
3. Rebuild Dashboard.jsx
4. Rebuild Home.jsx
5. Test & deploy

## 📞 Informasi Penting

**GitHub Repo:** https://github.com/vaobak/affiliate-microsite
**Cloudflare Project:** affiliate-microsite
**Database:** affiliate-db

## 💡 Notes

- Semua fungsi HARUS async/await
- Semua component HARUS handle loading state
- Semua API call HARUS handle error
- No localStorage untuk data (hanya untuk auth & UI state)
- Test di 2 browser berbeda untuk verifikasi sync

---

## 🎯 Goal Akhir

Website affiliate yang:
- ✅ Live dan bisa diakses semua orang
- ✅ Admin bisa manage dari mana saja
- ✅ Data sinkron real-time
- ✅ Production-ready
- ✅ Gratis (Cloudflare free tier)

**Ready untuk session berikutnya!** 🚀
