# 🚀 Cloudflare D1 + Pages Setup Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`
- Logged in to Wrangler: `wrangler login`

## Step 1: Create D1 Database

```bash
# Create database
wrangler d1 create affiliate-db

# Output will show:
# database_id = "xxxx-xxxx-xxxx-xxxx"
# Copy this ID!
```

## Step 2: Update wrangler.toml

Edit `wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with your actual database ID.

## Step 3: Initialize Database Schema

```bash
# Run schema to create tables
wrangler d1 execute affiliate-db --file=./schema.sql
```

## Step 4: Build the Project

```bash
npm run build
```

## Step 5: Deploy to Cloudflare Pages

### Option A: Via Wrangler CLI

```bash
# Deploy
wrangler pages deploy dist --project-name=affiliate-microsite

# Bind D1 database
wrangler pages deployment create dist --project-name=affiliate-microsite --binding DB=affiliate-db
```

### Option B: Via Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Create new project
3. Connect to Git repository (or upload dist folder)
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Environment variables: (none needed)
6. Deploy!

## Step 6: Bind D1 Database to Pages

1. Go to your Pages project → Settings → Functions
2. Add D1 database binding:
   - Variable name: `DB`
   - D1 database: Select `affiliate-db`
3. Save

## Step 7: Test Your Site

Visit your Cloudflare Pages URL (e.g., `https://affiliate-microsite.pages.dev`)

## Verify Database

```bash
# Check tables
wrangler d1 execute affiliate-db --command="SELECT name FROM sqlite_master WHERE type='table'"

# Check collections
wrangler d1 execute affiliate-db --command="SELECT * FROM collections"

# Check products count
wrangler d1 execute affiliate-db --command="SELECT COUNT(*) as count FROM products"
```

## Local Development

```bash
# Run with local D1
wrangler pages dev dist --d1=DB=affiliate-db --local

# Or use Vite dev server (will use localStorage fallback)
npm run dev
```

## Database Management

### Add Sample Data

```bash
wrangler d1 execute affiliate-db --command="
INSERT INTO products (collection_id, name, description, price, affiliate_link, image_url, category) 
VALUES ('home', 'Sample Product', 'This is a sample', 99000, 'https://example.com', 'https://via.placeholder.com/300', 'Electronics')
"
```

### Backup Database

```bash
wrangler d1 export affiliate-db --output=backup.sql
```

### Restore Database

```bash
wrangler d1 execute affiliate-db --file=backup.sql
```

## Troubleshooting

### Functions not working?
- Check D1 binding in Pages settings
- Verify database_id in wrangler.toml
- Check browser console for API errors

### Database empty?
- Run schema.sql again
- Check if tables exist: `wrangler d1 execute affiliate-db --command="SELECT * FROM collections"`

### CORS errors?
- Functions automatically handle CORS
- Check if API endpoints are accessible: `/api/collections`

## Migration from localStorage

The app will automatically detect if D1 is available:
- If D1 available → Use D1 database
- If D1 not available → Fallback to localStorage (local dev)

## Cost Estimate

Cloudflare D1 Free Tier:
- ✅ 5 GB storage
- ✅ 5 million reads/day
- ✅ 100,000 writes/day
- ✅ More than enough for affiliate site!

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Bind D1 database
3. ✅ Test all features
4. ✅ Add your products
5. ✅ Share your site!

## Support

If you encounter issues:
1. Check Cloudflare Pages logs
2. Check D1 database status
3. Verify wrangler.toml configuration
4. Test API endpoints directly: `https://your-site.pages.dev/api/collections`
