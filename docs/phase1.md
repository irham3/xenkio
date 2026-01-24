# Xenkio Homepage - AI Agent Build Instructions
## Enhanced Light Mode Color Scheme

## 🎯 Project Overview

**Project Name:** Xenkio  
**Phase:** Phase 1 - Homepage/Landing Page Only  
**Scope:** Build complete homepage with dummy tools. NO actual tool functionality.  
**Goal:** Create professional, modern tools platform landing page inspired by iLovePDF but with unique, differentiated design.

---

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router) with latest rules
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** 
  - Aceternity UI (for advanced effects)
  - shadcn/ui (for base components)
- **Icons:** Lucide React
- **Fonts:** Inter (from next/font/google)

### Backend (Dummy/Preparation Only)
- **BaaS:** Supabase (schema setup, dummy data)
- **API:** Next.js API Routes (mock endpoints)
- **Auth:** None for Phase 1

### Deployment Target
- **Frontend:** Cloudflare Pages (prepare static export)
- **Backend:** Cloudflare Workers (prepare for future)

### Development Tools
- **Package Manager:** pnpm (preferred) or npm
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode

---

## 🎨 Design System - Enhanced Light Mode

### Color Palette (Optimized for Light Mode)

#### Primary Colors (Blue - Vibrant & Professional)
```css
--primary-50: #EFF6FF;    /* Very light blue backgrounds */
--primary-100: #DBEAFE;   /* Light blue hover states */
--primary-200: #BFDBFE;   /* Soft blue accents */
--primary-500: #3B82F6;   /* PRIMARY - Vibrant blue for buttons, links */
--primary-600: #2563EB;   /* Hover states, active elements */
--primary-700: #1D4ED8;   /* Pressed states, darker blue */
--primary-900: #1E3A8A;   /* Very dark blue for special emphasis */
```

**Usage:**
- `primary-50`: Hero gradient backgrounds, subtle section backgrounds
- `primary-100`: Card hover states, light accents
- `primary-500`: Primary buttons, links, active states
- `primary-600`: Button hover, active navigation
- `primary-700`: Button pressed state

---

#### Neutral/Gray (Warm & Modern)
```css
--gray-50: #FAFAFA;       /* Main page background - almost white */
--gray-100: #F4F4F5;      /* Card backgrounds, panels */
--gray-200: #E4E4E7;      /* Borders, dividers */
--gray-300: #D4D4D8;      /* Subtle borders */
--gray-400: #A1A1AA;      /* Disabled text, placeholders */
--gray-500: #71717A;      /* Secondary text */
--gray-600: #52525B;      /* Body text - main content */
--gray-700: #3F3F46;      /* Emphasized text */
--gray-800: #27272A;      /* Dark headings */
--gray-900: #18181B;      /* Primary headings, hero text */
--white: #FFFFFF;         /* Cards, modals, dropdowns */
```

**Usage:**
- `gray-50`: Body background, main page bg
- `gray-100`: Card backgrounds, footer light sections
- `gray-600`: Body copy, descriptions
- `gray-900`: Main headings, hero titles

---

#### Accent Colors (Orange - Energetic CTAs)
```css
--accent-50: #FFF7ED;     /* Light orange backgrounds */
--accent-100: #FFEDD5;    /* Soft orange hover */
--accent-500: #F97316;    /* PRIMARY CTA - Vibrant orange */
--accent-600: #EA580C;    /* CTA hover state */
--accent-700: #C2410C;    /* CTA pressed state */
```

**Usage:**
- `accent-500`: "Try Now" buttons, important CTAs
- `accent-600`: CTA hover states
- `accent-50`: Success message backgrounds, highlights

---

#### Success/Status Colors (Optional Enhancement)
```css
--success-50: #F0FDF4;    /* Success backgrounds */
--success-500: #22C55E;   /* Success states, "New" badges */
--success-600: #16A34A;   /* Success hover */

--warning-50: #FFFBEB;    /* Warning backgrounds */
--warning-500: #F59E0B;   /* Warning states */

--error-50: #FEF2F2;      /* Error backgrounds */
--error-500: #EF4444;     /* Error states */
```

