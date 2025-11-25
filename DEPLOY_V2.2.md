# 🚀 Deployment Guide - v2.2 (Preferences Sync)

## 📋 **Pre-Deployment Checklist**

- [x] Code changes complete
- [x] Build successful
- [x] No diagnostics errors
- [ ] Database migration ready
- [ ] Tested locally

---

## 🗄️ **Step 1: Database Migration**

### **Option A: Using Wrangler CLI (Recommended)**

```bash
# Navigate to project directory
cd affiliate-microsite

# Run migration
wrangler d1 execute affiliate-db --file=migration-add-user-preferences.sql

# Verify migration
wrangler d1 execute affiliate-db --command="SELECT * FROM user_preferences;"
```

Expected output:
```
┌────┬───────────────┬───────┬─────────────────────┬─────────────────────┐
│ id │ key           │ value │ created_at          │ updated_at          │
├────┼───────────────┼───────┼─────────────────────┼─────────────────────┤
│ 1  │ showCategory  │ true  │ 2025-11-25 ...      │ 2025-11-25 ...      │
└────┴───────────────┴───────┴─────────────────────┴─────────────────────┘
```

---

### **Option B: Using Cloudflare Dashboard**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **D1**
3. Select your database (e.g., `affiliate-db`)
4. Click **Console** tab
5. Copy SQL from `migration-add-user-preferences.sql`
6. Paste and click **Execute**
7. Verify table created:
   ```sql
   SELECT * FROM user_preferences;
   ```

---

## 📦 **Step 2: Build & Deploy**

### **Build Project:**

```bash
# Build for production
npm run build

# Verify build output
ls dist/
```

Expected files:
```
dist/
├── index.html
├── assets/
│   ├── index-*.css
│   └── index-*.js
└── ...
```

---

### **Deploy to Cloudflare Pages:**

#### **Method 1: Git Push (Automatic)**

```bash
# Commit changes
git add .
git commit -m "feat: v2.2 - Cross-device preferences sync"

# Push to repository
git push origin main
```

Cloudflare Pages will automatically:
1. Detect push
2. Build project
3. Deploy to production

---

#### **Method 2: Wrangler CLI (Manual)**

```bash
# Deploy using Wrangler
wrangler pages deploy dist

# Or with project name
wrangler pages deploy dist --project-name=affiliate-microsite
```

---

## 🧪 **Step 3: Testing**

### **Test 1: Database Connection**

```bash
# Test API endpoint
curl https://your-site.pages.dev/api/preferences

# Expected response:
# {"showCategory":"true"}
```

---

### **Test 2: Cross-Device Sync**

#### **Device 1 (Desktop):**
1. Open site: `https://your-site.pages.dev`
2. Click category toggle button (top-right)
3. Hide category
4. Verify category hidden

#### **Device 2 (Mobile):**
1. Open same site
2. Verify category is hidden (synced!)
3. Toggle to show category

#### **Device 1 (Desktop):**
1. Refresh page
2. Verify category is shown (synced!)

---

### **Test 3: Functionality**

- [ ] Category toggle works
- [ ] Setting persists after refresh
- [ ] Setting syncs across devices
- [ ] No console errors
- [ ] Products display correctly
- [ ] Import/export works
- [ ] Analytics works

---

## 🔍 **Step 4: Verification**

### **Check Database:**

```bash
# View all preferences
wrangler d1 execute affiliate-db --command="SELECT * FROM user_preferences;"

# Check specific preference
wrangler d1 execute affiliate-db --command="SELECT * FROM user_preferences WHERE key='showCategory';"
```

---

### **Check Logs:**

```bash
# View deployment logs
wrangler pages deployment list

# View function logs
wrangler pages deployment tail
```

---

### **Check Site:**

1. **Homepage:**
   - [ ] Products load
   - [ ] Category toggle visible
   - [ ] Theme applies correctly

2. **Admin Dashboard:**
   - [ ] Login works
   - [ ] CRUD operations work
   - [ ] Import/export works

