# 🎨 Design System - Quick Reference

## 📝 **Typography**

### **Font Families**
```jsx
font-sans      // Inter - Body text, paragraphs
font-display   // Poppins - Headings, titles, buttons
font-mono      // Space Grotesk - IDs, labels, code
```

### **Font Weights**
```jsx
font-normal    // 400
font-medium    // 500
font-semibold  // 600
font-bold      // 700
font-extrabold // 800
```

### **Font Sizes**
```jsx
text-xs        // 12px - Small labels, badges
text-sm        // 14px - Secondary text
text-base      // 16px - Body text
text-lg        // 18px - Large body
text-xl        // 20px - Small headings
text-2xl       // 24px - Medium headings
text-3xl       // 30px - Large headings
text-4xl       // 36px - Hero headings
```

### **Letter Spacing**
```jsx
tracking-tighter  // -0.05em
tracking-tight    // -0.025em - Headings
tracking-normal   // 0
tracking-wide     // 0.025em - Labels
tracking-wider    // 0.05em
tracking-widest   // 0.1em
```

### **Line Height**
```jsx
leading-extra-tight  // 1.1
leading-tight        // 1.25 - Headings
leading-snug         // 1.375 - Subheadings
leading-normal       // 1.5
leading-relaxed      // 1.625 - Body text
leading-loose        // 2
```

---

## 🎨 **Colors & Themes**

### **Available Themes**
```javascript
'blue'    // Default, professional
'purple'  // Creative, modern
'green'   // Fresh, eco-friendly
'red'     // Bold, urgent
'orange'  // Energetic, warm
'pink'    // Playful, friendly
'indigo'  // Deep, sophisticated
'teal'    // Calm, balanced
```

### **Theme Properties**
```javascript
theme.gradient  // Gradient colors
theme.text      // Text color
theme.border    // Border color
theme.hover     // Hover state
theme.bg        // Background color
```

### **Usage**
```jsx
import { getTheme } from '../utils/themes';

const theme = getTheme('blue');
className={`bg-gradient-to-r ${theme.gradient}`}
```

---

## 🎭 **Animations**

### **Built-in Animations**
```jsx
animate-fade-in      // 0.5s fade in
animate-slide-up     // 0.4s slide from bottom
animate-scale-in     // 0.3s scale from 95%
animate-pulse        // 2s pulse (default)
animate-pulse-slow   // 4s pulse
animate-float        // 6s floating effect
```

### **Transition Utilities**
```jsx
transition-all       // All properties
transition-colors    // Colors only
transition-transform // Transform only

duration-150   // 150ms
duration-200   // 200ms
duration-300   // 300ms (recommended)
duration-500   // 500ms

ease-in        // Slow start
ease-out       // Slow end (recommended)
ease-in-out    // Slow start & end
```

### **Transform Effects**
```jsx
hover:scale-105      // Scale up 5%
hover:scale-[1.02]   // Scale up 2% (subtle)
active:scale-[0.98]  // Scale down 2% (click)

hover:translate-x-1  // Move right 4px
hover:-translate-y-1 // Move up 4px
```

---

## 📦 **Spacing**

### **Padding**
```jsx
p-2    // 8px
p-4    // 16px (cards)
p-5    // 20px (panels)
p-6    // 24px
p-8    // 32px (sections)
p-12   // 48px (main content)
```

### **Margin**
```jsx
m-2    // 8px
m-4    // 16px
m-6    // 24px
m-8    // 32px
m-12   // 48px
m-20   // 80px (large sections)
```

### **Gap (Flexbox/Grid)**
```jsx
gap-1   // 4px
gap-2   // 8px
gap-3   // 12px
gap-4   // 16px (recommended)
gap-6   // 24px
```

### **Space Between**
```jsx
space-y-3  // 12px vertical gap
space-y-4  // 16px vertical gap (cards)
space-y-6  // 24px vertical gap
space-x-2  // 8px horizontal gap
```

---

## 🔲 **Borders & Shadows**

### **Border Radius**
```jsx
rounded-lg     // 8px
rounded-xl     // 12px (buttons, badges)
rounded-2xl    // 16px (cards)
rounded-full   // 9999px (circles)
```

### **Border Width**
```jsx
border         // 1px
border-2       // 2px
border-4       // 4px (header)
```

### **Shadows**
```jsx
shadow-sm      // Subtle
shadow-md      // Medium (navigation)
shadow-lg      // Large (cards default)
shadow-xl      // Extra large
shadow-2xl     // Maximum (cards hover)
```

