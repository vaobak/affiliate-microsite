# 🧪 Test Sequence Behavior - v2.5

## 📋 Test Cases untuk Per-Collection Numbering

**Version:** 2.5  
**Date:** November 25, 2025

---

## ✅ Test Case 1: Delete Product & Resequence

### Scenario:
```
Before:
#101 Pakaian pria baru 2025
#102 baju keren 2025         ← DELETE THIS
#103 sepatu kece 2025

After (Expected):
#101 Pakaian pria baru 2025
#102 sepatu kece 2025        ← Resequenced from #103
```

### How It Works:

1. **User deletes product #102**
2. **System calls:** `deleteProductFromCollection(collectionId, 102)`
3. **Function executes:**
   ```javascript
   // Delete product
   await api.deleteProduct(102);
   
   // Auto-resequence remaining products
   await api.resequenceProducts(collectionId);
   ```
4. **Resequence API:**
   ```javascript
   // Get remaining products: [101, 103]
   // Assign new sequence: 101→1, 103→2
   ```
5. **Result:**
   ```
   Product 101: sequence_number = 1 → Display: #1
   Product 103: sequence_number = 2 → Display: #2
   ```

### ✅ Expected Behavior:
- ✅ Product #102 deleted
- ✅ Product #103 becomes #102 (resequenced)
- ✅ No gaps in numbering
- ✅ Sequential: #1, #2, #3, ...

---

## ✅ Test Case 2: Add Product After Delete

### Scenario:
```
Before:
#101 Pakaian pria baru 2025
#102 baju keren 2025
#103 sepatu kece 2025        ← DELETE THIS

After Delete:
#101 Pakaian pria baru 2025
#102 baju keren 2025         ← Resequenced

Add New Product:
#101 Pakaian pria baru 2025
#102 baju keren 2025
#103 sepatu wow 2025         ← NEW! (Not #104!)
```

### How It Works:

1. **User deletes product #103**
2. **System resequences:**
   ```
   Product 101: sequence_number = 1
   Product 102: sequence_number = 2
   ```
3. **User adds new product**
4. **System calculates next sequence:**
   ```javascript
   // Get MAX(sequence_number) = 2
   // Next sequence = 2 + 1 = 3
   ```
5. **New product created:**
   ```
   Product 104: sequence_number = 3 → Display: #3
   ```

### ✅ Expected Behavior:
- ✅ After delete: #1, #2 (no gaps)
- ✅ Add new: Gets sequence #3
- ✅ Display: #1, #2, #3 (sequential)
- ✅ No skipped numbers

---

## ✅ Test Case 3: Multiple Deletes

### Scenario:
```
Before:
#1 Product A
#2 Product B    ← DELETE
#3 Product C
#4 Product D    ← DELETE
#5 Product E

After:
#1 Product A
#2 Product C    ← Resequenced from #3
#3 Product E    ← Resequenced from #5
```

### How It Works:

