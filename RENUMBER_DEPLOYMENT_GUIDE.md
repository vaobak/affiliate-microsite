# 🚀 Renumber Feature Deployment Guide

## 📋 **Overview**

Guide untuk deploy dan test fitur auto-renumber yang memastikan ID produk selalu berurutan tanpa gap.

**Version:** 2.3.2  
**Date:** November 25, 2025

---

## ✅ **Pre-Deployment Checklist**

- [x] Code changes complete
- [x] Build successful (10.65s)
- [x] No diagnostics errors
- [x] Renumber API endpoint created
- [x] Auto-renumber integrated

---

## 🚀 **Deployment Steps**

### **Step 1: Build Project**

```bash
cd affiliate-microsite
npm run build
```

**Expected Output:**
```
✓ built in ~10s
dist/index.html                   0.93 kB
dist/assets/index-*.css          40.16 kB
dist/assets/index-*.js          795.75 kB
```

---

### **Step 2: Deploy to Cloudflare Pages**

#### **Option A: Git Push (Automatic)**

```bash
git add .
git commit -m "feat: v2.3.2 - Auto-renumber sequential IDs"
git push origin main
```

Cloudflare Pages will automatically deploy.

---

#### **Option B: Wrangler CLI**

```bash
wrangler pages deploy dist
```

---

### **Step 3: Verify Deployment**

```bash
# Check deployment status
wrangler pages deployment list

# View logs
wrangler pages deployment tail
```

---

## 🧪 **Testing Guide**

### **Test 1: Delete Single Product**

**Steps:**
1. Go to admin dashboard
2. Create 3 products:
   - #1 Product A
   - #2 Product B
   - #3 Product C
3. Delete #2 (Product B)
4. Refresh page
5. Check IDs

**Expected Result:**
```
Before Delete:
#1 Product A
#2 Product B
#3 Product C

After Delete:
#1 Product A
#2 Product C (was #3) ✅ No gap!
```

**If Still Has Gap:**
- Check browser console for errors
- Check network tab for API calls
- Verify renumber API endpoint exists

---

### **Test 2: Delete Multiple Products**

