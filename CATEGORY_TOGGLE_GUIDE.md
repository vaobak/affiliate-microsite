# 🏷️ Category Toggle Feature Guide

## 📋 **Overview**

Fitur toggle untuk menampilkan/menyembunyikan kategori produk di product card. User bisa memilih tampilan yang lebih clean (hanya nomor dan nama) atau tampilan lengkap (dengan kategori).

---

## 🎯 **Features**

### **1. Toggle Button**
- **Location:** Top-right corner of header
- **Icon:** Tag icon (🏷️)
- **Text:** "Kategori" (hidden on mobile)
- **States:** Active (gradient) / Inactive (white border)

### **2. Persistent Setting**
- **Storage:** localStorage
- **Key:** `showCategory`
- **Default:** `true` (kategori ditampilkan)
- **Persistence:** Setting tersimpan setelah refresh

### **3. Visual Feedback**
- **Active State:** Gradient background (theme-based)
- **Inactive State:** White background with border
- **Transition:** Smooth 300ms
- **Hover:** Scale effect

---

## 🎨 **Visual States**

### **State 1: Category Shown (Default)**

```
┌─────────────────────────────────────────────────────┐
│  Header                          [🏷️ Kategori] ←Active│
└─────────────────────────────────────────────────────┘

Product Card:
┌─────────────────────────────────────────────────────┐
│  [👁️ 42]                          [PROMO] ←badge    │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ [IMG] #1  [Electronics] ←Category            │  │
│  │ 16x16 Product Name                        ➜  │  │
│  │       Product description...                 │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Category badge visible
- Full information displayed
- Button has gradient background

---

### **State 2: Category Hidden**

```
┌─────────────────────────────────────────────────────┐
│  Header                          [🏷️ Kategori] ←Inactive│
└─────────────────────────────────────────────────────┘

Product Card:
┌─────────────────────────────────────────────────────┐
│  [👁️ 42]                          [PROMO] ←badge    │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ [IMG] #1                                     │  │
│  │ 16x16 Product Name                        ➜  │  │
│  │       Product description...                 │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Category badge hidden
- Cleaner, simpler look
- Button has white background with border

---

## 💻 **Technical Implementation**

### **Component Structure:**

```jsx
// Home.jsx
const [showCategory, setShowCategory] = useState(() => {
  const saved = localStorage.getItem('showCategory');
  return saved !== null ? JSON.parse(saved) : true;
});

const toggleShowCategory = () => {
  const newValue = !showCategory;
  setShowCategory(newValue);
  localStorage.setItem('showCategory', JSON.stringify(newValue));
};

// Pass to ProductCard
<ProductCard 
  product={product}
  showCategory={showCategory}
/>
```

```jsx
// ProductCard.jsx
export default function ProductCard({ 
  product, 
  showCategory = true 
}) {
  return (
    <div>
      <span>#{product.id}</span>
      
      {/* Conditional render */}
      {showCategory && product.category && (
        <span>{product.category}</span>
      )}
      
      <span>{product.name}</span>
    </div>
  );
}
```

---

## 🎨 **Button Styling**

### **Active State (Category Shown):**
```css
bg-gradient-to-r ${theme.gradient}
text-white
shadow-md
hover:shadow-lg
transform hover:scale-105
```

### **Inactive State (Category Hidden):**
```css
bg-white
text-gray-700
border border-gray-300
hover:shadow-md
transform hover:scale-105
```

### **Responsive:**
```jsx
<span className="hidden sm:inline">
  Kategori
</span>
```
- Mobile: Icon only
- Desktop: Icon + Text

---

## 📱 **Responsive Design**

### **Desktop (≥640px):**
```
┌─────────────────────────────────────────┐
│  Header              [🏷️ Kategori]      │
└─────────────────────────────────────────┘
```

### **Mobile (<640px):**
```
┌─────────────────────────────────────────┐
│  Header                    [🏷️]         │
└─────────────────────────────────────────┘
```

---

## 🔧 **Usage Examples**

### **Example 1: Default Usage**
```jsx
// No props needed, uses default (true)
<ProductCard product={product} />
```

### **Example 2: Force Hide Category**
```jsx
// Explicitly hide category
<ProductCard product={product} showCategory={false} />
```

