# 🚀 Panduan Deploy ke Cloudflare Pages

## Persiapan

1. Pastikan project sudah di-push ke GitHub
2. Punya akun Cloudflare (gratis)

## Langkah Deploy

### Metode 1: Via Cloudflare Dashboard (Recommended)

1. **Login ke Cloudflare**
   - Buka https://dash.cloudflare.com/
   - Login dengan akun Anda

2. **Buat Project Baru**
   - Klik **Pages** di sidebar
   - Klik **Create a project**
   - Pilih **Connect to Git**

3. **Connect Repository**
   - Pilih GitHub
   - Authorize Cloudflare
   - Pilih repository project ini

4. **Set Build Configuration**
   ```
   Project name: affiliate-microsite (atau nama lain)
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Root directory: / (kosongkan jika project di root)
   ```

5. **Environment Variables** (Optional)
   - Tidak perlu environment variables untuk project ini

6. **Deploy**
   - Klik **Save and Deploy**
   - Tunggu proses build selesai (2-3 menit)
   - Project akan live di: `https://[project-name].pages.dev`

### Metode 2: Via Wrangler CLI

```bash
# 1. Install Wrangler globally
npm install -g wrangler

# 2. Login ke Cloudflare
wrangler login

# 3. Build project
npm run build

# 4. Deploy
wrangler pages deploy dist --project-name=affiliate-microsite

# 5. Follow prompts untuk setup
```

## Custom Domain (Optional)

1. Di Cloudflare Pages dashboard
2. Pilih project Anda
3. Klik **Custom domains**
4. Klik **Set up a custom domain**
5. Masukkan domain Anda
6. Follow instruksi DNS setup

## Auto Deploy

Setiap kali Anda push ke branch `main`, Cloudflare akan otomatis:
- Pull latest code
- Run build
- Deploy ke production

## Troubleshooting

### Build Failed

**Error:** `Command not found: npm`
- **Fix:** Pastikan Node.js version di Cloudflare settings adalah v18 atau lebih baru

**Error:** `Build output directory not found`
- **Fix:** Pastikan build output directory adalah `dist` (bukan `build`)

### Routing Issues

**Error:** 404 saat refresh halaman
- **Fix:** File `_redirects` sudah ada di folder `public/`
- Isi: `/*    /index.html   200`

### Blank Page

**Error:** Halaman putih setelah deploy
- **Fix:** Check browser console untuk error
- Pastikan semua dependencies ter-install
- Coba build lokal dulu: `npm run build && npm run preview`

## Verifikasi Deploy

Setelah deploy berhasil, test:

1. ✅ Buka homepage: `https://[your-site].pages.dev/`
2. ✅ Test routing: klik navigasi antar halaman
3. ✅ Test admin login: `/admin` dengan password `affindo2025`
4. ✅ Test CRUD: tambah, edit, hapus produk
5. ✅ Test responsive: buka di mobile

## Performance Tips

1. **Enable Caching**
   - Cloudflare otomatis cache static assets
   - No additional config needed

2. **Enable Minification**
   - Vite sudah minify otomatis saat build
   - Check di `vite.config.js`

3. **Enable Compression**
   - Cloudflare otomatis compress dengan Brotli/Gzip

## Monitoring

- **Analytics:** Cloudflare Pages > Analytics
- **Logs:** Cloudflare Pages > Deployments > View logs
- **Performance:** Cloudflare Web Analytics (optional)

## Rollback

Jika ada masalah:
1. Buka Cloudflare Pages dashboard
2. Pilih project
3. Klik **Deployments**
4. Pilih deployment sebelumnya
5. Klik **Rollback to this deployment**

## Update Project

```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Build and test production build
npm run build
npm run preview

# 4. Commit and push
git add .
git commit -m "Update: description"
git push origin main

# 5. Cloudflare auto-deploy
```

## Support

- Cloudflare Docs: https://developers.cloudflare.com/pages/
- Community: https://community.cloudflare.com/

---

Happy Deploying! 🎉