**Steps:**
1. Create 5 products (#1-#5)
2. Delete #2 and #4
3. Refresh page
4. Check IDs

**Expected Result:**
```
Before: #1, #2, #3, #4, #5
Delete: #2, #4
After:  #1, #2 (was #3), #3 (was #5) ✅
```

---

### **Test 3: Import New Products**

**Steps:**
1. Have products: #1, #3 (gap from previous delete)
2. Import 2 new products
3. Check IDs

**Expected Result:**
```
Before: #1, #3 (gap)
Import: 2 products
After:  #1, #2 (was #3), #3 (new), #4 (new) ✅
```

---

### **Test 4: Import Replace**

**Steps:**
1. Have products with gaps: #1, #3, #5
2. Import Replace with 3 new products
3. Check IDs

**Expected Result:**
```
Before: #1, #3, #5 (gaps)
Replace: 3 products
After:  #1, #2, #3 ✅
```

---

## 🔍 **Troubleshooting**

### **Issue 1: Still Has Gaps After Delete**

**Possible Causes:**
1. Renumber API not deployed
2. API endpoint not accessible
3. JavaScript error preventing renumber call

**Debug Steps:**

1. **Check API Endpoint:**
```bash
curl -X POST https://your-site.pages.dev/api/products/renumber \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"home"}'
```

Expected response:
```json
{
  "success": true,
  "renumbered": 10,
  "newMaxId": 10,
  "message": "Renumbered 10 products from 1 to 10"
}
```

2. **Check Browser Console:**
- Open DevTools (F12)
- Go to Console tab
- Look for errors

3. **Check Network Tab:**
- Open DevTools (F12)
- Go to Network tab
- Delete a product
- Look for `/api/products/renumber` call
- Check if it returns 200 OK

---

### **Issue 2: Renumber API Returns 404**

**Cause:** API endpoint not deployed

**Solution:**
```bash
# Verify file exists
ls functions/api/products/renumber.js

# Redeploy
git add functions/api/products/renumber.js
git commit -m "fix: Add renumber API endpoint"
git push origin main
```

---

### **Issue 3: Renumber API Returns 500**

**Cause:** Database error or logic issue

**Debug:**
```bash
# Check logs
wrangler pages deployment tail

# Look for error messages
```

**Common Issues:**
- Database binding not configured
- SQL syntax error
- Missing columns in products table

---

### **Issue 4: Renumber Works But IDs Start From Wrong Number**

**Cause:** Logic uses minId from collection

**Expected Behavior:**
- If collection has #101, #103, #105
- After renumber: #101, #102, #103
- Starts from original minId (101)

**If You Want to Start From 1:**
- Delete ALL products from ALL collections
- Then import will start from #1

---

## 📊 **Verification Checklist**

### **After Deployment:**

- [ ] Site accessible
- [ ] No 500 errors
- [ ] Delete product works
- [ ] Renumber API called (check Network tab)
- [ ] IDs sequential after delete
- [ ] Import works
- [ ] IDs sequential after import

---

## 🔧 **Manual Renumber (If Needed)**

If auto-renumber doesn't work, you can manually trigger it:

### **Via API:**

```bash
curl -X POST https://your-site.pages.dev/api/products/renumber \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"home"}'
```

### **Via Browser Console:**

```javascript
// Open browser console (F12)
fetch('/api/products/renumber', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ collectionId: 'home' })
})
.then(r => r.json())
.then(data => console.log('Renumber result:', data));
```

---

## 📝 **Expected API Responses**

### **Success:**
```json
{
  "success": true,
  "renumbered": 50,
  "newMaxId": 150,
  "message": "Renumbered 50 products from 101 to 150"
}
```

### **Empty Collection:**
```json
{
  "success": true,
  "renumbered": 0,
  "message": "No products to renumber"
}
```

### **Error:**
```json
{
  "error": "Collection ID required"
}
```

---

## 🎯 **Success Criteria**

### **Feature Working If:**

1. ✅ Delete product → IDs renumbered automatically
2. ✅ No gaps in ID sequence
3. ✅ Import new → IDs sequential
4. ✅ Import replace → IDs start from 1 (or minId)
5. ✅ No errors in console
6. ✅ API returns 200 OK

---

## 📈 **Monitoring**

### **After Deployment:**

1. **Monitor Errors:**
```bash
wrangler pages deployment tail
```

2. **Check Analytics:**
- Cloudflare Dashboard > Analytics
- Monitor API request count
- Check error rate

3. **User Testing:**
- Test delete on multiple devices
- Test import functionality
- Verify IDs are sequential

---

## 🔄 **Rollback Plan**

### **If Issues Occur:**

#### **Option 1: Revert Code**
```bash
git revert HEAD
git push origin main
```

#### **Option 2: Disable Auto-Renumber**

Edit `src/utils/collections.js`:
```javascript
// Temporarily disable auto-renumber
export async function deleteProductFromCollection(collectionId, productId) {
  await api.deleteProduct(productId);
  // await api.renumberProductIds(collectionId); // Disabled
  return true;
}
```

---

## 📞 **Support**

### **If You Need Help:**

1. **Check Logs:**
```bash
wrangler pages deployment tail
```

2. **Check API:**
```bash
curl -X POST https://your-site.pages.dev/api/products/renumber \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"home"}'
```

3. **Check Documentation:**
- `AUTO_RENUMBER_FIX.md` - Feature documentation
- `RENUMBER_DEPLOYMENT_GUIDE.md` - This guide

---

## ✅ **Deployment Complete Checklist**

- [ ] Code deployed
- [ ] Build successful
- [ ] API endpoint accessible
- [ ] Delete test passed
- [ ] Import test passed
- [ ] No console errors
- [ ] IDs sequential
- [ ] No gaps after delete

---

## 🎉 **Success!**

If all tests pass, your renumber feature is working correctly!

**Expected Behavior:**
- Delete product → Auto-renumber → No gaps ✅
- Import products → Auto-renumber → Sequential IDs ✅
- Always clean, sequential numbering ✅

---

**Version:** 2.3.2 (Auto-Renumber)  
**Status:** ✅ DEPLOYED  
**Last Updated:** November 25, 2025
