# Xenkio Homepage - AI Agent Build Instructions
## Project Overview
**Project Name:** Xenkio
**Phase:** Phase 1 - Homepage/Landing Page Only
**Scope:** Build complete homepage with dummy tools. NO actual tool functionality.
**Goal:** Create professional, modern tools platform landing page inspired by iLovePDF but with unique, differentiated design.
---
## Tech Stack
### Frontend
- **Framework:** Next.js 16+ (App Router with latest nextjs rules)
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
## Design System
### Color Palette (Light Mode Only)
#### Primary Colors (Sky Blue - Trust & Professional)
```css
--primary-50: #F0F9FF; /* backgrounds, hover states */
--primary-100: #E0F2FE; /* subtle backgrounds */
--primary-500: #0EA5E9; /* PRIMARY - buttons, links */
--primary-600: #0284C7; /* hover states, active */
--primary-700: #0369A1; /* pressed states */
```
#### Secondary Colors (Slate - Clean & Modern)
```css
--secondary-50: #F8FAFC; /* page backgrounds */
--secondary-100: #F1F5F9; /* card backgrounds */
--secondary-500: #64748B; /* secondary text */
--secondary-600: #475569; /* body text */
--secondary-900: #0F172A; /* headings, primary text */
--white: #FFFFFF; /* cards, panels */
```
#### Accent Colors (Orange - Call-to-Action)
```css
--accent-50: #FFF7ED; /* success backgrounds */
--accent-500: #F97316; /* CTA buttons, highlights */
--accent-600: #EA580C; /* hover states */
```
#### Gradients
```css
/* Primary Gradient */
background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
/* Hero Gradient (subtle) */
background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
```
### Typography
```css
/* Headings */
font-family: 'Inter', sans-serif;
H1: 48px, weight: 800, color: #0F172A
H2: 32px, weight: 700, color: #0F172A
H3: 24px, weight: 600, color: #0F172A
/* Body */
Base: 16px, weight: 400, color: #475569, line-height: 1.7
/* Secondary Text */
14px, weight: 400, color: #64748B
```
---
## Layout Structure
### Homepage Layout (Inspired by iLovePDF - NOT plagiarized)
```
┌─────────────────────────────────────────────────────────┐
│ NAVBAR (Sticky) │
│ [Logo] [All Tools] [Pricing] [API] [Search] [Sign In] │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ HERO SECTION (with gradient background) │
│ │
│ Every Tool You Need in
 One Platform. │
│ Process files instantly. No signup required. │
│ │
│ [Search Bar - Full Width - Aceternity Input] │
│ │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ CATEGORY FILTER TABS (Sticky when scroll) │
│ [All Tools] [Data] [Media] [Text] [Dev] [Security] │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ POPULAR TOOLS (Bento Grid - Asymmetric) │
│ Most Popular Tools │
│ │
│ [Large Featured Card] [Medium Card] [Medium Card] │
│ [Medium Card] [Large Featured] [Medium Card] │
│ │
│ Use: Aceternity Wobble Card + Card Hover Effect │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ ALL TOOLS BY CATEGORY │
│ │
│ Data Processing Tools (23) │
│ [Grid: 5 columns - Compact Tool Cards] │
│ │
│ Media & Images Tools (31) │
│ [Grid: 5 columns - Compact Tool Cards] │
│ │
│ ... (repeat for all categories) │
│ │
│ Use: Aceternity Card Hover Effect │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ STATS BANNER (Gradient background) │
│ 2.5B Files | 10M+ Users | 130+ Tools │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ FOOTER │
│ [Links organized in columns] │
└─────────────────────────────────────────────────────────┘
```
### Key Layout Principles
- **Grid-based:** Tool cards in responsive grid (5 cols desktop, 2 cols mobile)
- **Search-first:** Prominent search bar in hero section
- **Category filtering:** Sticky filter tabs
- **Asymmetric featured section:** Bento-style grid for popular tools
- **Hover effects:** All cards have hover states with shadows and scale
- **Gradient accents:** Used in hero and stats sections
---
## Required Components
### 1. Navbar Component
**Path:** `src/components/layout/navbar.tsx`
**Features:**
- Sticky positioning
- Logo (text-based for now: "Xenkio")
- Navigation links: All Tools, Pricing, API
- Search icon (opens search modal)
- Sign In button (gradient background)
- Responsive (hamburger menu on mobile)
**Styling:**
- Height: 80px
- Background: White with shadow-sm
- Border-bottom: 1px solid slate-100
---
### 2. Hero Section Component
**Path:** `src/components/home/hero-section.tsx`
**Features:**
- Gradient background (primary-50 to primary-100)
- Main heading: "Every Tool You Need in One Platform."
- Subheading: "Process files instantly. No signup required."
- **Aceternity Placeholders and Vanish Input** for search
- Height: 240px
**Effects:**
- Text fade-in animation
- Search bar with glow effect
---
### 3. Category Filter Tabs
**Path:** `src/components/home/category-tabs.tsx`
**Features:**
- Sticky when scrolling (top: 80px below navbar)
- Pills/tabs for each category
- Active state with blue underline
- Smooth scroll to category section on click
- Categories: All Tools, Data, Media, Text, Dev, Security, Docs
**Styling:**
- Height: 72px
- Background: white/95 with backdrop-blur
- Active tab: blue underline, bold text
---
### 4. Tool Card Component (Featured - Large)
**Path:** `src/components/tools/tool-card-featured.tsx`
**Features:**
- **Aceternity Wobble Card** base
- Icon (64px, Lucide React)
- Tool name (28px, bold)
- Description (2 lines max)
- Usage stats (e.g., "2.1M uses/month")
- "Try Now →" button
- Gradient background (subtle)
- Border with hover glow effect
**Props:**
```typescript
interface ToolCardFeaturedProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  usageCount: string;
  gradientFrom?: string;
  gradientTo?: string;
}
```
---
### 5. Tool Card Component (Compact)
**Path:** `src/components/tools/tool-card-compact.tsx`
**Features:**
- **Aceternity Card Hover Effect** base
- Icon (40px)
- Tool name (18px)
- Short description (1 line)
- Usage count
- Size: ~220px x 180px
- White background with border
**Props:**
```typescript
interface ToolCardCompactProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  usageCount: string;
}
```
---
### 6. Search Component
**Path:** `src/components/home/search-bar.tsx`
**Features:**
- **Aceternity Placeholders and Vanish Input**
- Autocomplete with dummy suggestions
- Fuzzy search (use fuse.js)
- Shows: Tools (top 5) + Categories
- Full-width in hero (600px max-width)
**Dummy Search Data:**
```typescript
const searchSuggestions = [
  { type: 'tool', name: 'QR Code Generator', category: 'Media' },
  { type: 'tool', name: 'PDF to Word', category: 'Documents' },
  { type: 'tool', name: 'Image Compressor', category: 'Media' },
  { type: 'category', name: 'Data Processing', count: 23 },
  // ... more
];
```
---
### 7. Popular Tools Section
**Path:** `src/components/home/popular-tools.tsx`
**Features:**
- Heading: "Most Popular Tools"
- Bento Grid layout (asymmetric)
- Mix of large and medium featured cards
- Uses ToolCardFeatured component
- Grid: 12 columns, responsive breakpoints
**Layout:**
```
Row 1: [5 cols] [3 cols] [4 cols]
Row 2: [4 cols] [4 cols] [4 cols]
```
---
### 8. Category Section Component
**Path:** `src/components/home/category-section.tsx`
**Features:**
- Category heading (e.g., "Data Processing Tools (23)")
- Grid of compact tool cards (5 cols desktop)
- "View All →" link
- Uses ToolCardCompact component
**Props:**
```typescript
interface CategorySectionProps {
  id: string;
  name: string;
  description: string;
  toolCount: number;
  tools: Tool[];
  backgroundColor?: string;
}
```
---
### 9. Stats Banner
**Path:** `src/components/home/stats-banner.tsx`
**Features:**
- Gradient background (primary gradient reversed)
- White text
- 3 stats in row:
  - "2.5 Billion Files Processed"
  - "10 Million+ Monthly Users"
  - "130+ Tools Available"
