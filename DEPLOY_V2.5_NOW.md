# 🚀 Deploy v2.5 - Per-Collection Numbering

## ⚡ Quick Deployment Guide

**Version:** 2.5 (Per-Collection Numbering)  
**Date:** November 25, 2025

---

## 🎯 What's New

**Major Feature:** Per-collection numbering - setiap collection mulai dari #1

**Example:**
```
Collection "Electronics": #1, #2, #3
Collection "Fashion":     #1, #2, #3  ← Starts from 1!
Collection "Books":       #1, #2, #3  ← Each independent!
```

---

## 📋 Pre-Deployment Checklist

- ✅ Build successful (tested)
- ✅ Migration file ready
- ✅ API endpoints created
- ✅ Frontend updated
- ✅ No breaking changes

---

## 🗄️ Step 1: Database Migration (REQUIRED!)

### Run Migration:

```bash
cd affiliate-microsite

# Run migration to add sequence_number field
wrangler d1 execute affiliate-db --file=migration-add-sequence-number.sql
```

### Verify Migration:

```bash
# Check if column added
wrangler d1 execute affiliate-db --command="PRAGMA table_info(products);"

# Should show sequence_number in the list

# Check data
wrangler d1 execute affiliate-db --command="SELECT id, collection_id, sequence_number, name FROM products LIMIT 5;"
```

**Expected Output:**
```
┌────┬───────────────┬─────────────────┬─────────────┐
│ id │ collection_id │ sequence_number │ name        │
├────┼───────────────┼─────────────────┼─────────────┤
│ 1  │ home          │ 1               │ Product A   │
│ 2  │ home          │ 2               │ Product B   │
│ 3  │ shop          │ 1               │ Product C   │
└────┴───────────────┴─────────────────┴─────────────┘
```

---

## 🚀 Step 2: Deploy Code

### Build & Deploy:

```bash
# Build for production
npm run build

# Commit changes
git add .
git commit -m "feat: v2.5 - Per-collection numbering with sequence_number field"

# Push to deploy (Cloudflare Pages auto-deploys)
git push origin main
```

---

## ✅ Step 3: Verify Deployment

### Test 1: Check API

```bash
# Test resequence API
curl -X POST https://your-site.pages.dev/api/products/resequence \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"home"}'

# Expected: {"success":true,"resequenced":X,"message":"..."}
```

### Test 2: Check Products API

```bash
# Get products with sequence_number
curl "https://your-site.pages.dev/api/products?collectionId=home"

# Should return products with sequence_number field
```

### Test 3: Manual Testing

1. **Create New Collection:**
   - Go to Dashboard
   - Create collection "Test"
   - Add 3 products
   - Expected: #1, #2, #3

2. **Test Multiple Collections:**
   - Collection A: #1, #2, #3
   - Collection B: #1, #2, #3 ← Both start from 1!

3. **Test Delete:**
   - Have: #1, #2, #3
   - Delete: #2
   - Expected: #1, #2 (resequenced)

---

## 🔍 Troubleshooting

### Issue: Migration Failed

**Error:** `no such column: sequence_number`

**Solution:**
```bash
# Run migration again
wrangler d1 execute affiliate-db --file=migration-add-sequence-number.sql

# Verify
wrangler d1 execute affiliate-db --command="PRAGMA table_info(products);"
```

---

### Issue: Products Show Wrong Numbers

**Debug:**
1. Check database:
```bash
wrangler d1 execute affiliate-db --command="SELECT id, sequence_number, name FROM products LIMIT 5;"
```

2. Check API response:
```bash
curl "https://your-site.pages.dev/api/products?collectionId=home"
# Should include sequence_number field
```

3. Check browser console for errors

---

### Issue: Resequence Not Working

**Debug:**
1. Check browser console (F12):
```
Expected logs:
- "[Resequence] Starting resequence..."
- "[Resequence] Response status: 200"
- "[Resequence] Success: {...}"
```

2. Manual trigger in browser console:
```javascript
fetch('/api/products/resequence', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ collectionId: 'home' })
})
.then(r => r.json())
.then(data => {
  console.log('Manual resequence:', data);
  location.reload();
});
```

---

## 📊 Success Criteria

Deployment successful if:

1. ✅ Database migration completed
2. ✅ All API endpoints accessible
3. ✅ New collections start from #1
4. ✅ Multiple collections independent
5. ✅ Delete triggers resequence
6. ✅ No console errors
7. ✅ Cross-device sync works

---

## 🎉 Done!

**Setiap collection sekarang punya numbering sendiri mulai dari 1!**

### What You Now Have:
- ✅ Per-collection numbering
- ✅ Database sync compatible
- ✅ Professional appearance
- ✅ Scalable solution

---

## 📚 Documentation

- `PER_COLLECTION_NUMBERING_SOLUTION.md` - Complete technical guide
- `migration-add-sequence-number.sql` - Database migration
- `functions/api/products/resequence.js` - Resequence API

---

**Version:** 2.5  
**Status:** ✅ DEPLOYED  
**Date:** November 25, 2025
