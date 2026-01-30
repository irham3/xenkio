# Next.js 16 Development Standards & Best Practices
## Optimized for Cloudflare Pages Deployment

## Core Requirements

### File Naming & Code Standards
- **File naming convention**: Strict kebab-case for all files (e.g., `user-profile.tsx`, `api-client.ts`)
- **Zero tolerance policy**: No ESLint errors or warnings whatsoever
- **Type safety**: Full TypeScript implementation with explicit types - no `any` types (including implicit)
- **Code quality**: Implement all TypeScript, Tailwind CSS, Shadcn UI, and Next.js 16 best practices
- **The Best**: Every tool you build must be THE BEST version of that tool on the internet. Not "good enough" - THE BEST.
- **Zero Error**: No errors & warning in code whatsoever. Always review and fix after finish


## 🏆 Core UX Principles

### 1. **Zero Learning Curve**
```
User should NEVER need to:
- Read instructions
- Watch tutorial
- Ask "how do I...?"
- Click more than 3 times to get result

If user is confused for more than 3 seconds → YOU FAILED
```

### 2. **Instant Gratification**
```
Show results IMMEDIATELY:
- Live preview as user types
- Real-time updates
- No "processing..." spinners unless absolutely necessary
- Instant feedback on every action

Speed is a feature. Fast = Professional.
```

### 3. **Smart Defaults**
```
Every setting should have THE BEST default value:
- User shouldn't need to adjust anything for 80% of use cases
- Advanced options hidden by default
- "It just works" out of the box

Example:
QR Code size: Default 400px (perfect for most uses)
NOT: Default 100px (too small) or ask user to choose
```

### 4. **Progressive Disclosure**
```
Show simple first, complexity only when needed:

Basic View (Default):
[Simple options everyone needs]

Advanced (Collapsed):
[Click to expand - expert options]

NEVER overwhelm with all options at once
```

### 5. **Clear Visual Hierarchy**
```
User's eyes should flow naturally:
1. Main action (biggest, brightest)
2. Primary input (obvious where to start)
3. Secondary options (visible but not distracting)
4. Advanced options (hidden or muted)

Use size, color, spacing to guide attention
```

## 🏆 Core UX Principles

### 1. **Zero Learning Curve**
```
User should NEVER need to:
- Read instructions
- Watch tutorial
- Ask "how do I...?"
- Click more than 3 times to get result

If user is confused for more than 3 seconds → YOU FAILED
```

### 2. **Instant Gratification**
```
Show results IMMEDIATELY:
- Live preview as user types
- Real-time updates
- No "processing..." spinners unless absolutely necessary
- Instant feedback on every action

Speed is a feature. Fast = Professional.
```

### 3. **Smart Defaults**
```
Every setting should have THE BEST default value:
- User shouldn't need to adjust anything for 80% of use cases
- Advanced options hidden by default
- "It just works" out of the box

Example:
QR Code size: Default 400px (perfect for most uses)
NOT: Default 100px (too small) or ask user to choose
```

### 4. **Progressive Disclosure**
```
Show simple first, complexity only when needed:

Basic View (Default):
[Simple options everyone needs]

Advanced (Collapsed):
[Click to expand - expert options]

NEVER overwhelm with all options at once
```

### 5. **Clear Visual Hierarchy**
```
User's eyes should flow naturally:
1. Main action (biggest, brightest)
2. Primary input (obvious where to start)
3. Secondary options (visible but not distracting)
4. Advanced options (hidden or muted)

Use size, color, spacing to guide attention
```

## Framework & Technology Stack

### Next.js 16 Latest Standards
- Use Next.js 16 stable release with all latest fea tures
- Implement App Router architecture
- Leverage Server Components by default for optimal performance
- Use Client Components only when necessary (wrap client-specific code in separate components within server pages)
- Implement proper data fetching patterns (server-side by default)
- **Cloudflare Pages Compatibility**: Ensure all features work with Cloudflare Pages runtime
- Use Edge Runtime for API routes when possible for better Cloudflare performance
- If a server page needs client-side features, create a separate client.tsx (combining client components and client-side logic from features folder) and import it in the server page
- Use proper error handling and loading states
- Always add export const runtime = 'edge'; for server pages

