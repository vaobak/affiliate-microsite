# 🚀 Panduan Deploy untuk Pemula - Cloudflare Pages + D1

## 📋 Persiapan

### Yang Anda Butuhkan:
1. ✅ Akun Cloudflare (gratis) - https://dash.cloudflare.com/sign-up
2. ✅ Akun GitHub (gratis) - https://github.com/signup
3. ✅ Node.js terinstall di komputer
4. ✅ Git terinstall di komputer

---

## 🎯 URUTAN LANGKAH (PENTING!)

```
1. Setup GitHub (Upload kode)
   ↓
2. Setup Cloudflare D1 (Buat database)
   ↓
3. Deploy ke Cloudflare Pages (Deploy website)
   ↓
4. Bind D1 ke Pages (Hubungkan database)
   ↓
5. Test Website (Cek hasilnya)
```

---

## 📝 LANGKAH 1: Upload Kode ke GitHub

### 1.1 Install Git (Jika Belum)
**Windows:**
- Download: https://git-scm.com/download/win
- Install dengan setting default

**Cek instalasi:**
```bash
git --version
# Harus muncul: git version 2.x.x
```

### 1.2 Buat Repository di GitHub

1. Buka https://github.com
2. Login ke akun Anda
3. Klik tombol **"New"** (hijau) atau **"+"** → **"New repository"**
4. Isi form:
   - Repository name: `affiliate-microsite`
   - Description: `Affiliate Microsite with Cloudflare D1`
   - Public atau Private: **Public** (recommended)
   - ❌ JANGAN centang "Add a README file"
5. Klik **"Create repository"**

### 1.3 Upload Kode dari Komputer

Buka **Command Prompt** atau **Terminal** di folder project Anda:

```bash
# Masuk ke folder project
cd affiliate-microsite

# Initialize git (jika belum)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit - Affiliate Microsite"

# Hubungkan ke GitHub (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/affiliate-microsite.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

**Jika diminta login:**
- Username: username GitHub Anda
- Password: gunakan **Personal Access Token** (bukan password biasa)
  - Buat token: https://github.com/settings/tokens
  - Pilih: Generate new token (classic)
  - Centang: `repo`
  - Copy token dan paste sebagai password

✅ **Cek:** Refresh halaman GitHub repository Anda, file sudah muncul!

---

## 🗄️ LANGKAH 2: Setup Cloudflare D1 Database

### 2.1 Install Wrangler CLI

Buka Command Prompt/Terminal:

```bash
# Install Wrangler globally
npm install -g wrangler

# Cek instalasi
wrangler --version
# Harus muncul: wrangler x.x.x
```

### 2.2 Login ke Cloudflare

```bash
wrangler login
```

- Browser akan terbuka
- Login dengan akun Cloudflare Anda
- Klik **"Allow"** untuk authorize Wrangler
- Kembali ke terminal, akan muncul: "Successfully logged in"

### 2.3 Buat D1 Database

```bash
# Buat database
wrangler d1 create affiliate-db
```

**Output akan seperti ini:**
```
✅ Successfully created DB 'affiliate-db'

[[d1_databases]]
binding = "DB"
database_name = "affiliate-db"
database_id = "xxxx-xxxx-xxxx-xxxx-xxxx"  ← COPY INI!
```

**PENTING:** Copy `database_id` yang muncul!

### 2.4 Update wrangler.toml

1. Buka file `wrangler.toml` di project Anda
2. Ganti `YOUR_DATABASE_ID_HERE` dengan database_id yang Anda copy
3. Save file

**Contoh:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "affiliate-db"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  ← ID Anda
```

### 2.5 Jalankan Database Schema

```bash
# Masih di folder project
wrangler d1 execute affiliate-db --file=./schema.sql
```

**Output:**
```
🌀 Executing on affiliate-db (xxxx-xxxx):
🌀 To execute on your local DB, pass the --local flag
🚣 Executed 15 commands in 0.5s
```

✅ **Database siap!** Tabel sudah dibuat.

### 2.6 Verifikasi Database (Opsional)

```bash
# Cek tabel yang dibuat
wrangler d1 execute affiliate-db --command="SELECT name FROM sqlite_master WHERE type='table'"

# Cek collections default
wrangler d1 execute affiliate-db --command="SELECT * FROM collections"
```

---

## 🌐 LANGKAH 3: Deploy ke Cloudflare Pages

### 3.1 Build Project

```bash
# Masih di folder project
npm run build
```

**Output:**
```
✓ built in 5.23s
dist/index.html                   0.45 kB
dist/assets/index-abc123.css     12.34 kB
dist/assets/index-xyz789.js     234.56 kB
```

✅ Folder `dist` sudah dibuat!

### 3.2 Deploy via Cloudflare Dashboard (RECOMMENDED untuk Pemula)

#### Opsi A: Via GitHub (RECOMMENDED)

1. **Buka Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Login

2. **Buka Pages**
   - Sidebar kiri → **"Workers & Pages"**
   - Klik **"Create application"**
   - Pilih **"Pages"**
   - Klik **"Connect to Git"**

3. **Connect GitHub**
   - Klik **"Connect GitHub"**
   - Authorize Cloudflare
   - Pilih repository: `affiliate-microsite`
   - Klik **"Begin setup"**