### **Example 3: Force Show Category**
```jsx
// Explicitly show category
<ProductCard product={product} showCategory={true} />
```

### **Example 4: Dynamic from State**
```jsx
// Use state from parent
const [show, setShow] = useState(true);
<ProductCard product={product} showCategory={show} />
```

---

## 🎯 **Use Cases**

### **Use Case 1: Clean Minimal Look**
**Scenario:** User wants simple product list
**Action:** Click toggle to hide category
**Result:** Only #ID and product name shown

### **Use Case 2: Full Information**
**Scenario:** User wants to see product categories
**Action:** Click toggle to show category
**Result:** #ID, category badge, and product name shown

### **Use Case 3: Persistent Preference**
**Scenario:** User prefers minimal look always
**Action:** Toggle once, setting saved
**Result:** Preference persists across sessions

---

## 🎨 **Visual Comparison**

### **With Category (Default):**
```
#1  [Electronics]  Product Name
#2  [Fashion]      Product Name
#3  [Home]         Product Name
```

### **Without Category (Clean):**
```
#1  Product Name
#2  Product Name
#3  Product Name
```

---

## 📊 **Benefits**

### **For Users:**
- ✅ Flexibility to choose display style
- ✅ Cleaner look when categories not needed
- ✅ One-click toggle, no configuration
- ✅ Setting persists automatically

### **For Developers:**
- ✅ Simple prop-based implementation
- ✅ No complex state management
- ✅ Reusable component pattern
- ✅ Easy to extend

### **For UX:**
- ✅ Clear visual feedback
- ✅ Smooth transitions
- ✅ Responsive design
- ✅ Accessible (keyboard, screen readers)

---

## 🔍 **Accessibility**

### **Features:**
- ✅ Semantic button element
- ✅ Title attribute for tooltip
- ✅ Clear visual states
- ✅ Keyboard accessible
- ✅ Screen reader friendly

### **ARIA Attributes:**
```jsx
<button
  onClick={toggleShowCategory}
  title={showCategory ? 'Sembunyikan Kategori' : 'Tampilkan Kategori'}
  aria-label={showCategory ? 'Sembunyikan Kategori' : 'Tampilkan Kategori'}
  aria-pressed={showCategory}
>
  {/* Icon & Text */}
</button>
```

---

## 🎯 **Best Practices**

### **Do's:**
- ✅ Use default prop value (`showCategory = true`)
- ✅ Save preference to localStorage
- ✅ Provide visual feedback on toggle
- ✅ Make button accessible
- ✅ Use smooth transitions

### **Don'ts:**
- ❌ Don't force users to configure
- ❌ Don't hide toggle button
- ❌ Don't make toggle hard to find
- ❌ Don't forget mobile responsiveness
- ❌ Don't skip accessibility features

---

## 🚀 **Future Enhancements**

### **Possible Additions:**
1. **More Toggle Options:**
   - Hide/show description
   - Hide/show click counter
   - Hide/show badges

2. **Display Modes:**
   - Compact mode
   - Detailed mode
   - List mode
   - Grid mode

3. **User Preferences:**
   - Save multiple display settings
   - Profile-based preferences
   - Theme-specific settings

---

## 📝 **FAQ**

### **Q: Where is the setting saved?**
A: In browser's localStorage with key `showCategory`

### **Q: What happens if I clear browser data?**
A: Setting resets to default (category shown)

### **Q: Can I set default to hidden?**
A: Yes, change default in useState: `useState(false)`

### **Q: Does it work on mobile?**
A: Yes, fully responsive with icon-only on mobile

### **Q: Can I customize the button style?**
A: Yes, modify the className in Home.jsx

### **Q: Does it affect performance?**
A: No, minimal impact (just conditional render)

---

## ✅ **Summary**

### **What It Does:**
- Toggle category badge visibility in product cards
- Save preference to localStorage
- Provide clean, minimal display option

### **How It Works:**
- Click toggle button in header
- State updates and saves to localStorage
- ProductCard conditionally renders category

### **Why It's Useful:**
- User flexibility
- Cleaner display option
- Persistent preference
- Easy to use

---

**Last Updated:** November 25, 2025  
**Version:** 2.1 (Category Toggle Feature)
