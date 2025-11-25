# 📝 Changelog - Version 2.3.2

## 🎯 **Version 2.3.2** - November 25, 2025

### **🔢 Auto-Renumber Sequential IDs**

#### **Added:**
- ✅ Auto-renumber after delete product
- ✅ Auto-renumber after import products
- ✅ Renumber API endpoint (`/api/products/renumber`)
- ✅ Sequential ID management (no gaps)

#### **Fixed:**
- 🐛 ID gaps after deleting products
- 🐛 ID gaps after importing products
- 🐛 Non-sequential IDs in product list

#### **Files:**
- `functions/api/products/renumber.js` (NEW)
- `src/utils/api.js` (MODIFIED)
- `src/utils/collections.js` (MODIFIED)

---

## 🎨 **Version 2.3.1** - November 25, 2025

### **Typography & ID Improvements**

#### **Changed:**
- 📝 Nomor urut: `text-xl font-bold` (20px, bold)
- 📝 Nama produk: `text-lg font-semibold` (18px, semibold)
- 📝 Spacing: 8px gap between number and name

#### **Fixed:**
- 🐛 ID reset logic improved
- 🐛 Typography hierarchy clarified

#### **Files:**
- `src/components/ProductCard.jsx` (MODIFIED)
- `functions/api/products/reset-sequence.js` (MODIFIED)

---

## ✨ **Version 2.3** - November 25, 2025

### **Simplified Layout**

#### **Removed:**
- ❌ Category toggle button
- ❌ Category badge display
- ❌ Product description display
- ❌ Preference management for category toggle

#### **Changed:**
- 📝 Product card: Only #ID and Name
- 📝 Header: Simplified (no toggle button)
- 📝 Cleaner, more focused layout

#### **Files:**
- `src/pages/Home.jsx` (MODIFIED)
- `src/components/ProductCard.jsx` (MODIFIED)

---

## 🌐 **Version 2.2** - November 25, 2025

### **Cross-Device Preferences Sync**

#### **Added:**
- ✅ User preferences table in D1
- ✅ Preferences API endpoint
- ✅ Cross-device sync for settings
- ✅ Persistent preferences in database

#### **Files:**
- `migration-add-user-preferences.sql` (NEW)
- `functions/api/preferences.js` (NEW)
- `src/utils/api.js` (MODIFIED)
- `src/pages/Home.jsx` (MODIFIED)

---

## 🐛 **Version 2.1** - November 25, 2025

### **Bug Fixes & Improvements**

#### **Fixed:**
- 🐛 ID reset bug when collection empty
- 🐛 Import sequence management

#### **Added:**
- ✅ Category toggle feature
- ✅ Persistent settings (localStorage)
- ✅ Clean UI option

#### **Files:**
- `src/utils/collections.js` (MODIFIED)
- `src/utils/api.js` (MODIFIED)
- `functions/api/products/reset-sequence.js` (NEW)

---

## 🎨 **Version 2.0** - November 24, 2025

### **Linktree-Style Complete**

#### **Added:**
- ✅ Custom Google Fonts (Inter, Poppins, Space Grotesk)
- ✅ Product image thumbnails (16x16)
- ✅ Social proof counters (click counts)
- ✅ Beautiful empty states
- ✅ Glassmorphism design
- ✅ Smooth animations (5 types)
- ✅ Enhanced hover effects
- ✅ Professional typography
- ✅ 8 theme colors
- ✅ 12 background patterns

#### **Files:**
- `index.html` (MODIFIED)
- `tailwind.config.js` (MODIFIED)
- `src/components/ProductCard.jsx` (MODIFIED)
- `src/components/EmptyState.jsx` (NEW)
- `src/pages/Home.jsx` (MODIFIED)
- `src/utils/themes.js` (MODIFIED)

---

## 📊 **Version History Summary**

