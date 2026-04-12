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

## Hosting Infrastructure (Actual Implementation)

| Plan | Infrastructure | Price |
|---|---|---|
| Starter | CyberPanel on dedicated VPS at `api.nethost.co` (IP: `76.13.118.227`) | $19/mo |
| Business | Managed WordPress via Cloudways | $49/mo |
| Pro | Managed WordPress via Cloudways (higher tier) | $99/mo |

**Domain registration:** Namecheap API via PHP proxy at `api.nethost.co`
**DNS management:** Namecheap setHosts API (sets A records pointing to server IP on provisioning)
**Transactional email:** Resend API (order confirmations via `send-order-confirmation` Edge Function)
**Payment:** Stripe (subscriptions via `create-subscription` Edge Function + Stripe Elements)
**SSL:** CyberPanel handles Let's Encrypt SSL for Starter; Cloudways handles SSL for Business/Pro
**Backups:** CyberPanel built-in for Starter; Cloudways built-in for Business/Pro

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
    ├── Hero.jsx             # "Your Website, Hosted & Handled." — 4 stat badges (Uptime, Monitoring, Support, 30-Day Guarantee)
    ├── DomainSearch.jsx     # Domain availability widget — checks Namecheap via domain-check Edge Function; funnels to wizard via ?domain=&tld= URL params
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
Navbar → Hero → DomainSearch → TrustedBy → Services → WhyNethost → Process → Pricing → AdditionalServices → Testimonials → CtaBanner → Footer

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
Full onboarding wizard — guides a new customer from plan selection through domain, site setup, and identity to live provisioning. Steps 1–6 are user input; Step 7 calls real APIs; Step 8 displays real credentials.

### File Structure

```
app/src/
├── App.jsx                          # WizardProvider wraps WizardContent; STEPS map 1–8; reads ?domain=&tld= URL params and passes as initialData to WizardProvider
├── index.css                        # Tailwind + .input-field, .card-select utilities
├── context/
│   └── WizardContext.jsx            # step, plan, domain, siteType, template, identity state; accepts initialData prop (merged over DEFAULTS at mount)
└── components/
    ├── WizardShell.jsx              # Top bar (logo→nethost.co), 6-step progress pills, Back/Continue nav
    └── steps/
        ├── Step1Plan.jsx            # 3 plan cards (Starter $19 / Business $49 / Pro $99), Business pre-selected
        ├── Step2Domain.jsx          # Register tab (Namecheap availability check) or Connect tab
        ├── Step3SiteType.jsx        # 2×2 icon grid: Business / Portfolio / Blog / E-commerce
        ├── Step4Template.jsx        # 3×2 gradient thumbnail grid: Minimal/Bold/Corporate/Creative/Modern/Classic
        ├── Step5Identity.jsx        # Name, tagline, logo drag-drop, 6 color presets + custom, live mini-preview
        ├── Step6Review.jsx          # Order summary, price breakdown, real Stripe payment (Elements + create-subscription Edge Function)
        ├── Step7Provisioning.jsx    # Calls domain-register + provision-hosting Edge Functions; writes to orders table; sends confirmation email; shows animated task list
        └── Step8Done.jsx            # Animated checkmark, confetti, real credentials card from provisionedCredentials state
```

### Supabase Edge Functions

| Function | Purpose |
|---|---|
| `create-subscription` | Creates Stripe customer + subscription, returns clientSecret for client-side confirmation |
| `domain-check` | Checks Namecheap availability + price via PHP proxy at api.nethost.co |
| `domain-register` | Registers domain via Namecheap PHP proxy at api.nethost.co |
| `provision-hosting` | Routes to CyberPanel (Starter) or Cloudways (Business/Pro); sets DNS via Namecheap |
| `send-order-confirmation` | Sends branded HTML email via Resend with credentials |
| `create-portal-session` | Creates Stripe Customer Portal session (future customer dashboard feature) |

### VPS Proxy (api.nethost.co)

PHP scripts at `/home/api.nethost.co/` on the VPS handle operations that require server-side CyberPanel or Namecheap API access:

| Script | Role |
|---|---|
| `provision-cyberpanel.php` | Creates CyberPanel website + installs WordPress; returns wp-admin URL + credentials |
| `check-domain.php` | Checks Namecheap domain availability + pricing |
| `register-domain.php` | Registers domain via Namecheap API |
| `nethost-secrets.php` | Contains `PROXY_SECRET`, `CYBERPANEL_USER`, `CYBERPANEL_PASS`, `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY` |

