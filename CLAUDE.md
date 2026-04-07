# NETHOST — Project Reference for AI Assistants

## What NETHOST Is

A managed web hosting business for entrepreneurs, startups, and small businesses. Primary product is managed hosting (shared, WordPress, VPS). Secondary services: web design, SEO, digital marketing, branding — listed but visually de-emphasized on the site.

**Tagline:** "Stunning Websites Built For Your Success."
**Contact:** hello@nethost.co | (866) 807-6242 | nethost.co
**Positioning:** Bridges traditional agencies (slow/expensive) and DIY builders (limited). Human-led, managed hosting-first. Does not position as an AI company — AI is used as a tool, not a brand identity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Icons | lucide-react |
| Node | `/opt/homebrew/bin/node` — always use `export PATH="/opt/homebrew/bin:$PATH"` in Bash |
| Package manager | npm |

---

## Hosting Products (What NETHOST Can Deliver)

Backend model: **managed reseller hosting** — NETHOST manages infrastructure on behalf of clients. Clients never interact with the underlying provider.

| Plan | Infrastructure | Price |
|---|---|---|
| Starter | cPanel/WHM reseller account (Liquid Web, A2 Hosting, Hostwinds) | $19/mo |
| Business | Managed WordPress via Cloudways or GridPane on DigitalOcean/Vultr | $49/mo |
| Pro | Managed VPS via RunCloud / Ploi / ServerPilot | $99/mo |

**Automatable add-ons:**
- Domain registration — Namecheap API or Cloudflare Registrar API
- Business email — Zoho Mail or Google Workspace reseller APIs
- SSL — Let's Encrypt (auto-provision + auto-renew)
- CDN — Cloudflare (free tier or resell Pro)
- Backups — JetBackup (cPanel) or Cloudways built-in

**Not currently offered:** Paid ad campaign management, custom app development.

---

## Design System

Both apps (marketing site + portal) share the same visual language.

| Token | Value |
|---|---|
| Page background | `#050914` |
| Alt section background | `#07091a` |
| Footer/deepest background | `#030610` |
| Card background | `bg-white/[0.03]` or `bg-white/[0.04]` |
| Card border | `border-white/[0.07]` or `border-white/[0.08]` |
| Primary accent | `#0ea5e9` (cyan-500) |
| Gradient (CTA/primary) | `from-cyan-500 to-blue-600` |
| Text primary | `text-white` |
| Text secondary | `text-slate-400` |
| Text muted | `text-slate-500` / `text-slate-600` |
| Font | Inter — loaded via Google Fonts in `index.html` |

### Component Patterns

**Primary button:**
```jsx
<a className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition text-sm">
```

**Ghost button:**
```jsx
<a className="bg-white/[0.06] border border-white/10 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition text-sm">
```

**Card:**
```jsx
<div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 card-hover">
```

**Section heading label:**
```jsx
<span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3 block">
```

**Input field (portal):**
```jsx
<input className="input-field" />
/* defined in app/src/index.css as .input-field */
```

### Key CSS Utilities

Defined in `src/index.css` (marketing site) and `app/src/index.css` (portal):
- `.text-gradient` — cyan→blue background-clip text
- `.bg-grid` — subtle dot pattern SVG background (hero section)
- `.card-hover` — hover translateY(-4px) + cyan border glow (marketing site)
- `.card-select` — hover lift + `.selected` class adds cyan border + glow (portal)
- `.input-field` — dark bg input with cyan focus ring (portal)

---

## Assets

Located in `public/` for both apps (identical files copied):
- `nethost-logo.png` — 640×102px white horizontal wordmark (white on transparent, works on dark bg)
- `favicon.png` — 460×416px NETHOST emblem

Both were downloaded from `nethost.co` (wp-content/uploads/2025/10/ and /2025/11/).

---

## Marketing Site (`/Users/gabrielibertis/Sites/NETHOST/`)

### Dev Server
```bash
export PATH="/opt/homebrew/bin:$PATH" && npm run dev -- --port 5174
```

### File Structure

```
src/
├── App.jsx                 # Imports all 10 sections in order
├── index.css               # Tailwind directives + custom utilities
└── components/
    ├── Navbar.jsx           # Sticky glassmorphism, logo img, mobile hamburger
    ├── Hero.jsx             # "Your Website, Hosted & Handled." — 3 stat badges
    ├── TrustedBy.jsx        # Brand name row (placeholder names)
    ├── Services.jsx         # 8-card grid: hosting features (uptime, SSL, backups, email, etc.)
    ├── WhyNethost.jsx       # "Hosting That Works While You Work" — 2-col: copy left, 4 points right
    ├── Process.jsx          # 4-step horizontal timeline: Discovery → Design → Development → Launch
    ├── Pricing.jsx          # 3 hosting tiers ($19/$49/$99), Business card highlighted
    ├── AdditionalServices.jsx  # Muted 4-card row: Design, SEO, Marketing, Branding
    ├── Testimonials.jsx     # 6 testimonial cards, 5-star ratings, avatar initials
    ├── CtaBanner.jsx        # Full-width CTA: "Ready to Build Your Online Presence?"
    └── Footer.jsx           # 4-col: logo+contact, Services, Company, Start a Project
```

### Section Order in App.jsx
Navbar → Hero → TrustedBy → Services → WhyNethost → Process → Pricing → AdditionalServices → Testimonials → CtaBanner → Footer

### Nav Links (Navbar.jsx)
`#features` (Services), `#process`, `#pricing`, `#testimonials`

---

## Portal App (`/Users/gabrielibertis/Sites/NETHOST/app/`)