---

#### Gradients (Refined for Better Contrast)

```css
/* Primary Hero Gradient - Subtle & Light */
background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%);

/* Primary Button Gradient - Bold & Vibrant */
background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);

/* Accent Button Gradient - Energetic */
background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);

/* Stats Banner Gradient - Rich Blue */
background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%);

/* Category Background Gradients */
/* Data Processing */
background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);

/* Media & Images */
background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);

/* Text Utilities */
background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);

/* Developer Tools */
background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);

/* Security & Privacy */
background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);

/* Documents */
background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
```

---

### Typography (Enhanced Contrast)

```css
/* Headings - Better Contrast */
font-family: 'Inter', sans-serif;

H1: 
  font-size: 48px (3rem)
  font-weight: 800 (extrabold)
  color: #18181B (gray-900)
  line-height: 1.1
  letter-spacing: -0.02em

H2: 
  font-size: 32px (2rem)
  font-weight: 700 (bold)
  color: #18181B (gray-900)
  line-height: 1.2
  letter-spacing: -0.01em

H3: 
  font-size: 24px (1.5rem)
  font-weight: 600 (semibold)
  color: #27272A (gray-800)
  line-height: 1.3

H4:
  font-size: 20px (1.25rem)
  font-weight: 600 (semibold)
  color: #27272A (gray-800)

/* Body Text - Optimized Readability */
Base Body: 
  font-size: 16px (1rem)
  font-weight: 400 (normal)
  color: #52525B (gray-600)
  line-height: 1.7

Small Body:
  font-size: 14px (0.875rem)
  font-weight: 400
  color: #71717A (gray-500)
  line-height: 1.6

/* Links */
Links:
  color: #3B82F6 (primary-500)
  hover: #2563EB (primary-600)
  underline-offset: 2px

/* Button Text */
Button Primary:
  font-size: 16px
  font-weight: 600 (semibold)
  color: #FFFFFF
  letter-spacing: 0.01em

Button Secondary:
  font-size: 16px
  font-weight: 600
  color: #3B82F6 (primary-500)
```

---

## 📐 Layout Structure

### Homepage Layout (Optimized)

```
┌─────────────────────────────────────────────────────────┐
│ NAVBAR (Sticky) - White bg, subtle shadow              │
│ [Logo] [All Tools] [Pricing] [API]  [Search] [Sign In] │
│ Border: gray-200                                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ HERO SECTION - Blue gradient background                │
│ Gradient: primary-50 → primary-100 → primary-200       │
│                                                         │
│         Every Tool You Need. One Platform.              │
│         (gray-900, 48px, bold)                          │
│                                                         │
│         Process files instantly. No signup required.    │
│         (gray-600, 18px)                                │
│                                                         │
│         [Search Bar - White bg with shadow]             │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CATEGORY FILTER TABS (Sticky) - White/95 backdrop blur │
│ [All Tools] [Data] [Media] [Text] [Dev] [Security]     │
│ Active: primary-500 underline + primary-600 text        │
│ Inactive: gray-600 text                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ POPULAR TOOLS - Bento Grid                             │
│ 🔥 Most Popular Tools (gray-900, 32px)                  │
│                                                         │
│ [Large Card - White bg]  [Med Card]  [Med Card]        │
│  Gradient subtle bg      White bg    White bg          │
│  Shadow on hover         Shadow on hover               │
│                                                         │
│ Border: gray-200, Hover: primary-200 border             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CATEGORY SECTIONS - Each with subtle gradient bg       │
│                                                         │
│ Data Processing Tools (23) - primary gradient bg       │
│ [Grid: 5 columns - White cards with hover effects]     │
│                                                         │
│ Media & Images Tools (31) - orange gradient bg         │
│ [Grid: 5 columns - White cards]                        │
│                                                         │
│ ... (each category has themed gradient background)     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ STATS BANNER - Rich blue gradient                      │
│ Background: gradient(gray-900 → primary-900)           │
│ White text with glow effect                            │
│                                                         │
│ 2.5B Files | 10M+ Users | 130+ Tools                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FOOTER - gray-100 background                           │
│ Text: gray-600, Headers: gray-900                      │
│ [5 columns layout]                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Enhanced Component Specifications

### 1. Navbar Component
**Path:** `src/components/layout/navbar.tsx`

**Styling (Enhanced):**
```css
height: 80px
background: white
border-bottom: 1px solid #E4E4E7 (gray-200)
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05)

