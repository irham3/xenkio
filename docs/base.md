- Harus pakai standard nextjs 16 terbaru
- Tidak boleh ada error atau warning ESLint sama sekali
- harus pakai tipe data, tidak boleh any meskipun implicit
- Harus menggunakan TypeScript dan harus implementasi semua best practice TypeScript
- Harus menggunakan Tailwind CSS dan harus implementasi semua best practice Tailwind CSS
- Harus menggunakan Shadcn UI dan harus implementasi semua best practice Shadcn UI
- Harus menggunakan Nextjs 16 terbaru dan harus implementasi semua best practice Nextjs 16 terbaru
- Implementasi best practice untuk gambar termasuk menggunakan next image, lazy loading, compression, alt text, dll
- Harus SEO Friendly dan implementasi semua best practice SEO untuk nextjs 16 terbaru:
    - setiap halaman harus punya meta tag, title, description, dll, 
    - bisa diakses tanpa login, 
    - bisa diakses oleh search engine, 
    - tidak boleh ada halaman yang tidak bisa diakses oleh search engine, 
    - by default setiap page itu pakai server side rendering dan jika perlu di client buat component client yang dalam server side page
    - Gunakan Server Components sebanyak mungkin untuk performa lebih baik
    - Implementasi Pagination yang SEO-friendly dengan rel="prev" dan rel="next"
    - Optimalkan Time to First Byte (TTFB) dengan edge functions
    - Gunakan ISR (Incremental Static Regeneration) untuk konten dinamis
    - Optimalkan untuk Featured Snippets dengan struktur konten yang baik
    - Gunakan lazy loading untuk iframe dan video
    - Update sitemap dan robots yang dinamis (bukan statis) jika diperlukan

- Implementasi semua best practice untuk web metrics termasuk Lighthouse, Google PageSpeed Insights, dll
- Implementasi semua best practice untuk performa termasuk lazy loading, code splitting, dll
- Implementasi semua best practice untuk keamanan, tidak boleh ada kerentanan dari semua aspek security termasuk OWASP
- Implementasi semua best practice untuk accessibility termasuk WCAG, harus ada alt text, harus ada aria label, dll
- Implementasi semua best practice untuk mobile termasuk responsive design


