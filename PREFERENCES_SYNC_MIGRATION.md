# 🔄 User Preferences Sync Migration

## 📋 **Overview**

Migration dari localStorage ke D1 database untuk user preferences agar setting sync across devices.

**Date:** November 25, 2025  
**Version:** 2.2 (Preferences Sync)

---

## 🎯 **What Changed**

### **Before (v2.1):**
```javascript
// localStorage - per device only
const [showCategory, setShowCategory] = useState(() => {
  const saved = localStorage.getItem('showCategory');
  return saved !== null ? JSON.parse(saved) : true;
});

const toggleShowCategory = () => {
  const newValue = !showCategory;
  setShowCategory(newValue);
  localStorage.setItem('showCategory', JSON.stringify(newValue));
};
```

**Problem:**
- Setting tidak sync across devices
- User harus set ulang di setiap device
- Tidak persistent jika clear browser data

---

### **After (v2.2):**
```javascript
// D1 Database - sync across devices
const [showCategory, setShowCategory] = useState(true);

useEffect(() => {
  loadPreferences();
}, []);

const loadPreferences = async () => {
  const value = await fetchPreference('showCategory');
  if (value !== null) {
    setShowCategory(value === 'true');
  }
};

const toggleShowCategory = async () => {
  const newValue = !showCategory;
  setShowCategory(newValue);
  await savePreference('showCategory', String(newValue));
};
```

**Benefits:**
- ✅ Setting sync across all devices
- ✅ Persistent even after clear browser data
- ✅ Centralized preference management
- ✅ Easy to add more preferences

---

## 🗄️ **Database Schema**

### **New Table: `user_preferences`**

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_preferences_key ON user_preferences(key);
```

**Columns:**
- `id` - Auto-increment primary key
- `key` - Preference key (unique)
- `value` - Preference value (stored as string)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Default Data:**
```sql
INSERT OR IGNORE INTO user_preferences (key, value) 
VALUES ('showCategory', 'true');
```

---

## 🚀 **Migration Steps**

### **Step 1: Run Database Migration**

```bash
# Using Wrangler CLI
wrangler d1 execute affiliate-db --file=migration-add-user-preferences.sql

# Or via Cloudflare Dashboard
# 1. Go to D1 Database
# 2. Select your database
# 3. Go to "Console" tab
# 4. Paste SQL from migration-add-user-preferences.sql
# 5. Click "Execute"
```

### **Step 2: Verify Migration**

```bash
# Check if table exists
wrangler d1 execute affiliate-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='user_preferences';"

# Check default data
wrangler d1 execute affiliate-db --command="SELECT * FROM user_preferences;"
```

Expected output:
```
┌────┬───────────────┬───────┬─────────────────────┬─────────────────────┐
│ id │ key           │ value │ created_at          │ updated_at          │
├────┼───────────────┼───────┼─────────────────────┼─────────────────────┤
│ 1  │ showCategory  │ true  │ 2025-11-25 10:00:00 │ 2025-11-25 10:00:00 │
└────┴───────────────┴───────┴─────────────────────┴─────────────────────┘
```

### **Step 3: Deploy Updated Code**

```bash
# Build
npm run build

# Deploy
git add .
git commit -m "feat: Migrate preferences to D1 for cross-device sync"
git push origin main
```

### **Step 4: Test**

1. **Device 1:**
   - Open site
   - Toggle category (hide)
   - Verify setting saved

2. **Device 2:**
   - Open site
   - Verify category is hidden (synced!)
   - Toggle category (show)

3. **Device 1:**
   - Refresh page
   - Verify category is shown (synced!)

---

## 📁 **Files Created/Modified**

### **New Files:**
1. ✅ `migration-add-user-preferences.sql` - Database migration
2. ✅ `functions/api/preferences.js` - API endpoint
3. ✅ `PREFERENCES_SYNC_MIGRATION.md` - This guide

### **Modified Files:**
1. ✅ `src/utils/api.js` - Added preference functions
2. ✅ `src/pages/Home.jsx` - Use D1 instead of localStorage

---

## 🔌 **API Endpoints**

### **GET /api/preferences**

Get all preferences:
```javascript
const prefs = await fetchAllPreferences();
// { showCategory: 'true', ... }
```

Get specific preference:
```javascript
const value = await fetchPreference('showCategory');
// 'true' or null
```

### **POST /api/preferences**

Save preference:
```javascript
await savePreference('showCategory', 'false');
// { success: true, key: 'showCategory', value: 'false' }
```

### **DELETE /api/preferences**

Delete preference:
```javascript
await deletePreference('showCategory');
// { success: true }
```

---

## 💻 **Code Examples**

### **Example 1: Load Preference**

```javascript
import { fetchPreference } from '../utils/api';

const [showCategory, setShowCategory] = useState(true);

useEffect(() => {
  loadPreference();
}, []);

const loadPreference = async () => {
  try {
    const value = await fetchPreference('showCategory');
    if (value !== null) {
      setShowCategory(value === 'true');
    }
  } catch (error) {
    console.error('Error loading preference:', error);
  }
};
```

### **Example 2: Save Preference**

```javascript
import { savePreference } from '../utils/api';