Logo:
  font-size: 24px
  font-weight: 700
  color: #18181B (gray-900)
  
Nav Links:
  color: #52525B (gray-600)
  hover: #3B82F6 (primary-500)
  font-weight: 500
  
Sign In Button:
  background: linear-gradient(135deg, #3B82F6, #2563EB)
  color: white
  padding: 10px 24px
  border-radius: 8px
  hover: brightness(110%)
```

---

### 2. Hero Section Component
**Path:** `src/components/home/hero-section.tsx`

**Styling (Enhanced):**
```css
height: 420px
background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)
padding: 80px 20px

Heading:
  font-size: 56px (mobile: 36px)
  font-weight: 800
  color: #18181B (gray-900)
  margin-bottom: 16px
  
Subheading:
  font-size: 20px (mobile: 16px)
  color: #52525B (gray-600)
  margin-bottom: 32px
  
Search Bar:
  max-width: 600px
  background: white
  border: 2px solid #E4E4E7 (gray-200)
  border-radius: 12px
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05)
  focus: border-color #3B82F6 (primary-500)
  height: 56px
```

---

### 3. Category Filter Tabs
**Path:** `src/components/home/category-tabs.tsx`

**Styling (Enhanced):**
```css
height: 64px
background: rgba(255, 255, 255, 0.95)
backdrop-filter: blur(8px)
border-bottom: 1px solid #E4E4E7 (gray-200)
sticky top: 80px
z-index: 40

Tab Button:
  padding: 8px 20px
  font-size: 15px
  font-weight: 500
  color: #52525B (gray-600)
  border-radius: 8px
  transition: all 0.2s
  
Tab Button Active:
  color: #2563EB (primary-600)
  background: #EFF6FF (primary-50)
  border-bottom: 2px solid #3B82F6 (primary-500)
  
Tab Button Hover:
  color: #3B82F6 (primary-500)
  background: #F4F4F5 (gray-100)
```

---

### 4. Tool Card Featured (Large)
**Path:** `src/components/tools/tool-card-featured.tsx`

**Styling (Enhanced):**
```css
background: white
border: 1px solid #E4E4E7 (gray-200)
border-radius: 16px
padding: 32px
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
transition: all 0.3s ease

/* Optional gradient overlay for featured */
background-image: linear-gradient(135deg, rgba(239, 246, 255, 0.5), white)

Hover State:
  border-color: #3B82F6 (primary-500)
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15)
  transform: translateY(-4px)

Icon:
  size: 64px
  color: #3B82F6 (primary-500)
  padding: 16px
  background: #EFF6FF (primary-50)
  border-radius: 12px
  
Title:
  font-size: 24px
  font-weight: 700
  color: #18181B (gray-900)
  margin: 16px 0 8px
  
Description:
  font-size: 15px
  color: #52525B (gray-600)
  line-height: 1.6
  
Usage Stats:
  font-size: 14px
  color: #71717A (gray-500)
  margin: 12px 0
  
Try Now Button:
  background: linear-gradient(135deg, #3B82F6, #2563EB)
  color: white
  padding: 10px 20px
  border-radius: 8px
  font-weight: 600
  hover: brightness(110%)
```

---

### 5. Tool Card Compact
**Path:** `src/components/tools/tool-card-compact.tsx`

**Styling (Enhanced):**
```css
width: 100%
min-height: 180px
background: white
border: 1px solid #E4E4E7 (gray-200)
border-radius: 12px
padding: 20px
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05)
transition: all 0.2s ease

Hover State:
  border-color: #BFDBFE (primary-200)
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1)
  transform: translateY(-2px)

Icon:
  size: 48px
  color: #3B82F6 (primary-500)
  padding: 12px
  background: #EFF6FF (primary-50)
  border-radius: 10px
  
