# 🚀 Deploy Now - Quick Commands

## ⚡ **Quick Deployment**

```bash
# 1. Build
npm run build

# 2. Deploy
git add .
git commit -m "feat: v2.3.2 - Auto-renumber, bold typography, simple layout"
git push origin main
```

**Done!** Cloudflare Pages will auto-deploy. ✅

---

## 🗄️ **Database Migration (If Needed)**

```bash
# Check if user_preferences table exists
wrangler d1 execute affiliate-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='user_preferences';"

# If not exists, run migration
wrangler d1 execute affiliate-db --file=migration-add-user-preferences.sql
```

---

## 🧪 **Quick Test After Deploy**

### **Test 1: Delete Product**
1. Go to admin dashboard
2. Create products: #1, #2, #3
3. Delete #2
4. **Expected:** #1, #2 (was #3) ✅

### **Test 2: Check Typography**
1. Open homepage
2. **Expected:** 
   - Bold numbers (20px)
   - Semibold names (18px)
   - 8px spacing

---

## 🔍 **Quick Debug**

### **If renumber not working:**

```javascript
// Open browser console (F12)
fetch('/api/products/renumber', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ collectionId: 'home' })
})
.then(r => r.json())
.then(console.log);
```

### **Check API:**

```bash
curl -X POST https://your-site.pages.dev/api/products/renumber \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"home"}'
```

---

## 📊 **Expected Results**

### **Build:**
```
✓ built in ~10s
CSS:  40.16 kB (gzipped: 6.98 kB)
JS:   795.75 kB (gzipped: 239.81 kB)
```

### **Features:**
- ✅ Auto-renumber after delete
- ✅ Bold number typography
- ✅ Simple card layout
- ✅ No gaps in IDs

---

## 📚 **Full Documentation**

For complete guide, see:
- `FINAL_DEPLOYMENT_V2.3.2.md`
- `CHANGELOG_V2.3.2.md`

---

**Version:** 2.3.2  
**Status:** ✅ READY TO DEPLOY