Project Structure:
```
Refactor seluruh struktur project ini jadi seperti di bawah

xenkio/
├── 📁 .next/                           # Next.js Build Output
├── 📁 .vscode/                         # VSCode Settings (Optional)
│   ├── settings.json                   # Editor config
│   └── extensions.json                 # Recommended extensions
├── 📁 docs/                            # Dokumentasi Proyek
│   ├── base.md                         # ✅ Prinsip dasar & aturan main (system prompt)
│   ├── phase1.md                       # ✅ Dokumentasi fase 1
│   ├── architecture.md                 # Arsitektur sistem
│   └── contributing.md                 # Panduan kontribusi
├── 📁 public/                          # Aset Statis
│   ├── 📁 icons/                       # Icon files
│   │   ├── file.svg                    # ✅
│   │   ├── globe.svg                   # ✅
│   │   ├── next.svg                    # ✅
│   │   ├── vercel.svg                  # ✅
│   │   └── window.svg                  # ✅
│   ├── 📁 images/                      # Static images
│   │   ├── 📁 og/                      # Open Graph images
│   │   │   ├── og-default.png
│   │   │   ├── og-qr.png
│   │   │   └── og-carousel.png
│   │   └── 📁 tools/                   # Tool preview images
│   │       ├── qr-preview.png
│   │       └── carousel-preview.png
│   └── favicon.ico                     # Favicon (di root public)
├── 📁 src/                             # Source Code Utama
│   ├── 📁 app/                         # App Router (Routing & Pages)
│   │   ├── 📁 (marketing)/             # ✅ Route Group: Marketing
│   │   │   ├── page.tsx                # ✅ Homepage Utama (/)
│   │   │   ├── layout.tsx              # Marketing layout
│   │   │   ├── 📁 about/               # About page
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 pricing/             # Pricing page
│   │   │   │   └── page.tsx
│   │   │   └── 📁 blog/                # Blog section
│   │   │       ├── page.tsx            # Blog list
│   │   │       └── [slug]/
│   │   │           └── page.tsx        # Blog detail
│   │   ├── 📁 tools/                   # ✅ Directory Fitur Tools
│   │   │   ├── page.tsx                # ✅ Tools directory listing
│   │   │   ├── layout.tsx              # ✅ Layout khusus tools
│   │   │   ├── 📁 qr-code-generator/   # ✅
│   │   │   │   ├── page.tsx            # ✅ Server Component (SEO)
│   │   │   │   ├── qr-generator-client.tsx # ✅ Client wrapper (KEEP THIS)
│   │   │   │   ├── loading.tsx         # Loading state
│   │   │   │   ├── error.tsx           # Error boundary
│   │   │   │   └── opengraph-image.tsx # Dynamic OG image
│   │   │   └── 📁 instagram-carousel/  # ✅
│   │   │       ├── page.tsx            # ✅ Server Component (SEO)
│   │   │       ├── carousel-client.tsx # Client wrapper (NEW - mirror qr structure)
│   │   │       ├── loading.tsx
│   │   │       ├── error.tsx
│   │   │       └── opengraph-image.tsx
│   │   ├── favicon.ico                 # ✅ Favicon (in app dir)
│   │   ├── globals.css                 # ✅ Global styles
│   │   ├── layout.tsx                  # ✅ Root Layout
│   │   ├── providers.tsx               # ✅ Root Providers
│   │   ├── error.tsx                   # Global error boundary
│   │   ├── not-found.tsx               # 404 page
│   │   ├── robots.ts                   # ✅ SEO: Robots exclusion
│   │   ├── sitemap.ts                  # ✅ SEO: XML Sitemap
│   │   └── manifest.ts                 # PWA manifest generator
│   ├── 📁 features/                    # Feature Modules (Business Logic)
│   │   ├── 📁 qr-generator/            # ✅ QR Generator Feature
│   │   │   ├── 📁 components/          # Feature-specific components
│   │   │   │   ├── qr-generator-form.tsx   # ✅ (MOVED from components/features)
│   │   │   │   ├── qr-preview.tsx          # ✅ (MOVED from components/features)
│   │   │   │   ├── qr-customizer.tsx       # ✅ (MOVED from components/features)
│   │   │   │   ├── qr-logo-uploader.tsx    # ✅ (MOVED from components/features)
│   │   │   │   ├── qr-download-button.tsx  # Download handler
│   │   │   │   └── qr-seo-content.tsx      # SEO content (server)
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
│   │   │   ├── constants.ts            # ✅ Feature constants
│   │   │   ├── types.ts                # ✅ Feature types
│   │   │   └── index.ts                # Public API (barrel export)
│   │   └── 📁 carousel-generator/      # ✅ Carousel Feature
│   │       ├── 📁 components/
│   │       │   ├── carousel-generator.tsx      # ✅ (MOVED)
│   │       │   ├── carousel-generator-form.tsx # ✅ (MOVED)
│   │       │   ├── carousel-preview.tsx        # ✅ (MOVED)
│   │       │   ├── carousel-uploader.tsx       # ✅ (MOVED)
│   │       │   ├── carousel-image-controls.tsx # ✅ (MOVED)
│   │       │   ├── carousel-export-options.tsx # Export settings
│   │       │   └── carousel-seo-content.tsx    # SEO content
│   │       ├── 📁 hooks/
│   │       │   ├── use-carousel-generator.ts
│   │       │   ├── use-image-processor.ts
│   │       │   └── use-canvas-renderer.ts
│   │       ├── 📁 lib/
│   │       │   ├── carousel-utils.ts   # ✅ (MOVED from components)
│   │       │   ├── image-processor.ts
│   │       │   └── canvas-renderer.ts
│   │       ├── 📁 schemas/
│   │       │   └── carousel-schema.ts
│   │       ├── 📁 actions/             # ✨ Server Actions
│   │       │   ├── process-images.ts   # Process uploaded images
│   │       │   ├── generate-carousel.ts # Generate carousel
│   │       │   └── optimize-output.ts  # Optimize final output
│   │       ├── constants.ts
│   │       ├── types.ts                # ✅ (MOVED from components)
│   │       └── index.ts
│   ├── 📁 components/                  # Shared Components
│   │   ├── 📁 ui/                      # ✅ Base UI Components (Shadcn)
│   │   │   ├── button.tsx              # ✅
│   │   │   ├── input.tsx               # ✅
│   │   │   ├── label.tsx               # ✅
│   │   │   ├── tooltip.tsx             # ✅
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx             # Toast container
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── placeholders-and-vanish-input.tsx # ✅
│   │   ├── 📁 layout/                  # ✅ Layout Components
│   │   │   ├── navbar.tsx              # ✅ Main navigation
│   │   │   ├── footer.tsx              # ✅ Footer
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
│   │   ├── 📁 reactbits/               # ✅ Premium Animation Components
│   │   │   ├── count-up.tsx            # ✅ (rename from CountUp.tsx)
│   │   │   ├── shiny-text.tsx          # ✅ (rename from ShinyText.tsx)
│   │   │   ├── spotlight-card.tsx      # ✅ (rename from SpotlightCard.tsx)
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
│   │   └── 📁 db/                      # Database (if needed later)
│   │       ├── index.ts                # DB client (Prisma/Drizzle)
│   │       ├── schema.ts               # DB schema
│   │       └── queries.ts              # DB queries
│   ├── 📁 lib/                         # ✅ Shared Utilities
│   │   ├── utils.ts                    # ✅ General utilities (cn, etc)
│   │   ├── error-handler.ts            # Error handling
│   │   ├── logger.ts                   # Logging utility
│   │   ├── analytics.ts                # Analytics helpers
│   │   └── validators.ts               # Common validators
│   ├── 📁 hooks/                       # ✅ Shared React Hooks
│   │   ├── use-media-query.ts          # Responsive breakpoints
│   │   ├── use-local-storage.ts        # LocalStorage hook
│   │   ├── use-debounce.ts             # Debounce hook
│   │   ├── use-clipboard.ts            # Clipboard operations
│   │   ├── use-toast.ts                # Toast notifications hook
│   │   └── use-server-action.ts        # Server action wrapper hook
│   ├── 📁 config/                      # ✅ Configuration
│   │   ├── site.ts                     # Site metadata & SEO
│   │   ├── env.ts                      # Environment variables
│   │   ├── navigation.ts               # Navigation structure
│   │   └── features.ts                 # Feature flags
│   ├── 📁 data/                        # ✅ Static Data
│   │   ├── categories.ts               # ✅ Tool categories
│   │   ├── tools.ts                    # Tool definitions (rename from dummy-tools.ts)
│   │   ├── testimonials.ts             # User testimonials
│   │   └── faqs.ts                     # FAQ data
│   ├── 📁 types/                       # ✅ Global TypeScript Types
│   │   ├── tool.ts                     # ✅ Tool interface
│   │   ├── action.ts                   # Server action types
│   │   ├── common.ts                   # Common types
│   │   └── index.ts                    # Type exports
│   ├── 📁 styles/                      # ✅ Additional Styles
│   │   ├── themes/                     # Theme definitions
│   │   │   ├── light.css
│   │   │   └── dark.css
│   │   └── animations.css              # Custom animations
│   └── middleware.ts                   # Edge Middleware (root of src)
├── 📁 tests/                           # ✅ Testing
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
├── eslint.config.mjs                   # ✅ ESLint configuration
├── next-env.d.ts                       # ✅ Next.js TypeScript types
├── next.config.ts                      # ✅ Next.js configuration
├── package.json                        # ✅ Dependencies & scripts
├── pnpm-lock.yaml                      # Lock file (or yarn.lock/package-lock.json)
├── postcss.config.mjs                  # ✅ PostCSS config
├── tailwind.config.ts                  # ✅ Tailwind configuration
├── tsconfig.json                       # ✅ TypeScript config
└── README.md                           # ✅ Project documentation

```