### TypeScript Best Practices
- Enable strict mode in `tsconfig.json`
- Use proper type definitions for all props, state, and functions
- Implement interfaces for complex objects
- Use generics where appropriate
- Leverage TypeScript utility types (Pick, Omit, Partial, etc.)
- No `any` types - use `unknown` or proper types instead
- Enable `noUnusedLocals` and `noUnusedParameters`
- Enable `noImplicitReturns` and `noFallthroughCasesInSwitch`
- Use explicit function return types
- Implement proper error type handling

### Styling Standards
- **Tailwind CSS**: Follow utility-first approach, use configuration for custom values
- **Shadcn UI**: Implement component library correctly with proper theming
- **Light mode only**: No dark mode implementation
- Use CSS variables for theme consistency
- Follow mobile-first responsive design principles
- Create custom design tokens in Tailwind config
- Use semantic color naming conventions
- Implement consistent spacing scale

## Design & UI/UX Requirements

### Professional, Non-AI Aesthetic

#### Avoid Generic AI/Template Patterns
- ❌ No gradient backgrounds everywhere
- ❌ No excessive rounded corners (rounded-3xl, rounded-full on everything)
- ❌ No over-use of blur effects and glassmorphism
- ❌ No generic "hero section with centered text and CTA button"
- ❌ No identical card layouts with icon-title-description pattern
- ❌ No purple/blue gradient combinations (overused in AI designs)
- ❌ No excessive animations and transitions
- ❌ No generic stock photos or AI-generated imagery
- ❌ No cookie-cutter layouts from UI kits
- ❌ No overuse of drop shadows and elevation
- ❌ No default Shadcn UI components without customization

#### Professional Design Characteristics
- ✅ Use sophisticated, purposeful color palettes (not rainbow gradients)
- ✅ Implement asymmetric, interesting layouts (not everything centered)
- ✅ Use subtle, intentional whitespace (not just padding everywhere)
- ✅ Create visual hierarchy through typography scale and weight
- ✅ Implement grid systems that break conventional patterns
- ✅ Use real photography and custom illustrations (not stock AI images)
- ✅ Apply authentic brand personality through design decisions
- ✅ Design with purpose and intention behind every element
- ✅ Create memorable, distinctive visual identity
- ✅ Use design principles from established design systems (not AI patterns)

#### Layout Best Practices
- Create unique, memorable layouts for each page type
- Use creative grid systems (not just 3-column cards)
- Implement interesting content flow and reading patterns
- Break the grid intentionally for visual interest
- Use overlapping elements and layering purposefully
- Implement scroll-triggered reveals sparingly and meaningfully
- Design custom components, not Shadcn defaults
- Consider F-pattern and Z-pattern reading behaviors
- Create focal points through visual weight
- Use directional cues to guide user attention
- Implement proper content chunking
- Balance positive and negative space effectively
- Create rhythm through repetition with variation
- Use containers and boundaries purposefully

#### Typography Excellence
- Use professional font pairings (not default system fonts)
- Implement proper typographic hierarchy (6+ levels)
- Use varied font weights meaningfully (not just bold/normal)
- Implement proper line-height and letter-spacing
- Create visual rhythm through type scale
- Use actual design principles (golden ratio, modular scale)
- Ensure optimal line length (45-75 characters for body text)
- Implement proper font loading strategies with `next/font`
- Use variable fonts for performance when appropriate
- Create clear distinction between heading and body styles
- Implement proper vertical rhythm
- Use font features (ligatures, kerning) appropriately
- Consider readability across all screen sizes
- Optimize font loading for Cloudflare's edge network

#### Color Theory Application
- Use sophisticated color palettes (60-30-10 rule)
- Implement purposeful accent colors
- Create depth through tints and shades
- Use color psychology appropriately for brand
- Avoid vibrant, saturated colors everywhere
- Implement subtle color transitions (not obvious gradients)
- Maintain proper contrast ratios for accessibility
- Use color to create visual hierarchy
- Implement color with cultural considerations
- Create cohesive color stories across pages
- Use neutral colors as foundation
- Accent colors should be used sparingly for impact
- Consider color blindness in design decisions
- Always use colors from global.css file

#### Professional Polish
- Micro-interactions that feel natural and purposeful
- Consistent spacing system based on design tokens
- Professional iconography (not generic icon sets)
- Custom illustrations or high-quality photography
- Attention to detail in every component state (hover, active, focus, disabled)
- Real content hierarchy (not everything the same importance)
- Smooth transitions that enhance UX (not distract)
- Loading states that maintain layout stability
- Error states that are helpful and clear
- Empty states that guide users
- Consistent interaction patterns throughout
- Proper feedback for all user actions
- Professional copywriting and microcopy
- Consistent voice and tone