Title:
  font-size: 16px
  font-weight: 600
  color: #18181B (gray-900)
  margin: 12px 0 6px
  
Description:
  font-size: 14px
  color: #71717A (gray-500)
  line-height: 1.5
  overflow: hidden
  text-overflow: ellipsis
  display: -webkit-box
  -webkit-line-clamp: 2
  
Usage Count:
  font-size: 13px
  color: #A1A1AA (gray-400)
  margin-top: 8px
```

---

### 6. Stats Banner
**Path:** `src/components/home/stats-banner.tsx`

**Styling (Enhanced):**
```css
height: 240px
background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)
padding: 60px 20px
text-align: center

Stat Container:
  display: flex
  justify-content: center
  gap: 80px (mobile: 40px)
  
Number:
  font-size: 48px (mobile: 36px)
  font-weight: 800
  color: white
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3)
  /* Glowing effect */
  
Label:
  font-size: 16px (mobile: 14px)
  color: rgba(255, 255, 255, 0.9)
  margin-top: 8px
  font-weight: 500
```

---

### 7. Footer
**Path:** `src/components/layout/footer.tsx`

**Styling (Enhanced):**
```css
background: #F4F4F5 (gray-100)
padding: 60px 20px 30px
border-top: 1px solid #E4E4E7 (gray-200)

Column Heading:
  font-size: 16px
  font-weight: 700
  color: #18181B (gray-900)
  margin-bottom: 16px
  
Links:
  font-size: 14px
  color: #52525B (gray-600)
  hover: #3B82F6 (primary-500)
  line-height: 2
  
Copyright:
  text-align: center
  font-size: 14px
  color: #71717A (gray-500)
  margin-top: 40px
  padding-top: 20px
  border-top: 1px solid #E4E4E7 (gray-200)
```

---

## 🎨 Category Background Colors (Updated)

```typescript
export const CATEGORIES: Category[] = [
  {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Extract, transform, and analyze data',
    slug: 'data-processing',
    icon: 'Database',
    toolCount: 23,
    backgroundColor: '#EFF6FF', // primary-50
    gradientFrom: '#EFF6FF',
    gradientTo: '#DBEAFE',
  },
  {
    id: 'media-images',
    name: 'Media & Images',
    description: 'Compress, edit, and enhance images',
    slug: 'media-images',
    icon: 'Image',
    toolCount: 31,
    backgroundColor: '#FFF7ED', // accent-50
    gradientFrom: '#FFF7ED',
    gradientTo: '#FFEDD5',
  },
  {
    id: 'text-utilities',
    name: 'Text Utilities',
    description: 'Convert, format, and analyze text',
    slug: 'text-utilities',
    icon: 'Type',
    toolCount: 18,
    backgroundColor: '#F5F3FF', // purple-50
    gradientFrom: '#F5F3FF',
    gradientTo: '#EDE9FE',
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'Code formatters, testers, and utilities',
    slug: 'developer-tools',
    icon: 'Code2',
    toolCount: 27,
    backgroundColor: '#ECFDF5', // green-50
    gradientFrom: '#ECFDF5',
    gradientTo: '#D1FAE5',
  },
  {
    id: 'security-privacy',
    name: 'Security & Privacy',
    description: 'Encryption, hashing, and password tools',
    slug: 'security-privacy',
    icon: 'Shield',
    toolCount: 15,
    backgroundColor: '#FEF2F2', // red-50
    gradientFrom: '#FEF2F2',
    gradientTo: '#FEE2E2',
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'PDF tools, converters, and processors',
    slug: 'documents',
    icon: 'FileText',
    toolCount: 19,
    backgroundColor: '#FFFBEB', // yellow-50
    gradientFrom: '#FFFBEB',
    gradientTo: '#FEF3C7',
  },
];
```

---

## 🔧 Tailwind Config (Enhanced)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
          600: '#16A34A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'primary': '0 4px 12px rgba(59, 130, 246, 0.15)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 📊 Component Color Usage Matrix

| Component | Background | Text Primary | Text Secondary | Border | Accent |
|-----------|-----------|--------------|----------------|--------|--------|
| **Navbar** | white | gray-900 | gray-600 | gray-200 | primary-500 |
| **Hero** | primary-50→200 gradient | gray-900 | gray-600 | - | primary-500 |
| **Category Tabs** | white/95 | gray-900 | gray-600 | gray-200 | primary-500 |
| **Featured Card** | white | gray-900 | gray-600 | gray-200 | primary-500 |
| **Compact Card** | white | gray-900 | gray-500 | gray-200 | primary-500 |
| **Stats Banner** | primary-900 gradient | white | white/90 | - | white |
| **Footer** | gray-100 | gray-900 | gray-600 | gray-200 | primary-500 |

---

## 🎯 Key Color Improvements for Light Mode

### 1. **Better Contrast Ratios**
- Headings: `gray-900` (#18181B) - AAA compliant
- Body text: `gray-600` (#52525B) - AA compliant
- Secondary text: `gray-500` (#71717A) - AA compliant

### 2. **Softer Backgrounds**
- Page background: `gray-50` (#FAFAFA) - less harsh than pure white
- Card backgrounds: `white` - clean contrast
- Section backgrounds: subtle gradients using 50-100 shades

### 3. **Vibrant Interactive Elements**
- Primary actions: `primary-500` (#3B82F6) - more vibrant than original
- Hover states: `primary-600` (#2563EB) - clear feedback
- Accent CTAs: `accent-500` (#F97316) - energetic orange

### 4. **Refined Borders & Shadows**
- Borders: `gray-200` (#E4E4E7) - subtle but visible
- Shadows: Soft with low opacity - modern look
- Focus states: `primary-500` borders

### 5. **Category-Specific Gradients**
Each category has a themed gradient background for visual differentiation while maintaining consistency.

---

## 📱 Accessibility Enhancements

### Contrast Requirements Met
- **AAA (7:1)**: gray-900 on white, white on primary-900
- **AA (4.5:1)**: gray-600 on white, primary-500 on white
- **Large Text AA (3:1)**: All headings and large elements

### Focus States
```css
focus-visible:
  outline: 2px solid #3B82F6 (primary-500)
  outline-offset: 2px
  border-radius: 4px