const toggleShowCategory = async () => {
  const newValue = !showCategory;
  setShowCategory(newValue);
  
  try {
    await savePreference('showCategory', String(newValue));
  } catch (error) {
    console.error('Error saving preference:', error);
    // Revert on error
    setShowCategory(!newValue);
  }
};
```

### **Example 3: Add New Preference**

```javascript
// Add dark mode preference
const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  loadDarkMode();
}, []);

const loadDarkMode = async () => {
  const value = await fetchPreference('darkMode');
  if (value !== null) {
    setDarkMode(value === 'true');
  }
};

const toggleDarkMode = async () => {
  const newValue = !darkMode;
  setDarkMode(newValue);
  await savePreference('darkMode', String(newValue));
};
```

---

## 🎯 **Benefits**

### **For Users:**
- ✅ Settings sync across all devices automatically
- ✅ No need to reconfigure on each device
- ✅ Settings persist even after clearing browser data
- ✅ Consistent experience everywhere

### **For Developers:**
- ✅ Centralized preference management
- ✅ Easy to add new preferences
- ✅ No localStorage limitations
- ✅ Better data persistence

### **For System:**
- ✅ All data in one place (D1)
- ✅ Easier backup and restore
- ✅ Better scalability
- ✅ Consistent data model

---

## 🔍 **Troubleshooting**

### **Issue: Preference not syncing**

**Check:**
1. Database migration ran successfully
2. API endpoint accessible
3. Network requests successful
4. No console errors

**Solution:**
```bash
# Verify table exists
wrangler d1 execute affiliate-db --command="SELECT * FROM user_preferences;"

# Check API endpoint
curl https://your-site.pages.dev/api/preferences
```

### **Issue: Default value not working**

**Check:**
1. Default data inserted in migration
2. API returns correct default

**Solution:**
```sql
-- Insert default if missing
INSERT OR IGNORE INTO user_preferences (key, value) 
VALUES ('showCategory', 'true');
```

### **Issue: Old localStorage value conflicts**

**Solution:**
```javascript
// Clear old localStorage on first load
useEffect(() => {
  // Remove old localStorage key
  localStorage.removeItem('showCategory');
}, []);
```

---

## 📊 **Data Migration**

### **Migrate Existing localStorage Data:**

If users have existing localStorage preferences, you can migrate them:

```javascript
// One-time migration on app load
useEffect(() => {
  migrateLocalStorageToD1();
}, []);

const migrateLocalStorageToD1 = async () => {
  const migrated = localStorage.getItem('preferences_migrated');
  if (migrated) return; // Already migrated
  
  try {
    // Get old localStorage value
    const oldValue = localStorage.getItem('showCategory');
    
    if (oldValue !== null) {
      // Save to D1
      await savePreference('showCategory', oldValue);
      
      // Mark as migrated
      localStorage.setItem('preferences_migrated', 'true');
      
      // Clean up old key
      localStorage.removeItem('showCategory');
      
      console.log('Preferences migrated to D1');
    }
  } catch (error) {
    console.error('Error migrating preferences:', error);
  }
};
```

---

## 🎨 **Future Enhancements**

### **Possible Additions:**

1. **More Preferences:**
   ```javascript
   - darkMode (boolean)
   - language (string)
   - itemsPerPage (number)
   - sortOrder (string)
   - viewMode (string: 'list' | 'grid')
   ```

2. **User Profiles:**
   ```sql
   CREATE TABLE user_profiles (
     id INTEGER PRIMARY KEY,
     name TEXT,
     email TEXT,
     preferences_json TEXT
   );
   ```

3. **Preference Groups:**
   ```javascript
   {
     display: { showCategory, darkMode, viewMode },
     behavior: { autoRefresh, notifications },
     advanced: { debugMode, apiTimeout }
   }
   ```

---

## ✅ **Summary**

### **What We Did:**
1. ✅ Created `user_preferences` table in D1
2. ✅ Built API endpoints for CRUD operations
3. ✅ Updated Home.jsx to use D1 instead of localStorage
4. ✅ Added preference loading on mount
5. ✅ Added async save on toggle

### **Result:**
- ✅ Category toggle now syncs across devices
- ✅ Settings persistent in database
- ✅ Easy to add more preferences
- ✅ Better user experience

### **Next Steps:**
1. Run database migration
2. Deploy updated code
3. Test on multiple devices
4. Monitor for issues

---

## 📝 **Checklist**

### **Before Deployment:**
- [ ] Run database migration
- [ ] Verify table created
- [ ] Test API endpoints locally
- [ ] Build successful
- [ ] No console errors

### **After Deployment:**
- [ ] Test on Device 1
- [ ] Toggle preference
- [ ] Test on Device 2
- [ ] Verify sync works
- [ ] Check database records

---

**Status:** ✅ READY FOR DEPLOYMENT  
**Version:** 2.2 (Preferences Sync)  
**Last Updated:** November 25, 2025