## Image Optimization

### Next.js Image Component Requirements
- Always use `next/image` instead of HTML `<img>` tags
- Implement lazy loading for all images below the fold
- Use proper image compression and optimization
- Specify width and height to prevent layout shift
- Provide descriptive alt text for all images (accessibility requirement)
- Use appropriate image formats (WebP with fallbacks)
- Implement responsive images with srcSet
- Use blur placeholders for better UX
- Optimize images before uploading (compress, resize)
- **Cloudflare Images**: Consider using Cloudflare Images for automatic optimization and CDN delivery
- Use Cloudflare's image resizing service for dynamic transformations
- Implement proper caching headers for images
- Use priority loading for above-the-fold images
- Consider art direction for responsive images
- Use appropriate quality settings per use case

### Image Strategy
- Hero images: high quality, optimized for LCP
- Thumbnails: smaller sizes, aggressive compression
- Icons: use SVG when possible
- Background images: optimize heavily, consider CSS patterns
- User-generated content: implement upload size limits (consider Supabase Storage for future)
- Product images: multiple sizes for zoom functionality
- Store images in Cloudflare R2 or use Cloudflare Images for scalability

## SEO Implementation

### Meta Tags & Structure Requirements
- Every page must have unique meta tags (title, description, Open Graph, Twitter Cards)
- Implement proper semantic HTML structure (h1, h2, header, nav, main, footer)
- Use structured data (JSON-LD) for rich snippets
- Implement canonical URLs to prevent duplicate content
- Use descriptive, keyword-rich titles (50-60 characters)
- Write compelling meta descriptions (150-160 characters)
- Use keywords in metadata description and tags that are currently trending on google trend
- Implement Open Graph tags for social sharing
- Use Twitter Card tags for Twitter sharing
- Add author and publisher metadata
- Implement hreflang for multi-language sites
- Use proper heading hierarchy (single h1, then h2, h3, etc.)
- Always add route to sitemap.ts when adding new page

### Search Engine Accessibility
- All pages must be accessible without authentication (public routes)
- Full search engine crawlability - no blocked pages
- Server-Side Rendering (SSR) by default for all pages
- Client components only for interactive elements within server pages
- Implement proper robots meta tags
- Ensure all important content is in HTML (not JavaScript-only)
- Avoid infinite scroll for primary content
- Implement proper URL structure (descriptive, hierarchical)
- Use breadcrumbs for navigation and SEO
- Avoid duplicate content issues
- Implement 301 redirects for moved content (use Cloudflare Pages redirects)
- Use 404 pages that help users navigate