Separate Vite + React app. Future deployment: `app.nethost.co`.

### Dev Server
```bash
export PATH="/opt/homebrew/bin:$PATH" && cd /Users/gabrielibertis/Sites/NETHOST/app && npm run dev -- --port 5175
```

### Purpose
Full onboarding wizard — guides a new customer from plan selection through domain, site setup, and identity to a simulated live provisioning sequence. ~5 min of user input, ~30 sec animated provisioning.

### File Structure

```
app/src/
├── App.jsx                          # WizardProvider wraps WizardContent; STEPS map 1–8
├── index.css                        # Tailwind + .input-field, .card-select utilities
├── context/
│   └── WizardContext.jsx            # step, plan, domain, siteType, template, identity state
└── components/
    ├── WizardShell.jsx              # Top bar (logo→nethost.co), 6-step progress pills, Back/Continue nav
    └── steps/
        ├── Step1Plan.jsx            # 3 plan cards, Business pre-selected, CheckCircle2 on active
        ├── Step2Domain.jsx          # Register tab (search + TLD dropdown + simulated availability) or Connect tab
        ├── Step3SiteType.jsx        # 2×2 icon grid: Business / Portfolio / Blog / E-commerce
        ├── Step4Template.jsx        # 3×2 gradient thumbnail grid: Minimal/Bold/Corporate/Creative/Modern/Classic
        ├── Step5Identity.jsx        # Name, tagline, logo drag-drop, 6 color presets + custom, live mini-preview
        ├── Step6Review.jsx          # Order summary rows, price breakdown, payment fields (UI only, no processing)
        ├── Step7Provisioning.jsx    # 7-task sequential animation (spinner→checkmark), progress bar, auto-advances to step 8
        └── Step8Done.jsx            # SVG checkmark ring animation, CSS confetti, credentials card + copy buttons
```

### WizardContext State Shape
```js
{
  step: 1,                  // 1–8; steps 7–8 hide the nav footer
  plan: 'Business',         // 'Starter' | 'Business' | 'Pro'
  domain: '',               // full domain string e.g. 'mybiz.com'
  tld: '.com',
  domainOption: 'register', // 'register' | 'connect'
  domainAvailable: null,
  siteType: '',             // 'Business' | 'Portfolio' | 'Blog' | 'E-commerce'
  template: '',             // 'Minimal' | 'Bold' | 'Corporate' | 'Creative' | 'Modern' | 'Classic'
  identity: {
    name: '',
    tagline: '',
    logoUrl: '',            // object URL from FileReader
    color: '#0ea5e9'
  }
}
```

### canAdvance() Logic (WizardContext)
- Step 1: plan selected
- Step 2: domain string non-empty
- Step 3: siteType selected
- Step 4: template selected
- Step 5: identity.name non-empty
- Step 6: always true (payment UI only)
- Steps 7–8: nav hidden entirely

### Provisioning Tasks (Step7Provisioning.jsx)
Simulated with `setTimeout` chains. Each task: spinner while running → CheckCircle2 on complete → next task starts. Auto-advances to Step 8 after 600ms delay post-completion.

```js
{ label: 'Registering domain',             duration: 900  },
{ label: 'Setting up hosting environment', duration: 1300 },
{ label: 'Configuring SSL certificate',    duration: 1000 },
{ label: 'Installing WordPress',           duration: 1600 },
{ label: 'Setting up business email',      duration: 900  },
{ label: 'Configuring CDN',                duration: 800  },
{ label: 'Running final checks',           duration: 1100 },
```
**To wire real APIs:** replace the `setTimeout` in the `run()` function with actual API calls to Namecheap, Cloudways/cPanel WHM, Let's Encrypt, etc.

### Step8Done Credentials Card
Displays hardcoded placeholder credentials (domain URL, /wp-admin, temp password, email). Each row has a copy-to-clipboard button using `navigator.clipboard`. Replace with real provisioned values from backend response.

---

## Do's and Don'ts

### Do
- Always use `export PATH="/opt/homebrew/bin:$PATH"` before any npm/node commands in Bash
- Keep marketing site section backgrounds alternating between `#050914` and `#07091a` for visual rhythm
- Use `rounded-full` for CTA buttons, `rounded-2xl` for cards, `rounded-xl` for inputs
- Use the `.text-gradient` utility for any headline accent spans
- Keep AdditionalServices visually muted relative to hosting sections — lower contrast, smaller cards
- Update this CLAUDE.md whenever new components, routes, or architectural decisions are added

### Don't
- Don't use dynamic Tailwind class construction (`bg-${color}-500`) — Tailwind purges these
- Don't add framer-motion animations — it's installed in the marketing site but not actively used; keep animations CSS-based
- Don't expose hosting provider names (Cloudways, A2, Liquid Web) to end users — NETHOST is the brand
- Don't add real payment processing without proper PCI-compliant backend (Stripe Elements, not raw card fields)
- Don't merge the marketing site and portal app into a single Vite project

---

## Pending / Future Work

- [ ] Wire Namecheap API for real domain registration (Step 2)
- [ ] Wire Cloudways or cPanel WHM API for real hosting provisioning (Step 7)
- [ ] Wire Stripe for real payment processing (Step 6)
- [ ] Add auth (login/signup) before Step 1 in portal
- [ ] Build customer dashboard (post-provisioning) at app.nethost.co
- [ ] Connect "View Hosting Plans" / "Get Started" CTAs on marketing site → `app.nethost.co`
- [ ] Add `.gitignore` to both projects if pushing to version control
