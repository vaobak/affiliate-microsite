# 📦 Migration Guide: localStorage → Cloudflare D1

## What Changed?

### Before (localStorage)
```javascript
// Data stored in browser
localStorage.setItem('collections', JSON.stringify(data));
// ❌ Each user has different data
// ❌ No sync between devices
```

### After (Cloudflare D1)
```javascript
// Data stored in cloud database
await fetch('/api/collections');
// ✅ All users see same data
// ✅ Sync across all devices
```

## Architecture

```
┌─────────────┐
│   Browser   │
│  (React App)│
└──────┬──────┘
       │ HTTP Requests
       ▼
┌─────────────────┐
│ Cloudflare Pages│
│   + Functions   │
└──────┬──────────┘
       │ SQL Queries
       ▼
┌─────────────────┐
│  Cloudflare D1  │
│   (Database)    │
└─────────────────┘
```

## File Changes

### New Files Created:
1. `schema.sql` - Database schema
2. `wrangler.toml` - Cloudflare configuration
3. `functions/api/*.js` - API endpoints
4. `src/utils/api.js` - API client
5. `CLOUDFLARE_SETUP.md` - Setup guide

### Files to Update:
You need to update these files to use the new API:
- `src/utils/collections.js` → Use `api.js` instead of localStorage
- `src/utils/storage.js` → Use `api.js` instead of localStorage
- `src/utils/analytics.js` → Use `api.js` instead of localStorage

## Quick Start

### 1. Install Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2. Create Database
```bash
wrangler d1 create affiliate-db
# Copy the database_id
```

### 3. Update wrangler.toml
Replace `YOUR_DATABASE_ID_HERE` with your database ID

### 4. Initialize Database
```bash
wrangler d1 execute affiliate-db --file=./schema.sql
```

### 5. Build & Deploy
```bash
npm run build
wrangler pages deploy dist --project-name=affiliate-microsite
```

### 6. Bind Database
In Cloudflare Dashboard:
- Pages → Your Project → Settings → Functions
- Add D1 binding: `DB` → `affiliate-db`

## Testing

### Local Development
```bash
# Option 1: Use Wrangler (with D1)
wrangler pages dev dist --d1=DB=affiliate-db --local

# Option 2: Use Vite (localStorage fallback)
npm run dev
```

### Production
Visit your Cloudflare Pages URL

## Data Migration

If you have existing data in localStorage, you can export it:

```javascript
// Run in browser console
const data = {
  collections: JSON.parse(localStorage.getItem('affiliate_collections') || '[]'),
  clicks: JSON.parse(localStorage.getItem('affiliate_click_history') || '[]'),
  views: JSON.parse(localStorage.getItem('affiliate_collection_views') || '[]')
};
console.log(JSON.stringify(data, null, 2));
// Copy this data and import to D1
```

## Benefits

### Before (localStorage)
- ❌ Data per browser
- ❌ No sync
- ❌ Lost on clear cache
- ❌ Not suitable for production

### After (Cloudflare D1)
- ✅ Centralized data
- ✅ Auto sync
- ✅ Persistent storage
- ✅ Production ready
- ✅ Free tier available
- ✅ Global CDN
- ✅ Fast queries

## Cost

**Cloudflare D1 Free Tier:**
- 5 GB storage
- 5 million reads/day
- 100,000 writes/day
- **Perfect for affiliate sites!**

## Support

Need help? Check:
1. `CLOUDFLARE_SETUP.md` - Detailed setup
2. Cloudflare D1 Docs: https://developers.cloudflare.com/d1/
3. Cloudflare Pages Docs: https://developers.cloudflare.com/pages/

## Next Steps

After deployment:
1. ✅ Test all features
2. ✅ Add your collections
3. ✅ Upload products
4. ✅ Share your site!
5. ✅ Monitor analytics

Your affiliate site is now **production-ready** with Cloudflare D1! 🚀