- Large numbers (40px), labels (16px)
- Height: 200px
- **Aceternity Glowing Effect** on numbers
---
### 10. Footer Component
**Path:** `src/components/layout/footer.tsx`
**Features:**
- Dark background (slate-900)
- White text
- 5 columns: Xenkio (brand), Product, Tools, Company, Legal
- Social icons: X (Twitter), GitHub
- Copyright text
- Links organized in lists
---
## Dummy Data Structure
### Tool Data Type
**Path:** `src/types/tool.ts`
```typescript
export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: ToolCategory;
  icon: string; // Lucide icon name
  usageCount: string; // e.g., "2.1M"
  isFeatured: boolean;
  isNew: boolean;
  isPremium: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}
export type ToolCategory =
  | 'data-processing'
  | 'media-images'
  | 'text-utilities'
  | 'developer-tools'
  | 'security-privacy'
  | 'documents';
export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  toolCount: number;
  backgroundColor?: string;
}
```
### Dummy Tools Data
**Path:** `src/data/dummy-tools.ts`
Create ~50-60 dummy tools across 6 categories:
```typescript
export const DUMMY_TOOLS: Tool[] = [
  // Featured Tools
  {
    id: '1',
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Create custom QR codes with logos and colors. Supports PNG, SVG, and PDF formats.',
    shortDescription: 'Create custom QR codes',
    category: 'media-images',
    icon: 'QrCode',
    usageCount: '2.1M',
    isFeatured: true,
    isNew: false,
    isPremium: false,
    gradientFrom: '#F0F9FF',
    gradientTo: '#E0F2FE',
  },
  {
    id: '2',
    slug: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce image file size without losing quality. Supports JPG, PNG, WebP.',
    shortDescription: 'Reduce file size',
    category: 'media-images',
    icon: 'ImageDown',
    usageCount: '1.8M',
    isFeatured: true,
    isNew: false,
    isPremium: false,
  },
  {
    id: '3',
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files (.docx) instantly.',
    shortDescription: 'Convert PDF to DOCX',
    category: 'documents',
    icon: 'FileText',
    usageCount: '1.5M',
    isFeatured: true,
    isNew: false,
    isPremium: false,
  },
 
  // Data Processing Tools
  {
    id: '4',
    slug: 'metadata-extractor',
    name: 'Metadata Extractor',
    description: 'Extract metadata from publications, PDFs, and documents.',
    shortDescription: 'Extract file metadata',
    category: 'data-processing',
    icon: 'FileSearch',
    usageCount: '850K',
    isFeatured: false,
    isNew: false,
    isPremium: false,
  },
  {
    id: '5',
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data instantly.',
    shortDescription: 'Format & validate JSON',
    category: 'data-processing',
    icon: 'Braces',
    usageCount: '950K',
    isFeatured: false,
    isNew: false,
    isPremium: false,
  },
 
  // ... Add more dummy tools (total ~50-60)
  // Categories to cover:
  // - Data Processing (23 tools)
  // - Media & Images (31 tools)
  // - Text Utilities (18 tools)
  // - Developer Tools (27 tools)
  // - Security & Privacy (15 tools)
  // - Documents (19 tools)
];
export const CATEGORIES: Category[] = [
  {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Extract, transform, and analyze data',
    slug: 'data-processing',
    icon: 'Database',
    toolCount: 23,
    backgroundColor: '#F0F9FF',
  },
  {
    id: 'media-images',
    name: 'Media & Images',
    description: 'Compress, edit, and enhance images',
    slug: 'media-images',
    icon: 'Image',
    toolCount: 31,
    backgroundColor: '#FFF7ED',
  },
  {
    id: 'text-utilities',
    name: 'Text Utilities',
    description: 'Convert, format, and analyze text',
    slug: 'text-utilities',
    icon: 'Type',
    toolCount: 18,
    backgroundColor: '#F5F3FF',
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'Code formatters, testers, and utilities',
    slug: 'developer-tools',
    icon: 'Code2',
    toolCount: 27,
    backgroundColor: '#ECFDF5',
  },
  {
    id: 'security-privacy',
    name: 'Security & Privacy',
    description: 'Encryption, hashing, and password tools',
    slug: 'security-privacy',
    icon: 'Shield',
    toolCount: 15,
    backgroundColor: '#FEF2F2',
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'PDF tools, converters, and processors',
    slug: 'documents',
    icon: 'FileText',
    toolCount: 19,
    backgroundColor: '#FFFBEB',
  },
];
```
---
## Project Structure
```
xenkio/
├── 📁 .next/                           # Next.js Build Output
├── 📁 .vscode/                         # VSCode Settings
│   ├── settings.json                   # Editor config
│   └── extensions.json                 # Recommended extensions
├── 📁 docs/                            # Dokumentasi Proyek
│   ├── base.md                         # System prompt & prinsip dasar
│   ├── phase1.md                       # Dokumentasi fase 1
│   ├── architecture.md                 # Arsitektur sistem
│   └── contributing.md                 # Panduan kontribusi
├── 📁 public/                          # Aset Statis
│   ├── 📁 icons/                       # Icon files
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── 📁 images/                      # Static images
│   │   ├── 📁 og/                      # Open Graph images
│   │   │   ├── og-default.png
│   │   │   ├── og-qr.png
│   │   │   └── og-carousel.png
│   │   └── 📁 tools/                   # Tool preview images
│   │       ├── qr-preview.png
│   │       └── carousel-preview.png
│   ├── 📁 fonts/                       # Custom fonts (optional)
│   ├── favicon.ico
│   ├── robots.txt                      # Static robots file
│   └── manifest.json                   # PWA manifest
├── 📁 src/                             # Source Code Utama
│   ├── 📁 app/                         # App Router (Routing & Pages)
│   │   ├── 📁 (marketing)/             # Route Group: Marketing
│   │   │   ├── page.tsx                # Homepage (/)
│   │   │   ├── layout.tsx              # Marketing layout
│   │   │   ├── 📁 about/               # About page
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 pricing/             # Pricing page
│   │   │   │   └── page.tsx
│   │   │   └── 📁 blog/                # Blog section
│   │   │       ├── page.tsx            # Blog list
│   │   │       └── [slug]/
│   │   │           └── page.tsx        # Blog detail
│   │   ├── 📁 (tools)/                 # Route Group: Tools
│   │   │   ├── layout.tsx              # Tools layout
│   │   │   └── tools/                  # Tools base path
│   │   │       ├── page.tsx            # Tools directory (/tools)
│   │   │       ├── 📁 qr-code-generator/
│   │   │       │   ├── page.tsx        # Server Component (SEO)
│   │   │       │   ├── loading.tsx     # Loading state
│   │   │       │   ├── error.tsx       # Error boundary
│   │   │       │   └── opengraph-image.tsx # Dynamic OG image
│   │   │       └── 📁 instagram-carousel/
│   │   │           ├── page.tsx        # Server Component (SEO)
│   │   │           ├── loading.tsx
│   │   │           ├── error.tsx
│   │   │           └── opengraph-image.tsx
│   │   ├── layout.tsx                  # Root Layout
│   │   ├── providers.tsx               # Root Providers
│   │   ├── globals.css                 # Global styles
│   │   ├── error.tsx                   # Global error boundary
│   │   ├── not-found.tsx               # 404 page
│   │   ├── robots.ts                   # Dynamic robots.txt
│   │   ├── sitemap.ts                  # Dynamic sitemap.xml
│   │   └── manifest.ts                 # Dynamic manifest.json
│   ├── 📁 features/                    # Feature Modules (Business Logic)
│   │   ├── 📁 qr-generator/            # QR Generator Feature
│   │   │   ├── 📁 components/          # Feature-specific components
│   │   │   │   ├── qr-client.tsx       # 🔵 Main client wrapper
│   │   │   │   ├── qr-generator-form.tsx   # 🔵 Form component
│   │   │   │   ├── qr-preview.tsx      # 🔵 Preview component
│   │   │   │   ├── qr-customizer.tsx   # 🔵 Customization panel
│   │   │   │   ├── qr-logo-uploader.tsx # 🔵 Logo upload
│   │   │   │   ├── qr-download-button.tsx # 🔵 Download handler
│   │   │   │   └── qr-seo-content.tsx  # 🟢 SEO content (server)
│   │   │   ├── 📁 hooks/               # Feature-specific hooks
│   │   │   │   ├── use-qr-generator.ts # QR generation logic
│   │   │   │   ├── use-qr-download.ts  # Download handler
│   │   │   │   └── use-qr-history.ts   # History tracking
│   │   │   ├── 📁 lib/                 # Feature utilities
│   │   │   │   ├── qr-utils.ts         # QR helper functions
│   │   │   │   ├── qr-validator.ts     # Input validation
│   │   │   │   └── qr-encoder.ts       # QR encoding logic
│   │   │   ├── 📁 schemas/             # Validation schemas
│   │   │   │   └── qr-schema.ts        # Zod schema
│   │   │   ├── 📁 actions/             # ✨ Server Actions (Feature-specific)
│   │   │   │   ├── generate-qr.ts      # Generate QR code
│   │   │   │   ├── save-qr-history.ts  # Save to history
│   │   │   │   └── track-qr-usage.ts   # Analytics tracking
│   │   │   ├── constants.ts            # Feature constants
│   │   │   ├── types.ts                # Feature types
│   │   │   └── index.ts                # Public API (barrel export)
│   │   └── 📁 carousel-generator/      # Carousel Feature
│   │       ├── 📁 components/
│   │       │   ├── carousel-client.tsx         # 🔵 Main wrapper
│   │       │   ├── carousel-generator-form.tsx # 🔵 Form
│   │       │   ├── carousel-preview.tsx        # 🔵 Preview
│   │       │   ├── carousel-uploader.tsx       # 🔵 Image uploader
│   │       │   ├── carousel-image-controls.tsx # 🔵 Image controls
│   │       │   ├── carousel-export-options.tsx # 🔵 Export settings
│   │       │   └── carousel-seo-content.tsx    # 🟢 SEO content
│   │       ├── 📁 hooks/
│   │       │   ├── use-carousel-generator.ts
│   │       │   ├── use-image-processor.ts
│   │       │   └── use-canvas-renderer.ts
│   │       ├── 📁 lib/
│   │       │   ├── carousel-utils.ts
│   │       │   ├── image-processor.ts
│   │       │   └── canvas-renderer.ts
│   │       ├── 📁 schemas/
│   │       │   └── carousel-schema.ts
│   │       ├── 📁 actions/             # ✨ Server Actions
│   │       │   ├── process-images.ts   # Process uploaded images
│   │       │   ├── generate-carousel.ts # Generate carousel
│   │       │   └── optimize-output.ts  # Optimize final output
│   │       ├── constants.ts
│   │       ├── types.ts
│   │       └── index.ts
│   ├── 📁 components/                  # Shared Components
│   │   ├── 📁 ui/                      # Base UI Components (Shadcn)
│   │   │   ├── button.tsx              # Button primitive
│   │   │   ├── input.tsx               # Input primitive
│   │   │   ├── label.tsx               # Label primitive
│   │   │   ├── card.tsx                # Card primitive
│   │   │   ├── dialog.tsx              # Modal dialog
│   │   │   ├── dropdown-menu.tsx       # Dropdown menu
│   │   │   ├── tabs.tsx                # Tabs component
│   │   │   ├── toast.tsx               # Toast notifications
│   │   │   ├── tooltip.tsx             # Tooltip primitive
│   │   │   ├── select.tsx              # Select dropdown
│   │   │   ├── slider.tsx              # Range slider
│   │   │   ├── switch.tsx              # Toggle switch
│   │   │   ├── badge.tsx               # Badge component
│   │   │   ├── separator.tsx           # Divider line
│   │   │   ├── skeleton.tsx            # Loading skeleton
│   │   │   └── placeholders-and-vanish-input.tsx # Animated input
│   │   ├── 📁 layout/                  # Layout Components
│   │   │   ├── navbar.tsx              # Main navigation
│   │   │   ├── footer.tsx              # Footer
│   │   │   ├── sidebar.tsx             # Sidebar (if needed)
│   │   │   ├── breadcrumb.tsx          # Breadcrumb navigation
│   │   │   └── container.tsx           # Container wrapper
│   │   ├── 📁 shared/                  # Shared Business Components
│   │   │   ├── tool-card.tsx           # Tool card component
│   │   │   ├── tool-grid.tsx           # Tool grid layout
│   │   │   ├── category-filter.tsx     # Category filtering
│   │   │   ├── search-tools.tsx        # Search functionality
│   │   │   ├── hero-section.tsx        # Reusable hero
│   │   │   ├── feature-section.tsx     # Feature showcase
│   │   │   └── cta-section.tsx         # Call-to-action
│   │   ├── 📁 reactbits/               # Premium Animation Components
│   │   │   ├── count-up.tsx            # Number animation
│   │   │   ├── shiny-text.tsx          # Shiny text effect
│   │   │   ├── spotlight-card.tsx      # Spotlight effect
│   │   │   ├── animated-gradient.tsx   # Gradient animation
│   │   │   ├── particle-background.tsx # Particle effect
│   │   │   └── typewriter.tsx          # Typewriter effect
│   │   └── 📁 icons/                   # Custom icon components
│   │       ├── logo.tsx                # Brand logo
│   │       └── social-icons.tsx        # Social media icons
│   ├── 📁 server/                      # Server-only Code
│   │   ├── 📁 actions/                 # ✨ Global Server Actions
│   │   │   ├── analytics.ts            # Analytics tracking
│   │   │   ├── feedback.ts             # User feedback
│   │   │   └── newsletter.ts           # Newsletter subscription
│   │   ├── 📁 services/                # Business logic services
│   │   │   ├── email-service.ts        # Email sending (Resend, etc)
│   │   │   ├── storage-service.ts      # File storage (if needed)
│   │   │   └── analytics-service.ts    # Analytics processing
│   │   └── 📁 db/                      # Database (if needed)
│   │       ├── index.ts                # DB client (Prisma/Drizzle)
│   │       ├── schema.ts               # DB schema
│   │       └── queries.ts              # DB queries
│   ├── 📁 lib/                         # Shared Utilities
│   │   ├── utils.ts                    # General utilities (cn, etc)
│   │   ├── error-handler.ts            # Error handling
│   │   ├── logger.ts                   # Logging utility
│   │   ├── analytics.ts                # Analytics helpers
│   │   └── validators.ts               # Common validators
│   ├── 📁 hooks/                       # Shared React Hooks
│   │   ├── use-media-query.ts          # Responsive breakpoints
│   │   ├── use-local-storage.ts        # LocalStorage hook
│   │   ├── use-debounce.ts             # Debounce hook
│   │   ├── use-clipboard.ts            # Clipboard operations
│   │   ├── use-toast.ts                # Toast notifications
│   │   └── use-server-action.ts        # Server action wrapper hook
│   ├── 📁 config/                      # Configuration
│   │   ├── site.ts                     # Site metadata & SEO
│   │   ├── env.ts                      # Environment variables
│   │   ├── navigation.ts               # Navigation structure
│   │   └── features.ts                 # Feature flags
│   ├── 📁 data/                        # Static Data
│   │   ├── categories.ts               # Tool categories
│   │   ├── tools.ts                    # Tool definitions
│   │   ├── testimonials.ts             # User testimonials
│   │   └── faqs.ts                     # FAQ data
│   ├── 📁 types/                       # Global TypeScript Types
│   │   ├── tool.ts                     # Tool interface
│   │   ├── action.ts                   # Server action types
│   │   ├── common.ts                   # Common types
│   │   └── index.ts                    # Type exports
│   ├── 📁 styles/                      # Additional Styles
│   │   ├── themes/                     # Theme definitions
│   │   │   ├── light.css
│   │   │   └── dark.css
│   │   └── animations.css              # Custom animations
│   └── 📁 middleware/                  # Edge Middleware Logic
│       └── index.ts                    # Middleware config (rate limit, etc)
├── 📁 tests/                           # Testing
│   ├── 📁 unit/                        # Unit tests
│   │   ├── qr-generator.test.ts
│   │   └── carousel-generator.test.ts
│   ├── 📁 integration/                 # Integration tests
│   │   └── server-actions.test.ts
│   ├── 📁 e2e/                         # E2E tests (Playwright)
│   │   ├── qr-flow.spec.ts
│   │   └── carousel-flow.spec.ts
│   └── setup.ts                        # Test setup
├── 📁 scripts/                         # Build & Utility Scripts
│   ├── generate-sitemap.ts             # Sitemap generator
│   ├── optimize-images.ts              # Image optimization
│   └── seed-data.ts                    # Seed dummy data
├── .env                                # Environment variables (local)
├── .env.example                        # Environment template
├── .env.production                     # Production variables
├── .gitignore                          # Git ignore rules
├── .prettierrc                         # Prettier config
├── .prettierignore                     # Prettier ignore
├── eslint.config.mjs                   # ESLint configuration
├── next-env.d.ts                       # Next.js TypeScript types
├── next.config.ts                      # Next.js configuration
├── package.json                        # Dependencies & scripts
├── pnpm-lock.yaml                      # Lock file (pnpm)
├── postcss.config.mjs                  # PostCSS config
├── tailwind.config.ts                  # Tailwind configuration
├── tsconfig.json                       # TypeScript config
├── vitest.config.ts                    # Vitest config (testing)
└── README.md                           # Project documentation
```
---
## Aceternity UI Components Usage
### 1. Wobble Card (Featured Tools)
**Source:** https://ui.aceternity.com/components/wobble-card
**Usage:** Large featured tool cards in "Popular Tools" section
**Customization:**
- Add tool icon at top
- Tool name as heading
- Description text
- Usage stats at bottom
- "Try Now" button
- Custom gradient background
---
### 2. Card Hover Effect (Compact Tools)
**Source:** https://ui.aceternity.com/components/card-hover-effect
**Usage:** Compact tool cards in category sections
**Customization:**
- Smaller size (220x180px)
- Tool icon
- Tool name
- Short description
- Usage count
---
### 3. Glowing Effect (Stats Numbers)
**Source:** https://ui.aceternity.com/components/glowing-effect
**Usage:** Large numbers in stats banner
**Customization:**
- Apply to "2.5B", "10M+", "130+" text
- White glow on gradient background
- Subtle pulse animation
---
### 4. File Upload (For Future Tool Pages)
**Source:** https://ui.aceternity.com/components/file-upload
**Usage:** NOT used in homepage, but prepare component for future tool pages
**Note:** Just install and make available, will be used later
---
### 5. Placeholders and Vanish Input (Search)
**Source:** https://ui.aceternity.com/components/placeholders-and-vanish-input
**Usage:** Main search bar in hero section
**Customization:**
- Placeholder text: "Search 130+ tools..."
- Autocomplete dropdown on type
- Show suggestions: tools + categories
- Vanish animation when selected
---
## Implementation Steps
### Step 1: Project Setup
```bash
# Create Next.js project
npx create-next-app@latest xenkio --typescript --tailwind --app
# Install dependencies
cd xenkio
pnpm install lucide-react
pnpm install class-variance-authority clsx tailwind-merge
pnpm install framer-motion # for Aceternity components
pnpm install fuse.js # for fuzzy search
# Install shadcn/ui
npx shadcn-ui@latest init
# Add shadcn components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
```
### Step 2: Configure Tailwind
Edit `tailwind.config.ts`:
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
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          500: '#64748B',
          600: '#475569',
          900: '#0F172A',
        },
        accent: {
          50: '#FFF7ED',
          500: '#F97316',
          600: '#EA580C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```
### Step 3: Setup Fonts
Edit `src/app/layout.tsx`:
```typescript
import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-secondary-50">
        {children}
      </body>
    </html>
  )
}
```
### Step 4: Install Aceternity Components
Download and install the 5 Aceternity components:
1. Wobble Card
2. Card Hover Effect
3. Glowing Effect
4. File Upload
5. Placeholders and Vanish Input
Place in `src/components/aceternity/`
### Step 5: Create Dummy Data
Create `src/data/dummy-tools.ts` and `src/data/categories.ts` with the structure provided above.
Populate with ~50-60 tools across 6 categories.
### Step 6: Create Type Definitions
Create `src/types/tool.ts` with Tool and Category interfaces.
### Step 7: Build Components (in order)
1. **UI Base Components**
   - Install shadcn components
   - Create custom button variants if needed
2. **Layout Components**
   - Navbar (with sticky positioning)
   - Footer (dark theme)
3. **Home Page Components**
   - Hero Section (with gradient + search)
   - Category Tabs (sticky filter)
   - Search Bar (Aceternity input)
   - Tool Cards (Featured & Compact)
   - Popular Tools Section (Bento grid)
   - Category Sections (grid layout)
   - Stats Banner (with glowing effect)
4. **Homepage Assembly**
   - Combine all sections in `src/app/page.tsx`
   - Implement scroll behavior
   - Add search functionality
   - Add category filtering
### Step 8: Implement Search & Filter
Create hooks:
- `use-search.ts`: Fuzzy search with fuse.js
- `use-filter.ts`: Category filtering logic
### Step 9: Add Interactions
- Hover effects on all cards
- Search autocomplete
- Category tab switching
- Smooth scroll to sections
- Mobile responsive menu
### Step 10: Polish & Optimize
- Add loading states
- Optimize images (use Next.js Image)
- Add meta tags for SEO
- Test mobile responsiveness
- Add subtle animations (framer-motion)
---
## Responsive Breakpoints
```css
/* Mobile First */
Default: < 640px (mobile)
sm: 640px (large mobile)
md: 768px (tablet)
lg: 1024px (laptop)
xl: 1280px (desktop)
2xl: 1536px (large desktop)
```
### Responsive Grid Behavior
**Popular Tools (Bento Grid):**
- Mobile: 1 column (stack)
- Tablet: 2 columns
- Desktop: Complex bento layout (as designed)
**Category Tools (Grid):**
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 5 columns
**Navbar:**
- Mobile: Hamburger menu
- Desktop: Full horizontal menu
---
## Performance Requirements
### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 1.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
### Optimization Strategies
1. **Images:** Use Next.js Image with priority for hero
2. **Fonts:** Use next/font/google for automatic optimization
3. **Code Splitting:** Dynamic imports for heavy components
4. **CSS:** Minimize unused Tailwind (automatic with purge)
5. **Lazy Loading:** Load below-fold sections on scroll
---
## Testing Checklist
### Functionality
- [ ] Search works and shows suggestions
- [ ] Category tabs filter tools correctly
- [ ] All tool cards are clickable (even if dummy)
- [ ] Navbar sticky behavior works
- [ ] Mobile menu opens/closes
- [ ] Smooth scroll to sections works
### Visual
- [ ] Colors match design system exactly
- [ ] Gradients render correctly
- [ ] Hover effects work on all interactive elements
- [ ] Typography sizes match specification
- [ ] Spacing/padding consistent throughout
- [ ] Icons render at correct sizes
### Responsive
- [ ] Mobile layout works (< 640px)
- [ ] Tablet layout works (768px - 1024px)
- [ ] Desktop layout perfect (> 1024px)
- [ ] No horizontal scroll on any device
- [ ] Touch targets minimum 44x44px on mobile
### Performance
- [ ] Page loads in < 2 seconds
- [ ] No layout shift during load
- [ ] Smooth animations (60fps)
- [ ] Images optimized and lazy loaded
---
## Dummy API Endpoints (For Future)
### GET /api/tools
```typescript
// src/app/api/tools/route.ts
import { NextResponse } from 'next/server';
import { DUMMY_TOOLS } from '@/data/dummy-tools';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
 
  let tools = DUMMY_TOOLS;
 
  if (category && category !== 'all') {
    tools = tools.filter(tool => tool.category === category);
  }
 
  if (search) {
    tools = tools.filter(tool =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())
    );
  }
 
  return NextResponse.json({ tools, count: tools.length });
}
```
### GET /api/categories
```typescript
// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/data/categories';
export async function GET() {
  return NextResponse.json({ categories: CATEGORIES });
}
```
---
## Success Criteria
### Must Have (Phase 1)
- Complete homepage with all sections
- 50+ dummy tools displayed
- Working search with autocomplete
- Category filtering
- All Aceternity components integrated
- Fully responsive (mobile to desktop)
- Matches color palette exactly
- Professional, polished appearance
### Nice to Have (Phase 1)
- Subtle scroll animations (framer-motion)
- Tool card tooltips on hover
- "New" badges on new tools
- View count animations (counting up)