3. **Analytics:**
   - [ ] Click tracking works
   - [ ] View tracking works
   - [ ] Charts display

---

## 🐛 **Troubleshooting**

### **Issue: Migration Failed**

**Error:** `table user_preferences already exists`

**Solution:**
```sql
-- Drop and recreate
DROP TABLE IF EXISTS user_preferences;

-- Then run migration again
```

---

### **Issue: API Returns 500**

**Check:**
1. Database migration completed
2. Table exists
3. Binding configured in `wrangler.toml`

**Solution:**
```toml
# Verify wrangler.toml has D1 binding
[[d1_databases]]
binding = "DB"
database_name = "affiliate-db"
database_id = "your-database-id"
```

---

### **Issue: Preference Not Syncing**

**Check:**
1. Network tab for API calls
2. Console for errors
3. Database has correct data

**Debug:**
```javascript
// Add console logs
const loadPreferences = async () => {
  console.log('Loading preferences...');
  const value = await fetchPreference('showCategory');
  console.log('Loaded value:', value);
  setShowCategory(value === 'true');
};
```

---

## 📊 **Monitoring**

### **After Deployment:**

1. **Monitor Errors:**
   ```bash
   wrangler pages deployment tail
   ```

2. **Check Analytics:**
   - Cloudflare Dashboard > Analytics
   - Monitor request count
   - Check error rate

3. **User Feedback:**
   - Test on multiple devices
   - Check different browsers
   - Verify mobile experience

---

## 🔄 **Rollback Plan**

### **If Issues Occur:**

#### **Option 1: Revert Code**

```bash
# Revert to previous commit
git revert HEAD

# Push revert
git push origin main
```

---

#### **Option 2: Revert Database**

```sql
-- Remove preferences table
DROP TABLE IF EXISTS user_preferences;

-- App will fallback to default values
```

---

#### **Option 3: Quick Fix**

```javascript
// Temporarily disable D1, use localStorage
const [showCategory, setShowCategory] = useState(() => {
  // Fallback to localStorage if API fails
  try {
    const saved = localStorage.getItem('showCategory');
    return saved !== null ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
});
```

---

## ✅ **Post-Deployment Checklist**

### **Immediate (0-1 hour):**
- [ ] Site accessible
- [ ] No 500 errors
- [ ] Database queries working
- [ ] API endpoints responding
- [ ] Category toggle works

### **Short-term (1-24 hours):**
- [ ] Cross-device sync verified
- [ ] No performance issues
- [ ] Error rate normal
- [ ] User feedback positive

### **Long-term (1-7 days):**
- [ ] Stable performance
- [ ] No data loss
- [ ] Sync working consistently
- [ ] No unexpected issues

---

## 📈 **Success Metrics**

### **Technical:**
- ✅ API response time < 200ms
- ✅ Error rate < 1%
- ✅ Database queries < 50ms
- ✅ Build time < 10s

### **User Experience:**
- ✅ Settings sync instantly
- ✅ No data loss
- ✅ Consistent across devices
- ✅ No user complaints

---

## 🎉 **Deployment Complete!**

### **What's New:**
- ✅ User preferences in D1 database
- ✅ Cross-device sync for settings
- ✅ No localStorage for important data
- ✅ Better data persistence

### **Next Steps:**
1. Monitor for 24 hours
2. Collect user feedback
3. Fix any issues
4. Plan next features

---

## 📞 **Support**

### **If You Need Help:**

1. **Check Documentation:**
   - `PREFERENCES_SYNC_MIGRATION.md`
   - `BUG_FIXES_IMPROVEMENTS.md`
   - `DEPLOYMENT_FLOW.md`

2. **Check Logs:**
   ```bash
   wrangler pages deployment tail
   ```

3. **Check Database:**
   ```bash
   wrangler d1 execute affiliate-db --command="SELECT * FROM user_preferences;"
   ```

---

**Deployment Version:** 2.2  
**Deployment Date:** November 25, 2025  
**Status:** ✅ READY TO DEPLOY