### Advanced SEO Techniques
- **Server Components**: Maximize usage for better performance and SEO
- **SEO-friendly pagination**: Implement with `rel="prev"` and `rel="next"` links
- **TTFB optimization**: Leverage Cloudflare's global edge network for ultra-fast TTFB
- **ISR (Incremental Static Regeneration)**: For dynamic content that doesn't change frequently
- **Featured Snippets optimization**: Structure content with proper headings, lists, and tables
- **Lazy loading**: Implement for iframes and videos to improve page load
- **Dynamic sitemap**: Generate sitemap.xml programmatically (not static)
- **Dynamic robots.txt**: Generate robots.txt based on environment and routes
- **Internal linking**: Create logical site architecture with internal links
- **Schema markup**: Implement relevant schema types (Article, Product, FAQ, etc.)
- **Core Web Vitals**: Optimize for LCP, FID/INP, CLS (Cloudflare's edge network helps with this)
- **Mobile-first indexing**: Ensure mobile version is complete
- **Local SEO**: Implement local business schema if applicable
- **Video SEO**: Use video sitemaps and schema for video content

### Content Strategy for SEO
- Create valuable, original content
- Use target keywords naturally
- Implement topic clusters and pillar pages
- Update content regularly
- Use multimedia (images, videos) to enhance content
- Implement proper content hierarchy
- Write for humans first, search engines second
- Use descriptive anchor text for links
- Avoid keyword stuffing
- Create comprehensive, in-depth content

## Performance Optimization

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5 seconds (Cloudflare edge helps achieve this)
- **First Input Delay (FID)**: < 100 milliseconds
- **Interaction to Next Paint (INP)**: < 200 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Time to First Byte (TTFB)**: < 600 milliseconds (Cloudflare edge typically achieves < 100ms)
- **Lighthouse score**: 90+ in all categories (Performance, Accessibility, Best Practices, SEO)
- **Google PageSpeed Insights**: Green scores for mobile and desktop

### Cloudflare-Specific Performance Optimizations
- Use Cloudflare's edge caching for static assets
- Leverage Cloudflare Workers for edge computing
- Use Cloudflare's automatic minification for HTML, CSS, JS
- Enable Cloudflare's Auto Minify feature
- Use Cloudflare's Rocket Loader for JavaScript optimization
- Enable Brotli compression via Cloudflare
- Use Cloudflare's Polish for automatic image optimization
- Leverage Cloudflare's Argo Smart Routing for faster dynamic content
- Use Cloudflare's Early Hints for resource preloading
- Implement Cloudflare's Waiting Room for high traffic events

### Performance Strategies
- Implement code splitting and dynamic imports
- Use lazy loading for below-the-fold content
- Minimize JavaScript bundle size
- Implement proper caching strategies (leverage Cloudflare's edge cache)
- Use CDN for static assets (Cloudflare automatically provides this)
- Optimize font loading with `next/font`
- Use React Suspense for loading states
- Implement request deduplication
- Use parallel data fetching where possible
- Minimize third-party scripts
- Defer non-critical JavaScript
- Use resource hints (preload, prefetch, preconnect)
- Implement efficient state management
- Avoid unnecessary re-renders
- Use memoization appropriately
- Implement virtual scrolling for long lists
- Optimize animations (use transform and opacity)
- Minimize main thread work
- Use Web Workers for heavy computations
- Implement efficient data structures
- Avoid memory leaks

### Bundle Optimization
- Analyze bundle with Next.js Bundle Analyzer
- Remove unused dependencies
- Use tree-shaking effectively
- Implement dynamic imports for large libraries
- Split vendor bundles appropriately
- Use smaller alternative libraries when possible
- Avoid importing entire libraries (import only what's needed)
- Use ES modules for better tree-shaking
- Minimize polyfills (target modern browsers)
- Keep total bundle size under Cloudflare Pages limits

### Caching Strategy with Cloudflare
- Implement proper Cache-Control headers for Cloudflare edge
- Use stale-while-revalidate where appropriate
- Leverage Cloudflare's edge caching for API responses
- Implement browser caching for static assets
- Use incremental static regeneration with Cloudflare KV
- Implement API response caching using Cloudflare Workers KV
- Configure cache TTL based on content update frequency
- Use cache tags for granular cache invalidation
- Implement cache warming strategies for critical pages

## Security Best Practices

### OWASP Top 10 Protection
1. **Injection attacks** (SQL, NoSQL, Command)
   - Use parameterized queries (important for future Supabase integration)
   - Validate and sanitize all inputs
   - Use ORMs with built-in protection
   - Implement input validation on both client and server

2. **Broken authentication**
   - Implement strong password policies (prepare for Supabase Auth)
   - Use multi-factor authentication when Supabase is integrated
   - Secure session management
   - Implement account lockout mechanisms
   - Use secure password hashing (bcrypt, Argon2)

3. **Sensitive data exposure**
   - Encrypt data at rest and in transit
   - Use HTTPS everywhere (Cloudflare provides free SSL)
   - Implement proper key management with Cloudflare environment variables
   - Avoid storing sensitive data unnecessarily
   - Use environment variables for secrets

4. **XML External Entities (XXE)**
   - Disable XML external entity processing
   - Use JSON instead of XML when possible
   - Validate and sanitize XML input

5. **Broken access control**
   - Implement proper authorization checks
   - Use role-based access control (RBAC) - prepare for Supabase RLS
   - Verify permissions on server-side
   - Implement principle of least privilege

6. **Security misconfigurations**
   - Keep all software updated
   - Remove default accounts and passwords
   - Disable unnecessary features
   - Implement security headers via Cloudflare
   - Use security scanning tools

7. **Cross-Site Scripting (XSS)**
   - Sanitize user input
   - Use Content Security Policy (configure in Cloudflare)
   - Escape output properly
   - Use frameworks with XSS protection
   - Validate input on server-side

8. **Insecure deserialization**
   - Validate serialized data
   - Implement integrity checks
   - Avoid accepting serialized objects from untrusted sources

9. **Using components with known vulnerabilities**
   - Keep dependencies updated
   - Use automated vulnerability scanning
   - Monitor security advisories
   - Implement dependency update policy

10. **Insufficient logging and monitoring**
    - Log security-relevant events
    - Use Cloudflare Analytics for monitoring
    - Set up alerts for suspicious activity with Cloudflare
    - Maintain audit trails (prepare for Supabase logging)
    - Protect log data

### Cloudflare Security Features
- Enable Cloudflare WAF (Web Application Firewall)
- Use Cloudflare Bot Management to prevent bot attacks
- Enable Cloudflare DDoS protection (automatic)
- Use Cloudflare Access for team authentication
- Implement Rate Limiting via Cloudflare Workers
- Use Cloudflare's Security Level settings appropriately
- Enable DNSSEC for domain security
- Use Cloudflare's Challenge Pages for suspicious traffic
- Implement IP-based access rules when needed
- Use Cloudflare's Page Rules for security redirects

### Additional Security Measures
- Implement Content Security Policy (CSP) headers via Cloudflare
- Use HTTPS everywhere with HSTS (enabled by default in Cloudflare)
- Sanitize all user inputs
- Implement rate limiting on API routes using Cloudflare Workers
- Use environment variables for secrets (Cloudflare Pages environment variables)
- Implement CSRF protection
- Use secure headers (X-Frame-Options, X-Content-Type-Options, etc.) via Cloudflare
- Implement proper authentication and authorization (prepare for Supabase Auth)
- Regular dependency updates and security audits
- Use security linters and scanners
- Implement API authentication (prepare for Supabase JWT)
- Use secure cookies (httpOnly, secure, sameSite)
- Implement input validation schemas
- Use prepared statements for database queries (when using Supabase)
- Implement file upload security (for future Supabase Storage)
- Validate file types and sizes
- Scan uploaded files for malware
- Implement DDoS protection (Cloudflare provides this)
- Implement secure password reset flows
- Use secure random number generation
- Implement security testing in CI/CD

## Accessibility (a11y)

### WCAG 2.1 Level AA Compliance
- Meet all WCAG 2.1 Level AA standards minimum
- Provide alt text for all images and media
- Implement ARIA labels for interactive elements
- Ensure keyboard navigation works throughout
- Maintain proper color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Use semantic HTML elements
- Implement skip links for navigation
- Ensure form inputs have associated labels
- Provide clear focus indicators
- Support screen readers properly
- Implement proper heading hierarchy
- Ensure text can be resized up to 200%
- Avoid using color alone to convey information
- Provide alternatives for time-based media
- Ensure content is understandable and predictable

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Implement logical tab order
- Provide visible focus indicators
- Support standard keyboard shortcuts
- Ensure modal dialogs trap focus appropriately
- Allow users to dismiss modals with Escape key
- Implement keyboard shortcuts documentation

### Screen Reader Support
- Use semantic HTML elements
- Implement ARIA landmarks
- Provide ARIA labels for icon buttons
- Use ARIA live regions for dynamic content
- Announce important changes to users
- Provide alternative text for images
- Ensure form validation errors are announced
- Use proper table markup for data tables

### Form Accessibility
- Associate labels with form inputs
- Provide clear error messages
- Indicate required fields clearly
- Group related form elements
- Provide instructions before form fields
- Ensure error messages are descriptive
- Implement inline validation when appropriate
- Support autofill for common fields

### Additional Accessibility Features
- Provide transcripts for audio content
- Provide captions for video content
- Implement adjustable font sizes
- Avoid automatic content changes
- Provide warnings before time limits
- Allow users to extend time limits
- Avoid flashing content (seizure risk)
- Implement consistent navigation across site
- Provide multiple ways to find content
- Use clear and simple language
- Test with actual assistive technologies
- Conduct regular accessibility audits

## Mobile & Responsive Design

### Mobile-First Approach
- Design for mobile first, then scale up
- Test on multiple devices and screen sizes
- Implement touch-friendly interactive elements (min 44x44px)
- Optimize for various network conditions (Cloudflare helps with this)
- Use responsive images and media queries
- Implement mobile-specific optimizations
- Test with Chrome DevTools mobile emulation
- Ensure text is readable without zooming (min 16px font size)
- Prevent horizontal scrolling
- Optimize tap target sizes and spacing
- Implement mobile-friendly navigation
- Use mobile-optimized forms

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large desktop: 1440px+
- Use custom breakpoints as needed for design
- Test all breakpoints thoroughly
- Ensure content reflows properly
- Avoid horizontal scrolling at any breakpoint

### Touch Interactions
- Implement swipe gestures where appropriate
- Provide visual feedback for touch
- Ensure tap targets are large enough
- Avoid hover-only interactions
- Implement pull-to-refresh where appropriate
- Support pinch-to-zoom for images
- Avoid conflicts with browser gestures

### Mobile Performance
- Optimize images for mobile networks
- Reduce JavaScript execution time
- Minimize network requests
- Implement progressive enhancement
- Use adaptive loading based on network speed (leverage Cloudflare's speed data)
- Implement offline functionality where appropriate
- Reduce main thread work
- Optimize for slower devices

### Next.js Configuration for Cloudflare

#### next.config.js Setup
- Configure for static export and edge runtime compatibility
- Disable features not supported by Cloudflare Pages
- Set up image optimization compatible with Cloudflare
- Configure redirects and rewrites if needed
- Set proper base path if deploying to subdirectory
- Configure experimental features for edge runtime
- Set up proper environment variable handling

#### Edge Runtime Optimization
- Use Edge Runtime for API routes when possible
- Mark API routes with `export const runtime = 'edge'`
- Avoid Node.js-specific APIs in edge routes
- Use Web APIs instead of Node.js APIs
- Implement proper error handling for edge functions
- Keep edge function size under limits

### Environment Variables Management

#### Environment Variables Setup
- Configure all environment variables in Cloudflare Pages dashboard
- Use different variables for Production and Preview environments
- Never commit secrets to repository
- Use encrypted variables for sensitive data
- Create `.env.example` file documenting all required variables
- Set `NODE_VERSION` if specific version is required
- Configure `CF_PAGES=1` for Cloudflare-specific logic
- Prepare environment variables structure for future Supabase integration:
  - `NEXT_PUBLIC_SUPABASE_URL` (for future use)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for future use)
  - `SUPABASE_SERVICE_ROLE_KEY` (for future use)

#### Environment Variable Best Practices
- Prefix client-side variables with `NEXT_PUBLIC_`
- Keep server-side variables private
- Document each variable's purpose
- Use consistent naming conventions
- Implement fallbacks for optional variables
- Validate environment variables at build time
- Use type-safe environment variable access

## Performance Budget

### Bundle Size Targets for Cloudflare
- Initial JavaScript bundle: < 100KB (gzipped)
- Initial CSS bundle: < 50KB (gzipped)
- Total initial load: < 200KB (gzipped)
- Individual route chunks: < 50KB (gzipped)
- Edge function size: < 1MB (compressed)
- Third-party scripts: minimize and defer

### Runtime Performance with Cloudflare Edge
- Time to Interactive: < 3.5 seconds
- Total Blocking Time: < 300 milliseconds
- First Contentful Paint: < 1.8 seconds
- Speed Index: < 3.4 seconds
- Time to First Byte: < 100ms (with Cloudflare edge)

### Resource Limits
- Maximum image size: 500KB (before optimization)
- Maximum video size: 5MB
- Maximum font file size: 100KB
- API response time: < 200ms (p95)
- Edge function execution time: < 50ms


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
│   │   │   │   ├── client.tsx # ✅ Client wrapper (KEEP THIS)
│   │   │   │   ├── loading.tsx         # Loading state
│   │   │   │   ├── error.tsx           # Error boundary
│   │   │   │   └── opengraph-image.tsx # Dynamic OG image
│   │   │   └── 📁 instagram-carousel/  # ✅
│   │   │       ├── page.tsx            # ✅ Server Component (SEO)
│   │   │       ├── client.tsx # Client wrapper (NEW - mirror qr structure)
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
│   │   └── 📁 base64-encoder/          # ✅ Base64 Encoder Feature
│   │       ├── 📁 components/
│   │       │   └── base64-encoder.tsx  # Main encoder/decoder component
│   │       ├── 📁 hooks/
│   │       │   └── use-base64.ts       # Base64 state management
│   │       ├── 📁 lib/
│   │       │   └── base64-utils.ts     # Encode/decode utilities
│   │       ├── constants.ts            # Mode definitions
│   │       └── types.ts                # Base64Mode, options, result types
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

