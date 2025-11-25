# 🔢 Per-Collection Numbering Solution - v2.5

## 📋 Overview

**Solusi final untuk masalah penomoran** - setiap collection memiliki numbering sendiri mulai dari 1.

**Date:** November 25, 2025  
**Version:** 2.5 (Per-Collection Numbering)

---

## 🎯 The Problem

### Root Cause:
1. **SQLite AUTOINCREMENT bersifat GLOBAL** - ID sequence shared across semua collection
2. **Tidak ada per-collection numbering** - Collection baru tidak mulai dari 1
3. **Database schema tidak mendukung per-collection ID**

### Example Problem:
```
Collection A: Products with IDs 1, 2, 3
Collection B: Products with IDs 4, 5, 6  ← Should be 1, 2, 3!

User expects:
Collection A: #1, #2, #3
Collection B: #1, #2, #3  ← Each collection starts from 1

But got:
Collection A: #1, #2, #3
Collection B: #4, #5, #6  ❌ Wrong!
```

---

## ✅ The Solution

### New Database Schema:
Tambah field `sequence_number` untuk numbering per-collection:

```sql
ALTER TABLE products ADD COLUMN sequence_number INTEGER;
CREATE INDEX idx_products_collection_sequence ON products(collection_id, sequence_number);
```

### How It Works:
```
Database Structure:
id | collection_id | sequence_number | name
---|---------------|-----------------|----------
1  | home         | 1               | Product A
2  | home         | 2               | Product B
3  | shop         | 1               | Product C  ← Starts from 1!
4  | shop         | 2               | Product D
5  | home         | 3               | Product E

Display:
Collection "home": #1 Product A, #2 Product B, #3 Product E
Collection "shop": #1 Product C, #2 Product D
```

**Benefits:**
- ✅ Each collection starts from 1
- ✅ Sequential numbering per collection
- ✅ Database sync compatible
- ✅ No gaps within collection
- ✅ Proper data model

---

## 🔧 Implementation

### 1. Database Migration

**File:** `migration-add-sequence-number.sql`

```sql
-- Add sequence_number column
ALTER TABLE products ADD COLUMN sequence_number INTEGER;

-- Create index
CREATE INDEX idx_products_collection_sequence ON products(collection_id, sequence_number);

-- Update existing products with sequence numbers
UPDATE products 
SET sequence_number = (
  SELECT COUNT(*) 
  FROM products p2 
  WHERE p2.collection_id = products.collection_id 
    AND p2.id <= products.id
);
```

---

### 2. Updated API - Create Product

**File:** `functions/api/products.js`

```javascript
export async function onRequestPost({ request, env }) {
  const product = await request.json();
  
  // Get next sequence number for this collection
  const { results: seqResults } = await env.DB.prepare(
    'SELECT MAX(sequence_number) as max_seq FROM products WHERE collection_id = ?'
  ).bind(product.collectionId).all();
  
  const nextSequence = (seqResults[0]?.max_seq || 0) + 1;
  
  // Insert with sequence_number
  const { results } = await env.DB.prepare(
    `INSERT INTO products (..., sequence_number, ...) 
     VALUES (..., ?, ...)`
  ).bind(..., nextSequence, ...).all();
  
  return new Response(JSON.stringify(results[0]));
}
```

---

### 3. Updated API - Get Products

```javascript
export async function onRequestGet({ env, request }) {
  const collectionId = url.searchParams.get('collectionId');
  
  if (collectionId) {
    // Order by sequence_number for this collection
    const { results } = await env.DB.prepare(
      'SELECT * FROM products WHERE collection_id = ? ORDER BY sequence_number ASC'
    ).bind(collectionId).all();
    
    return new Response(JSON.stringify(results));
  }
}
```

---

### 4. Resequence API

**File:** `functions/api/products/resequence.js`

```javascript
export async function onRequestPost({ request, env }) {
  const { collectionId } = await request.json();
  
  // Get all products in collection
  const { results: products } = await env.DB.prepare(
    'SELECT id FROM products WHERE collection_id = ? ORDER BY sequence_number ASC'
  ).bind(collectionId).all();
  
  // Update sequence numbers to 1, 2, 3, ...
  let newSequence = 1;
  for (const product of products) {
    await env.DB.prepare(
      'UPDATE products SET sequence_number = ? WHERE id = ?'
    ).bind(newSequence, product.id).run();
    newSequence++;
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    resequenced: products.length
  }));
}
```