```

### Interactive States
- All clickable elements have clear hover states
- Minimum touch target: 44x44px (mobile)
- Keyboard navigation support with visible focus

---

## 🚀 Implementation Priority

### Phase 1A: Core Setup (Day 1)
1. ✅ Project initialization
2. ✅ Tailwind config with new colors
3. ✅ Typography setup
4. ✅ Base component installation

### Phase 1B: Layout (Day 2)
1. ✅ Navbar with new colors
2. ✅ Hero section with gradient
3. ✅ Footer with new scheme
4. ✅ Category tabs

### Phase 1C: Components (Day 3)
1. ✅ Tool cards (both variants)
2. ✅ Popular tools section
3. ✅ Category sections
4. ✅ Stats banner

### Phase 1D: Features (Day 4)
1. ✅ Search functionality
2. ✅ Category filtering
3. ✅ Responsive design
4. ✅ Hover animations

### Phase 1E: Polish (Day 5)
1. ✅ Final color adjustments
2. ✅ Performance optimization
3. ✅ Accessibility audit
4. ✅ Cross-browser testing

---

## 🎨 Visual Design Notes

### Light Mode Philosophy
- **Clean & Airy**: Generous white space, soft shadows
- **High Contrast**: Dark text on light backgrounds for readability
- **Vibrant Accents**: Blue primary, orange CTAs for energy
- **Subtle Gradients**: Light gradients for depth without overwhelming
- **Modern Borders**: Visible but subtle borders (gray-200)

### Color Psychology
- **Blue (Primary)**: Trust, professionalism, technology
- **Orange (Accent)**: Action, creativity, energy
- **Gray (Neutral)**: Balance, sophistication, content focus

---

This enhanced color scheme provides:
✅ Better readability and contrast  
✅ More vibrant and modern appearance  
✅ Improved accessibility (WCAG AAA compliant)  
✅ Clear visual hierarchy  
✅ Professional yet friendly aesthetic  
✅ Perfect for light mode usage