**VPS SSH:** `root@api.nethost.co` — password in memory file `reference_nethost_vps.md`
**Deploy PHP changes:** `sshpass -p '...' scp -o StrictHostKeyChecking=no <file> root@api.nethost.co:/home/api.nethost.co/public_html/<file>`

### Required Supabase Secrets

```
STRIPE_SECRET_KEY
STRIPE_PRICE_STARTER
STRIPE_PRICE_BUSINESS
STRIPE_PRICE_PRO
CLOUDWAYS_EMAIL
CLOUDWAYS_API_KEY
NAMECHEAP_API_USER
NAMECHEAP_API_KEY
PROXY_URL_CYBERPANEL     # e.g. https://api.nethost.co/provision-cyberpanel.php
PROXY_URL                # e.g. https://api.nethost.co/register-domain.php (used by domain-register)
PROXY_URL_CHECK          # e.g. https://api.nethost.co/check-domain.php (used by domain-check)
PROXY_SECRET             # Must match PROXY_SECRET in nethost-secrets.php on VPS
RESEND_API_KEY
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
  domainPrice: null,        // Namecheap wholesale price string
  domainIsFree: null,       // true if price <= $15 (eligible for free 1st year promo)
  siteType: '',
  template: '',
  identity: { name: '', tagline: '', logoUrl: '', color: '#0ea5e9' },
  stripeCustomerId: '',
  stripeSubscriptionId: '',
  provisionedCredentials: null, // set by Step7: { domain, wpAdminUrl, username, password, email }
}
```

### Provisioning Tasks (Step7Provisioning.jsx)
```
Task 0: Registering domain       → calls domain-register Edge Function
Task 1: Setting up hosting       → calls provision-hosting Edge Function (CyberPanel or Cloudways)
Tasks 2–6: SSL, WordPress, email, CDN, final checks → visual delays (800ms each) while hosting finishes
```
After tasks complete: inserts to `orders` table in Supabase, fires `send-order-confirmation`, advances to Step 8.

### Step8Done Credentials Card
Reads `data.provisionedCredentials` from WizardContext (populated by Step 7). Falls back to domain-derived placeholders if missing.

---

## Do's and Don'ts

### Do
- Always use `export PATH="/opt/homebrew/bin:$PATH"` before any npm/node commands in Bash
- Keep marketing site section backgrounds alternating between `#050914` and `#07091a` for visual rhythm
- Use `rounded-full` for CTA buttons, `rounded-2xl` for cards, `rounded-xl` for inputs
- Use the `.text-gradient` utility for any headline accent spans
- Keep AdditionalServices visually muted relative to hosting sections — lower contrast, smaller cards
- Update this CLAUDE.md whenever new components, routes, or architectural decisions are added
- Deploy Edge Functions via: `supabase functions deploy <name> --project-ref qsvwdemwttwrqgvsonql`
- Deploy PHP changes via sshpass SCP to `root@api.nethost.co:/home/api.nethost.co/`

### Don't
- Don't use dynamic Tailwind class construction (`bg-${color}-500`) — Tailwind purges these
- Don't add framer-motion animations — keep animations CSS-based
- Don't expose infrastructure provider names (CyberPanel, Cloudways, Namecheap) to end users in the UI — NETHOST is the brand
- Don't merge the marketing site and portal app into a single Vite project
- Don't use `create-payment-intent` Edge Function — it's deleted; use `create-subscription` instead

---

## Pending / Future Work

- [ ] Verify `PROXY_URL` secret is set (for `domain-register` function; separate from `PROXY_URL_CYBERPANEL`)
- [ ] Test Cloudways provisioning end-to-end for Business/Pro plans
- [ ] Add auth gate before Step 1 (wizard calls `supabase.auth.getUser()` in Step 6; unauthenticated users will fail at payment)
- [ ] Customer dashboard at app.nethost.co — `create-portal-session` Edge Function is deployed; Dashboard.jsx shows subscription status badges and "Manage Subscription" button (Stripe cancel-only portal, no plan switching)
- [ ] Dedicated IP as a Pro differentiator — requires Cloudways provisioning changes (separate server per customer); not yet in provision-hosting Edge Function
- [ ] Add `.gitignore` to both projects if pushing to version control