4. **Configure Build**
   - Project name: `affiliate-microsite` (atau nama lain)
   - Production branch: `main`
   - Build settings:
     - Framework preset: **"Vite"** (pilih dari dropdown)
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Klik **"Save and Deploy"**

5. **Tunggu Deploy Selesai**
   - Progress bar akan muncul
   - Tunggu 2-5 menit
   - Status: ✅ **"Success"**

6. **Dapatkan URL**
   - URL akan muncul: `https://affiliate-microsite-xxx.pages.dev`
   - Copy URL ini!

#### Opsi B: Via Wrangler CLI (Alternatif)

```bash
# Deploy langsung
wrangler pages deploy dist --project-name=affiliate-microsite
```

---

## 🔗 LANGKAH 4: Bind D1 Database ke Pages

### 4.1 Buka Settings

1. Di Cloudflare Dashboard
2. **Workers & Pages** → Pilih project Anda (`affiliate-microsite`)
3. Tab **"Settings"**
4. Scroll ke **"Functions"**

### 4.2 Add D1 Binding

1. Klik **"D1 database bindings"** → **"Add binding"**
2. Isi form:
   - **Variable name:** `DB` (harus persis ini!)
   - **D1 database:** Pilih `affiliate-db` dari dropdown
3. Klik **"Save"**

### 4.3 Redeploy (Penting!)

Setelah add binding, Anda perlu redeploy:

**Cara 1: Via Dashboard**
1. Tab **"Deployments"**
2. Klik **"..."** (titik tiga) di deployment terakhir
3. Klik **"Retry deployment"**

**Cara 2: Push ke GitHub**
```bash
# Buat perubahan kecil (misalnya edit README)
git add .
git commit -m "Add D1 binding"
git push
# Auto redeploy!
```

---

## ✅ LANGKAH 5: Test Website

### 5.1 Buka Website

Buka URL Anda: `https://affiliate-microsite-xxx.pages.dev`

### 5.2 Test Fitur

1. **Halaman Home**
   - ✅ Muncul default collections
   - ✅ Tidak ada error

2. **Dashboard (Admin)**
   - Buka: `https://your-site.pages.dev/admin`
   - Login dengan password default
   - ✅ Dashboard muncul
   - ✅ Stats menunjukkan 0 (normal untuk fresh install)

3. **Buat Collection**
   - Dashboard → Collections → Add New
   - Buat collection baru
   - ✅ Collection tersimpan

4. **Tambah Product**
   - Pilih collection → Add Product
   - Isi form dan save
   - ✅ Product tersimpan

5. **Test dari Device Lain**
   - Buka URL dari HP/komputer lain
   - ✅ Data yang sama muncul!

### 5.3 Cek Database

```bash
# Cek jumlah products
wrangler d1 execute affiliate-db --command="SELECT COUNT(*) as total FROM products"

# Lihat semua collections
wrangler d1 execute affiliate-db --command="SELECT * FROM collections"
```

---

## 🎉 SELESAI!

Website Anda sudah live dengan:
- ✅ Cloudflare Pages (hosting)
- ✅ Cloudflare D1 (database)
- ✅ Data tersinkron untuk semua user
- ✅ Gratis!

**URL Anda:** `https://affiliate-microsite-xxx.pages.dev`

---

## 🔧 Troubleshooting

### Error: "DB is not defined"
**Solusi:**
1. Pastikan D1 binding sudah ditambahkan (Langkah 4)
2. Variable name harus `DB` (huruf besar)
3. Redeploy setelah add binding

### Error: "Failed to fetch"
**Solusi:**
1. Cek browser console (F12)
2. Pastikan URL API benar: `/api/collections`
3. Cek Cloudflare Pages logs

### Database kosong
**Solusi:**
```bash
# Jalankan ulang schema
wrangler d1 execute affiliate-db --file=./schema.sql
```

### Website tidak update
**Solusi:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Atau buka Incognito mode
3. Atau hard refresh (Ctrl+F5)

---

## 📱 Update Website di Masa Depan

### Cara 1: Via GitHub (Otomatis)

```bash
# Edit kode di komputer
# Lalu push ke GitHub:
git add .
git commit -m "Update fitur xyz"
git push

# Cloudflare auto deploy! (2-5 menit)
```

### Cara 2: Via Wrangler

```bash
npm run build
wrangler pages deploy dist --project-name=affiliate-microsite
```

---

## 💰 Biaya

**Semuanya GRATIS!**
- ✅ Cloudflare Pages: Unlimited requests
- ✅ Cloudflare D1: 5GB storage, 5M reads/day
- ✅ GitHub: Unlimited public repos

---

## 📞 Butuh Bantuan?

1. **Cloudflare Docs:** https://developers.cloudflare.com/pages/
2. **D1 Docs:** https://developers.cloudflare.com/d1/
3. **Cloudflare Discord:** https://discord.gg/cloudflaredev

---

## 🎯 Checklist

Sebelum deploy, pastikan:
- [ ] Kode sudah di GitHub
- [ ] D1 database sudah dibuat
- [ ] `wrangler.toml` sudah diupdate dengan database_id
- [ ] Schema sudah dijalankan
- [ ] Project sudah di-build (`npm run build`)
- [ ] Deploy ke Cloudflare Pages
- [ ] D1 binding sudah ditambahkan
- [ ] Website sudah di-test

**Selamat! Website Anda sudah production-ready! 🚀**