| Version | Date | Key Features |
|---------|------|--------------|
| 2.3.2 | Nov 25 | Auto-renumber sequential IDs |
| 2.3.1 | Nov 25 | Bold typography, ID fixes |
| 2.3 | Nov 25 | Simplified layout |
| 2.2 | Nov 25 | Cross-device sync |
| 2.1 | Nov 25 | Bug fixes, category toggle |
| 2.0 | Nov 24 | Linktree-style complete |
| 1.0 | Earlier | Initial release |

---

## 🎯 **Breaking Changes**

### **v2.3.2:**
- None (backward compatible)

### **v2.3:**
- Category display removed from public view
- Category toggle button removed

### **v2.2:**
- Requires `user_preferences` table migration
- localStorage preferences moved to D1

### **v2.0:**
- Requires theme & pattern migrations
- New font dependencies (Google Fonts)

---

## 📦 **Dependencies**

### **Runtime:**
- React 18
- React Router DOM
- Vite (Rolldown)
- Tailwind CSS
- XLSX (Excel import/export)

### **Fonts:**
- Inter (Google Fonts)
- Poppins (Google Fonts)
- Space Grotesk (Google Fonts)

### **Infrastructure:**
- Cloudflare Pages
- Cloudflare D1 Database
- Cloudflare Pages Functions

---

## 🗄️ **Database Schema**

### **Tables:**

1. **collections**
   - id, name, slug, description
   - theme, pattern, enable_animation
   - is_default, created_at, updated_at

2. **products**
   - id, collection_id, name, description
   - price, affiliate_link, image_url
   - category, badge, clicks
   - created_at, updated_at

3. **analytics**
   - id, type, product_id, collection_id
   - timestamp

4. **user_preferences** (NEW in v2.2)
   - id, key, value
   - created_at, updated_at

---

## 📝 **Migration Guide**

### **From v2.3.1 to v2.3.2:**
```bash
# No database migration needed
# Just deploy new code
git pull origin main
npm run build
git push origin main
```

### **From v2.2 to v2.3:**
```bash
# No database migration needed
# Category toggle removed (UI only)
git pull origin main
npm run build
git push origin main
```

### **From v2.1 to v2.2:**
```bash
# Run user_preferences migration
wrangler d1 execute affiliate-db --file=migration-add-user-preferences.sql

# Deploy code
git pull origin main
npm run build
git push origin main
```

### **From v2.0 to v2.1:**
```bash
# No database migration needed
# Just deploy new code
git pull origin main
npm run build
git push origin main
```

---

## 🐛 **Known Issues**

### **v2.3.2:**
- None currently

### **Previous Versions:**
- ~~v2.3.1: ID gaps after delete~~ (FIXED in v2.3.2)
- ~~v2.3: Category toggle removed~~ (By design)
- ~~v2.1: ID reset not working~~ (FIXED in v2.3.2)

---

## 🔮 **Upcoming Features**

### **Planned:**
- [ ] Bulk operations UI
- [ ] Advanced analytics dashboard
- [ ] Product search/filter
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Custom domain support

### **Under Consideration:**
- [ ] Product categories (admin only)
- [ ] Product tags
- [ ] Advanced sorting options
- [ ] Export analytics data
- [ ] API documentation

---

## 📞 **Support**

### **Documentation:**
- `FINAL_DEPLOYMENT_V2.3.2.md` - Deployment guide
- `AUTO_RENUMBER_FIX.md` - Renumber feature
- `DESIGN_SYSTEM.md` - Design reference
- `README.md` - Project overview

### **Issues:**
- Check documentation first
- Review troubleshooting sections
- Check browser console for errors
- Check Cloudflare logs

---

## 🎉 **Contributors**

- Development: Kiro AI Assistant
- Testing: User feedback
- Documentation: Comprehensive guides

---

## 📄 **License**

MIT License - See LICENSE file for details

---

**Last Updated:** November 25, 2025  
**Current Version:** 2.3.2  
**Status:** ✅ PRODUCTION READY