---

### 5. Updated ProductCard

**File:** `src/components/ProductCard.jsx`

```javascript
<span className="text-xl font-bold mr-2">
  #{product.sequence_number || displayNumber || product.id}
</span>
```

**Priority:**
1. `product.sequence_number` (new, per-collection)
2. `displayNumber` (fallback, calculated)
3. `product.id` (last resort, global)

---

## 📊 Examples

### Example 1: New Collections

```
Create Collection "Electronics":
- Add Product A → sequence_number: 1 → Display: #1
- Add Product B → sequence_number: 2 → Display: #2
- Add Product C → sequence_number: 3 → Display: #3

Create Collection "Fashion":
- Add Product X → sequence_number: 1 → Display: #1  ✅ Starts from 1!
- Add Product Y → sequence_number: 2 → Display: #2
- Add Product Z → sequence_number: 3 → Display: #3
```

---

### Example 2: Delete & Resequence

```
Collection "Electronics":
Before: #1 Product A, #2 Product B, #3 Product C
Delete: Product B (#2)
After:  #1 Product A, #2 Product C (resequenced from #3)

Collection "Fashion" (unchanged):
#1 Product X, #2 Product Y, #3 Product Z
```

---

## 🗄️ Database Migration Steps

### Step 1: Run Migration

```bash
# Run the migration
wrangler d1 execute affiliate-db --file=migration-add-sequence-number.sql
```

### Step 2: Verify Migration

```bash
# Check if column added
wrangler d1 execute affiliate-db --command="PRAGMA table_info(products);"

# Should show sequence_number column

# Check data
wrangler d1 execute affiliate-db --command="SELECT id, collection_id, sequence_number, name FROM products LIMIT 10;"
```

**Expected Output:**
```
┌────┬───────────────┬─────────────────┬─────────────┐
│ id │ collection_id │ sequence_number │ name        │
├────┼───────────────┼─────────────────┼─────────────┤
│ 1  │ home          │ 1               │ Product A   │
│ 2  │ home          │ 2               │ Product B   │
│ 3  │ shop          │ 1               │ Product C   │
│ 4  │ shop          │ 2               │ Product D   │
└────┴───────────────┴─────────────────┴─────────────┘
```

---

## 🚀 Deployment

### Step 1: Run Migration

```bash
wrangler d1 execute affiliate-db --file=migration-add-sequence-number.sql
```

### Step 2: Deploy Code

```bash
npm run build
git add .
git commit -m "feat: v2.5 - Per-collection numbering with sequence_number field"
git push origin main
```

### Step 3: Verify

```bash
# Test resequence API
curl -X POST https://your-site.pages.dev/api/products/resequence \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"home"}'

# Expected: {"success":true,"resequenced":X}
```

---

## ✅ Benefits

### For Users:
- ✅ Each collection starts from #1
- ✅ Sequential numbering per collection
- ✅ No confusion between collections
- ✅ Professional appearance

### For System:
- ✅ Proper data model
- ✅ Database sync compatible
- ✅ Scalable solution
- ✅ No global ID conflicts

### For Developers:
- ✅ Clean implementation
- ✅ Easy to maintain
- ✅ Follows best practices
- ✅ Future-proof

---

## 📝 Summary

### What Changed:
1. ✅ Added `sequence_number` field to database
2. ✅ Each collection has independent numbering
3. ✅ Products ordered by `sequence_number`
4. ✅ Auto-assign next sequence on create
5. ✅ Resequence after delete to fill gaps

### Files Created:
1. ✅ `migration-add-sequence-number.sql`
2. ✅ `functions/api/products/resequence.js`

### Files Modified:
1. ✅ `functions/api/products.js`
2. ✅ `src/components/ProductCard.jsx`
3. ✅ `src/utils/api.js`
4. ✅ `src/utils/collections.js`

### Result:
- ✅ Each collection starts from #1
- ✅ Sequential numbering per collection
- ✅ Database sync compatible
- ✅ No gaps within collection
- ✅ Professional & scalable

---

**Version:** 2.5 (Per-Collection Numbering)  
**Status:** ✅ COMPLETE & PRODUCTION READY  
**Date:** November 25, 2025
