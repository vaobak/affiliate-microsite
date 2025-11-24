# ⚡ Quick Start - Deploy dalam 10 Menit

## 🎯 Urutan Singkat

```
GitHub → D1 Database → Cloudflare Pages → Bind D1 → Done!
```

---

## 📝 Command Lengkap (Copy-Paste)

### 1️⃣ Upload ke GitHub

```bash
cd affiliate-microsite
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/affiliate-microsite.git
git branch -M main
git push -u origin main
```

### 2️⃣ Setup D1 Database

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Buat database
wrangler d1 create affiliate-db
# ⚠️ COPY database_id yang muncul!

# Edit wrangler.toml → ganti YOUR_DATABASE_ID_HERE

# Jalankan schema
wrangler d1 execute affiliate-db --file=./schema.sql
```

### 3️⃣ Deploy ke Pages

```bash
# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=affiliate-microsite
```

### 4️⃣ Bind D1 (Via Dashboard)

1. https://dash.cloudflare.com
2. Workers & Pages → affiliate-microsite
3. Settings → Functions → D1 database bindings
4. Add binding: Variable `DB`, Database `affiliate-db`
5. Save → Redeploy

---

## ✅ Verifikasi

```bash
# Cek database
wrangler d1 execute affiliate-db --command="SELECT * FROM collections"

# Buka website
# https://affiliate-microsite-xxx.pages.dev
```

---

## 🆘 Troubleshooting Cepat

| Error | Solusi |
|-------|--------|
| DB is not defined | Add D1 binding di Settings → Functions |
| Failed to fetch | Cek browser console, pastikan API `/api/collections` accessible |
| Database kosong | Jalankan ulang: `wrangler d1 execute affiliate-db --file=./schema.sql` |
| Website tidak update | Clear cache atau Incognito mode |

---

## 📚 Panduan Lengkap

Baca: `DEPLOY_GUIDE_PEMULA.md` untuk step-by-step detail!

---

## 🎉 Done!

Website live di: `https://affiliate-microsite-xxx.pages.dev`

**Gratis selamanya!** 🚀