---

## 🎯 **Components**

### **ProductCard**
```jsx
<ProductCard 
  product={{
    id: 1,
    name: "Product Name",
    description: "Description",
    image_url: "https://...",
    clicks: 42,
    category: "Category",
    badge: "NEW"
  }}
  collectionId={1}
  theme="blue"
/>
```

**Features:**
- Image thumbnail (if available)
- Click counter badge (if clicks > 0)
- Category badge
- Product badge (PROMO, NEW, HOT, etc.)
- Hover effects
- Theme support

### **EmptyState**
```jsx
<EmptyState 
  theme="blue"
  message="No Products"
  description="Add your first product"
/>
```

**Features:**
- Theme-aware colors
- Animated icon
- Custom messages

---

## 🎨 **Glassmorphism**

### **Background Blur**
```jsx
backdrop-blur-sm   // 4px blur (subtle)
backdrop-blur-md   // 12px blur (medium)
backdrop-blur-lg   // 16px blur (strong)
```

### **Opacity**
```jsx
bg-white/80        // 80% opacity
bg-white/90        // 90% opacity
bg-white/10        // 10% opacity (overlay)
bg-white/20        // 20% opacity (subtle)
```

### **Common Patterns**
```jsx
// Card with glassmorphism
className="bg-white/90 backdrop-blur-sm"

// Overlay effect
className="bg-white/10 backdrop-blur-sm"

// Header/Footer
className="bg-white/80 backdrop-blur-md"
```

---

## 🎪 **Badges**

### **Badge Styles**
```javascript
BADGE_STYLES = {
  'PROMO': 'bg-gradient-to-r from-red-500 to-orange-500',
  'DISKON': 'bg-gradient-to-r from-green-500 to-emerald-500',
  'NEW': 'bg-gradient-to-r from-blue-500 to-cyan-500',
  'HOT': 'bg-gradient-to-r from-red-600 to-pink-600',
  'SALE': 'bg-gradient-to-r from-purple-500 to-pink-500',
  'BEST': 'bg-gradient-to-r from-yellow-500 to-orange-500',
  'LIMITED': 'bg-gradient-to-r from-gray-700 to-gray-900'
}
```

### **Usage**
```jsx
<div className={`${BADGE_STYLES[badge]} text-white px-3 py-1 rounded-full text-xs font-bold`}>
  {badge}
</div>
```

---

## 📐 **Layout**

### **Container**
```jsx
max-w-4xl mx-auto px-4  // Content (narrow)
max-w-6xl mx-auto px-4  // Header/Footer (wide)
```

### **Flexbox**
```jsx
flex items-center justify-between  // Horizontal layout
flex flex-col                      // Vertical layout
flex-wrap                          // Wrap items
gap-4                              // 16px gap
```

### **Grid**
```jsx
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
gap-4
```

---

## 🎯 **Best Practices**

### **1. Consistent Spacing**
- Use multiples of 4px (p-4, m-4, gap-4)
- Cards: space-y-4
- Sections: py-12
- Panels: p-5

### **2. Typography Hierarchy**
```jsx
// Page title
className="text-4xl font-display font-bold tracking-tight"

// Section heading
className="text-2xl font-display font-semibold"

// Body text
className="text-base font-sans leading-relaxed"

// Small text
className="text-sm font-sans text-gray-600"
```

### **3. Hover States**
```jsx
// Buttons
hover:scale-105 hover:shadow-lg transition-all duration-300

// Cards
hover:scale-[1.02] hover:shadow-2xl transition-all duration-300

// Links
hover:text-blue-600 transition-colors duration-200
```

### **4. Color Usage**
- Primary actions: Theme gradient
- Secondary actions: White with border
- Disabled: Gray with opacity
- Success: Green
- Error: Red
- Warning: Orange

### **5. Accessibility**
- Minimum touch target: 44x44px
- Color contrast: WCAG AA (4.5:1)
- Focus states: ring-2 ring-blue-500
- Alt text for images
- Semantic HTML

---

## 🚀 **Quick Start**

### **Create a Card**
```jsx
<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 hover:shadow-2xl transition-all duration-300">
  <h3 className="text-xl font-display font-semibold mb-2">Title</h3>
  <p className="text-base font-sans text-gray-600">Content</p>
</div>
```

### **Create a Button**
```jsx
<button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-display font-medium rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300">
  Click Me
</button>
```

### **Create a Badge**
```jsx
<span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full">
  NEW
</span>
```

---

**Last Updated:** November 2025