1. **Delete Product B (#2)**
   - Resequence: A=1, C=2, D=3, E=4
2. **Delete Product D (now #3)**
   - Resequence: A=1, C=2, E=3

### ✅ Expected Behavior:
- ✅ Always sequential after each delete
- ✅ No gaps: #1, #2, #3
- ✅ Resequence fills gaps automatically

---

## ✅ Test Case 4: New Collection Starts from #1

### Scenario:
```
Collection "Fashion":
#1 Product A
#2 Product B
#3 Product C

Create New Collection "Electronics":
#1 Product X    ← Starts from #1!
#2 Product Y
#3 Product Z
```

### How It Works:

1. **Create new collection "Electronics"**
2. **Add first product:**
   ```javascript
   // Get MAX(sequence_number) WHERE collection_id = 'electronics'
   // Result: NULL (no products yet)
   // Next sequence = 0 + 1 = 1
   ```
3. **Product created with sequence_number = 1**

### ✅ Expected Behavior:
- ✅ Each collection independent
- ✅ New collection starts from #1
- ✅ No interference between collections

---

## ✅ Test Case 5: Import Products (Replace)

### Scenario:
```
Before:
#1 Old Product A
#2 Old Product B
#3 Old Product C

Import (Replace Mode):
- Delete all existing products
- Import new products

After:
#1 New Product X
#2 New Product Y
#3 New Product Z
```

### How It Works:

1. **Delete all existing products**
2. **Import new products one by one:**
   ```javascript
   // First product: MAX(sequence_number) = NULL → sequence = 1
   // Second product: MAX(sequence_number) = 1 → sequence = 2
   // Third product: MAX(sequence_number) = 2 → sequence = 3
   ```
3. **Resequence after import (ensures 1, 2, 3, ...)**

### ✅ Expected Behavior:
- ✅ Old products deleted
- ✅ New products start from #1
- ✅ Sequential numbering

---

## ✅ Test Case 6: Import Products (Add New)

### Scenario:
```
Before:
#1 Existing Product A
#2 Existing Product B

Import (Add New Mode):
- Keep existing products
- Add new products

After:
#1 Existing Product A
#2 Existing Product B
#3 New Product X        ← Continues from #2
#4 New Product Y
#5 New Product Z
```

### How It Works:

1. **Keep existing products (sequence 1, 2)**
2. **Import new products:**
   ```javascript
   // First import: MAX(sequence_number) = 2 → sequence = 3
   // Second import: MAX(sequence_number) = 3 → sequence = 4
   // Third import: MAX(sequence_number) = 4 → sequence = 5
   ```
3. **Resequence after import (ensures no gaps)**

### ✅ Expected Behavior:
- ✅ Existing products kept
- ✅ New products continue sequence
- ✅ No gaps: #1, #2, #3, #4, #5

---

## 🔍 Database State Examples

### Example 1: After Delete & Resequence

**Database:**
```sql
SELECT id, collection_id, sequence_number, name FROM products WHERE collection_id = 'fashion';
```

**Result:**
```
┌────┬───────────────┬─────────────────┬─────────────────────┐
│ id │ collection_id │ sequence_number │ name                │
├────┼───────────────┼─────────────────┼─────────────────────┤
│ 101│ fashion       │ 1               │ Pakaian pria baru   │
│ 103│ fashion       │ 2               │ sepatu kece 2025    │
└────┴───────────────┴─────────────────┴─────────────────────┘
```

**Display:**
```
#1 Pakaian pria baru
#2 sepatu kece 2025
```

---

### Example 2: Multiple Collections

**Database:**
```sql
SELECT id, collection_id, sequence_number, name FROM products ORDER BY collection_id, sequence_number;
```

**Result:**
```
┌────┬───────────────┬─────────────────┬─────────────┐
│ id │ collection_id │ sequence_number │ name        │
├────┼───────────────┼─────────────────┼─────────────┤
│ 1  │ electronics   │ 1               │ iPhone      │
│ 2  │ electronics   │ 2               │ MacBook     │
│ 3  │ fashion       │ 1               │ T-Shirt     │
│ 4  │ fashion       │ 2               │ Jeans       │
│ 5  │ fashion       │ 3               │ Sneakers    │
└────┴───────────────┴─────────────────┴─────────────┘
```

**Display:**
```
Collection "electronics":
#1 iPhone
#2 MacBook

Collection "fashion":
#1 T-Shirt
#2 Jeans
#3 Sneakers
```

---

## 🎯 Key Points

### ✅ What Happens on Delete:
1. Product deleted from database
2. **Resequence triggered automatically**
3. Remaining products renumbered: 1, 2, 3, ...
4. No gaps in sequence

### ✅ What Happens on Add:
1. System calculates: `MAX(sequence_number) + 1`
2. New product gets next sequence
3. **No resequence needed** (already sequential)
4. Continues from last number

### ✅ What Happens on Import:
1. Products imported one by one
2. Each gets next sequence number
3. **Resequence at end** (ensures no gaps)
4. Final result: 1, 2, 3, ...

---

## 🧪 Manual Testing Steps

### Test 1: Delete & Resequence

```bash
# 1. Create test collection
curl -X POST https://your-site.pages.dev/api/collections \
  -H "Content-Type: application/json" \
  -d '{"id":"test","name":"Test","slug":"test"}'

# 2. Add 3 products
curl -X POST https://your-site.pages.dev/api/products \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"test","name":"Product A","affiliateLink":"https://example.com"}'

# Repeat for Product B and C

# 3. Check sequence numbers
curl "https://your-site.pages.dev/api/products?collectionId=test"
# Expected: sequence_number: 1, 2, 3

# 4. Delete middle product (Product B)
curl -X DELETE https://your-site.pages.dev/api/products \
  -H "Content-Type: application/json" \
  -d '{"id":2}'

# 5. Trigger resequence
curl -X POST https://your-site.pages.dev/api/products/resequence \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"test"}'

# 6. Check result
curl "https://your-site.pages.dev/api/products?collectionId=test"
# Expected: sequence_number: 1, 2 (no gap!)
```

---

## ✅ Success Criteria

### All Tests Pass If:

1. ✅ **Delete triggers resequence**
   - Gaps filled automatically
   - Sequential: 1, 2, 3, ...

2. ✅ **Add gets correct sequence**
   - Continues from last number
   - No skipped numbers

3. ✅ **Multiple collections independent**
   - Each starts from #1
   - No interference

4. ✅ **Import works correctly**
   - Replace: Starts from #1
   - Add: Continues sequence

5. ✅ **Database sync works**
   - Cross-device consistent
   - No conflicts

---

**Version:** 2.5  
**Status:** ✅ ALL BEHAVIORS CORRECT  
**Date:** November 25, 2025
