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
**Transactional email:** Resend API — order confirmations via `send-order-confirmation`; contact form via `contact-send`; auth emails (signup confirmation, password reset) via Resend SMTP configured in Supabase Auth settings
**Payment:** Stripe subscriptions — `create-subscription` Edge Function + Stripe `PaymentElement` (client-side)
**Billing portal:** `create-portal-session` Edge Function → Stripe Customer Portal (cancel, update payment method)
**SSL:** CyberPanel handles Let's Encrypt SSL for Starter; Cloudways handles SSL for Business/Pro
**Backups:** Starter — daily rclone cron job to Backblaze B2 (`nethost-backups` bucket, `s3.us-east-005.backblazeb2.com`); rclone remote named `backblaze` configured at `/root/.config/rclone/rclone.conf`; script at `/usr/local/bin/nethost-backup.sh`; runs `0 2 * * *`. Business/Pro — Cloudways built-in.

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
- `@keyframes confetti` — used by Step8Done confetti animation

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
├── App.jsx                 # Imports all sections; manages contactOpen state (useState); passes onContactOpen prop to Navbar, Pricing, AdditionalServices, Footer; renders ContactModal; routes: /, /resources, /terms, /privacy
├── index.css               # Tailwind directives + custom utilities
├── pages/
│   ├── Terms.jsx           # Terms of Service page (/terms)
│   ├── Privacy.jsx         # Privacy Policy page (/privacy)
│   ├── Resources.jsx       # Resources page (/resources)
│   └── NotFound.jsx        # 404 catch-all
└── components/
    ├── Navbar.jsx           # Sticky glassmorphism, logo img, mobile hamburger; "Contact Us" link (opens modal) + "Start a Project" CTA
    ├── Hero.jsx             # "Your Website, Hosted & Handled." — 4 stat badges (Uptime, Monitoring, Support, 30-Day Guarantee)
    ├── DomainSearch.jsx     # Domain availability widget — checks Namecheap via domain-check Edge Function; funnels to wizard via ?domain=&tld= URL params
    ├── TrustedBy.jsx        # Brand name row (placeholder names)
    ├── Services.jsx         # 8-card grid: hosting features (uptime, SSL, backups, email, etc.)
    ├── WhyNethost.jsx       # "Hosting That Works While You Work" — 2-col: copy left, 4 points right
    ├── Process.jsx          # 4-step horizontal timeline: Discovery → Design → Development → Launch
    ├── Pricing.jsx          # 3 hosting tiers ($19/$49/$99), Business card highlighted; "Need a custom plan? Let's talk." opens contact modal
    ├── AdditionalServices.jsx  # Muted 4-card row: Design, SEO, Marketing, Branding; "Get in touch for a custom quote." opens contact modal
    ├── Testimonials.jsx     # 6 testimonial cards, 5-star ratings, avatar initials
    ├── CtaBanner.jsx        # Full-width CTA: "Ready to Build Your Online Presence?"
    ├── Footer.jsx           # 4-col: logo+contact, Services, Company, Start a Project; "Contact" link in Company column opens modal
    └── ContactModal.jsx     # Modal: Name, Email, Phone (optional), Message; POSTs to contact-send Edge Function; inline success state; triggered from Navbar, Footer, Pricing, AdditionalServices
```

### Section Order in App.jsx
Navbar → Hero → DomainSearch → TrustedBy → Services → WhyNethost → Process → Pricing → AdditionalServices → Testimonials → CtaBanner → Footer → ContactModal

### Nav Links (Navbar.jsx)
`#features` (Services), `#process`, `#pricing`, `#testimonials` + "Contact Us" (modal trigger)

---

## Portal App (`/Users/gabrielibertis/Sites/NETHOST/app/`)

Deployed at `app.nethost.co` via Vercel (project: `nethost-app`, team: `ibertis-projects`).

### Dev Server
```bash
export PATH="/opt/homebrew/bin:$PATH" && cd /Users/gabrielibertis/Sites/NETHOST/app && npm run dev -- --port 5175
```

### Test Mode (local dev only)
Create `app/.env.local` (git-ignored) with:
```
VITE_TEST_MODE=true
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
`VITE_TEST_MODE=true` skips real provisioning (returns mock credentials) and skips the confirmation email. The live Vercel deployment never has this set — it runs in production mode automatically.

### Purpose
Full onboarding wizard + customer dashboard. Wizard guides new customers from plan selection through domain, site setup, and identity to live provisioning. After purchase, customers land on the dashboard to manage their sites.

### File Structure

```
app/src/
├── App.jsx                          # Auth gate (Login if unauthenticated); view state: 'wizard' | 'dashboard' | 'account'; passes goToDashboard to WizardProvider
├── index.css                        # Tailwind + .input-field, .card-select, @keyframes confetti utilities
├── lib/
│   ├── AuthContext.jsx              # Supabase auth provider + useAuth hook (isAuthenticated, isLoadingAuth, user, logout)
│   └── supabaseClient.js            # Supabase client init
├── context/
│   └── WizardContext.jsx            # All wizard state; accepts initialData prop (merged over DEFAULTS at mount); goToDashboard callback
├── pages/
│   ├── Login.jsx                    # Email/password login + signup + forgot password + confirm (4 modes); signup shows violet tint; confirm mode has resend button + inline resend link on 'Email not confirmed' error
│   ├── Dashboard.jsx                # Authenticated landing — lists orders as SiteCard components; "Launch Another Site" + "Billing" (portal session) + "Account" nav; SiteCard handles status: 'provisioning' (blue spinner banner, no credentials/WP Admin), 'active', 'cancelled', 'past_due'; amber DNS propagation notice for active orders < 48hrs old
│   └── Account.jsx                  # Change password form
└── components/
    ├── WizardShell.jsx              # Top bar (logo→nethost.co), 6-step progress pills, Back/Continue nav
    ├── ContactModal.jsx             # Same contact form modal as marketing site
    └── steps/
        ├── Step1Plan.jsx            # 3 plan cards (Starter $19 / Business $49 / Pro $99)
        ├── Step2Domain.jsx          # Register tab (Namecheap availability check) or Connect tab (with Nameservers / DNS Records toggle → sets dnsMethod in wizard state)
        ├── Step3SiteType.jsx        # 2×2 icon grid: Business / Portfolio / Blog / E-commerce
        ├── Step4Template.jsx        # 3×2 gradient thumbnail grid: Minimal/Bold/Corporate/Creative/Modern/Classic
        ├── Step5Identity.jsx        # Name, tagline, logo drag-drop, 6 color presets + custom, live mini-preview
        ├── Step6Review.jsx          # Order summary + Stripe PaymentElement; subscription created on mount (clientSecret stored in wizard state to prevent duplicates); confirms with stripe.confirmPayment({ redirect: 'if_required' })
        ├── Step7Provisioning.jsx    # Calls domain-register + provision-hosting (passes userId + Stripe IDs so provision-hosting can own DB writes); sends confirmation email (skipped in test mode); animated task list; error screen reassures user payment is safe
        └── Step8Done.jsx            # Confetti, credentials card, DNS setup panel (only shown when domainOption === 'connect'; shows nameservers or A+CNAME records based on dnsMethod)
```

### Supabase Edge Functions

| Function | Purpose |
|---|---|
| `create-subscription` | Creates Stripe customer + subscription, returns clientSecret for PaymentElement confirmation. Supports test mode via `testMode` boolean in request body (uses `STRIPE_SECRET_KEY_TEST` and `STRIPE_PRICE_*_TEST` secrets). |
| `stripe-webhook` | Handles Stripe subscription lifecycle events (payment_succeeded, payment_failed, subscription.deleted, subscription.updated) → updates `orders.status`. Uses HMAC SHA-256 signature verification (no Stripe SDK). Uses service-role key for DB updates. |
| `domain-check` | Checks Namecheap availability + price via PHP proxy |
| `domain-register` | Registers domain via Namecheap PHP proxy |
| `provision-hosting` | Routes to CyberPanel (Starter) or Cloudways (Business/Pro); sets DNS via Namecheap; returns `{ wpAdminUrl, username, password, email, serverIp }`. **Before provisioning:** uses service-role key to insert an `orders` row with `status: 'provisioning'` (reuses existing provisioning row on retry). **After success:** updates row with credentials and `status: 'active'`. Step7 no longer does its own DB insert. Cloudways path: creates app via POST /app, waits 30s, then polls GET /server every 10s (up to 12×) to find app + credentials in server.apps array. Credentials may be at top-level app fields (sys_user/sys_password) not nested under creds[]. |
| `send-order-confirmation` | Branded HTML email via Resend — includes domain, plan, wp-admin URL, username. Does NOT include password (security). |
| `contact-send` | Contact form → email to hello@nethost.co via Resend |
| `create-portal-session` | Creates Stripe Customer Portal session → returns redirect URL |

### Auth Emails (Supabase + Resend SMTP)
Supabase auth emails (signup confirmation, password reset) route through Resend SMTP:
- Configured in Supabase → Authentication → Emails → SMTP Settings
- Host: `smtp.resend.com`, Port: `465`, Username: `resend`, Password: Resend API key (`nethost-smtp` key)
- Sender: `NETHOST <hello@nethost.co>`
- Branded HTML templates saved at `app/supabase/email-templates/confirm-signup.html` and `reset-password.html`
- Templates use `{{ .ConfirmationURL }}` Supabase variable

### Stripe Customer Portal
Configured in Stripe live mode (Settings → Billing → Customer portal):
- Payment methods: enabled
- Cancellations: enabled, cancel at end of billing period, collect cancellation reason

### VPS Proxy (api.nethost.co)

PHP scripts at `/home/api.nethost.co/public_html/` on the VPS handle operations requiring server-side CyberPanel or Namecheap API access:

| Script | Role |
|---|---|
| `provision-cyberpanel.php` | Creates CyberPanel website + installs WordPress; WP username generated as `nh{domain-prefix}` (e.g. `nhibertis` for `ibertis.net`); returns `{ wpAdminUrl, username, password, email }` |
| `check-domain.php` | Checks Namecheap domain availability + pricing |
| `register-domain.php` | Registers domain via Namecheap API |
| `nethost-secrets.php` | Contains `PROXY_SECRET`, `CYBERPANEL_USER`, `CYBERPANEL_PASS`, `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY` |

**VPS SSH:** `ssh nethost-vps` (alias configured in `~/.ssh/config` using key `~/.ssh/nethost_vps`) — no password needed
**Deploy PHP changes:** `scp -i ~/.ssh/nethost_vps <file> root@76.13.118.227:/home/api.nethost.co/public_html/<file>`

### Required Supabase Secrets

```
STRIPE_SECRET_KEY              # Live mode Stripe secret key
STRIPE_WEBHOOK_SECRET          # Stripe webhook signing secret (for stripe-webhook function)
STRIPE_PRICE_STARTER           # Live mode price ID for Starter ($19/mo)
STRIPE_PRICE_BUSINESS          # Live mode price ID for Business ($49/mo)
STRIPE_PRICE_PRO               # Live mode price ID for Pro ($99/mo)
STRIPE_SECRET_KEY_TEST         # Test mode secret key (optional — for local test mode)
STRIPE_PRICE_STARTER_TEST      # Test mode price ID for Starter
STRIPE_PRICE_BUSINESS_TEST     # Test mode price ID for Business
STRIPE_PRICE_PRO_TEST          # Test mode price ID for Pro
CLOUDWAYS_EMAIL
CLOUDWAYS_API_KEY
NAMECHEAP_API_USER
NAMECHEAP_API_KEY
PROXY_URL_CYBERPANEL           # https://api.nethost.co/provision-cyberpanel.php
PROXY_URL                      # https://api.nethost.co/register-domain.php
PROXY_URL_CHECK                # https://api.nethost.co/check-domain.php
PROXY_SECRET                   # Must match PROXY_SECRET in nethost-secrets.php on VPS
RESEND_API_KEY                 # Used by send-order-confirmation and contact-send functions
```

### Vercel Environment Variables (app.nethost.co)

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY    # Must be LIVE mode key (pk_live_...) — baked into build at deploy time
```
After changing any `VITE_*` variable in Vercel, a redeploy is required.

### WizardContext State Shape
```js
{
  step: 1,                    // 1–8; steps 7–8 hide the nav footer
  plan: 'Business',           // 'Starter' | 'Business' | 'Pro'
  domain: '',                 // full domain string e.g. 'mybiz.com'
  tld: '.com',
  domainOption: 'register',   // 'register' | 'connect'
  dnsMethod: 'nameservers',   // 'nameservers' | 'records' — only relevant when domainOption === 'connect'
  domainAvailable: null,
  domainPrice: null,          // Namecheap wholesale price string
  domainIsFree: null,         // true if price <= $15 (free 1st year promo)
  siteType: '',
  template: '',
  identity: { name: '', tagline: '', logoUrl: '', color: '#0ea5e9' },
  stripeClientSecret: '',     // stored on Step 6 mount to prevent duplicate subscription creation
  stripeCustomerId: '',
  stripeSubscriptionId: '',
  provisionedCredentials: null, // set by Step 7: { domain, wpAdminUrl, username, password, email, serverIp }
}
```

### orders Table Schema
```sql
create table orders (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references auth.users not null,
  plan                   text not null,
  domain                 text not null,
  wp_admin_url           text,
  username               text,
  password               text,   -- stored for dashboard credential retrieval; NOT sent in email
  email                  text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text default 'active',  -- updated by stripe-webhook function
  created_at             timestamptz default now()
);
```
RLS: users can SELECT and INSERT their own rows. `stripe-webhook` and `provision-hosting` use service-role key for UPDATE/INSERT (bypasses RLS). Valid status values: `'provisioning'` | `'active'` | `'past_due'` | `'cancelled'`.

### Provisioning Tasks (Step7Provisioning.jsx)
```
Task 0: Registering domain       → calls domain-register Edge Function (skipped for 'connect' domains)
Task 1: Setting up hosting       → calls provision-hosting Edge Function (CyberPanel or Cloudways)
Tasks 2–6: SSL, WordPress, email, CDN, final checks → visual delays (800ms each)
```
After tasks complete: fires `send-order-confirmation` (live mode only), advances to Step 8. **DB write is handled by `provision-hosting`** (service-role) — Step7 no longer inserts to `orders` directly.

### Step 8 DNS Panel
Shown only when `domainOption === 'connect'`. Two variants:
- `dnsMethod === 'nameservers'` → shows `ns1.nethost.co` / `ns2.nethost.co` with copy buttons
- `dnsMethod === 'records'` → shows A record (`serverIp` from provisionedCredentials) + CNAME (`www → domain`) with copy buttons
Both variants show a 48-hour propagation notice.

---

## Security Notes

- WP admin username is **never** `admin` — generated as `nh{domain-prefix}` (e.g. `nhgetmywebsite` for `getmywebsite.net`) in both CyberPanel PHP script and Cloudways Edge Function path
- WP password is stored in `orders` table (behind auth/RLS) but **never** sent in confirmation email
- Stripe keys: `VITE_STRIPE_PUBLISHABLE_KEY` on Vercel must be live mode (`pk_live_`); `STRIPE_SECRET_KEY` in Supabase must match (live `sk_live_`)
- Stripe price IDs in Supabase secrets must be live mode price IDs (not test mode) for the production app
- PHP proxy scripts are protected by `X-Proxy-Secret` header (timing-safe `hash_equals`); `nethost-secrets.php` lives at `/home/api.nethost.co/nethost-secrets.php` — one level above web root, not HTTP-accessible
- PHP proxy CORS restricted to `https://app.nethost.co` (not wildcard)
- `provision-hosting` inserts `status: 'provisioning'` order row before calling infrastructure APIs — ensures payment is traceable if provisioning fails mid-flight

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
- Deploy PHP changes via SCP with SSH key: `scp -i ~/.ssh/nethost_vps <file> root@76.13.118.227:/home/api.nethost.co/public_html/<file>`

### Don't
- Don't use dynamic Tailwind class construction (`bg-${color}-500`) — Tailwind purges these
- Don't add framer-motion animations — keep animations CSS-based
- Don't expose infrastructure provider names (CyberPanel, Cloudways, Namecheap) to end users in the UI — NETHOST is the brand
- Don't merge the marketing site and portal app into a single Vite project
- Don't use `create-payment-intent` Edge Function — it's unused; use `create-subscription` instead
- Don't use `CardElement` from Stripe — use `PaymentElement` (switched for proper billing address / AVS handling)
- Don't use `sshpass` for VPS operations — SSH key auth is configured (`~/.ssh/nethost_vps`)
- Don't store sensitive secrets (keys, passwords) in CLAUDE.md or memory files

---

## Pending / Future Work

- [ ] Add test Supabase secrets for local test mode: `STRIPE_SECRET_KEY_TEST`, `STRIPE_PRICE_STARTER_TEST`, `STRIPE_PRICE_BUSINESS_TEST`, `STRIPE_PRICE_PRO_TEST`
- [ ] Dedicated IP as a Pro differentiator — requires Cloudways provisioning changes; not yet implemented
- [ ] Automated site cleanup on cancellation — delete from CyberPanel/Cloudways after billing period ends; currently manual
- [ ] Cloudways multi-server strategy — all Business/Pro customers share one server; need plan for when to add a second
- [ ] Live site status on dashboard — green/red dot per SiteCard showing if site is actually responding
- [ ] Clean up DFP WooCommerce webhook in Stripe (leftover from old WordPress site)
- [ ] Investigate link-spark webhook in Stripe (unknown origin)

## Potential Future Features / Customer Value

- **Staging environment** — one-click staging site for Business/Pro customers to test changes before going live (Cloudways supports this natively)
- **Automatic plugin updates** — managed WP plugin updates with rollback (Cloudways feature)
- **Uptime monitoring** — email/SMS alert when a customer site goes down (integrate Better Uptime or UptimeRobot)
- **Monthly performance reports** — automated email to customers with uptime %, page speed score, backup status
- **White-glove onboarding** — optional paid add-on: NETHOST team migrates existing site and sets up theme/plugins
- **Business email add-on** — Google Workspace or Zoho Mail provisioning as upsell during wizard
- **CDN toggle** — Cloudflare CDN on/off per site (improves load times globally)
- **WordPress care plans** — recurring monthly service: updates, backups verification, security scans, content edits

## Completed Milestones

- [x] Starter plan (CyberPanel) provisioning — fully working end-to-end
- [x] Business/Pro plan (Cloudways) provisioning — fully tested end-to-end with real payment (markitang.com)
- [x] Stripe subscriptions + webhook lifecycle (active/past_due/cancelled)
- [x] Cancel flow — in-app cancellation via cancel-subscription Edge Function, verified against Stripe
- [x] Resend transactional email (order confirmation + auth emails)
- [x] Stripe payment notifications enabled (email for success, SMS for failures)
- [x] Customer dashboard with credentials + DNS propagation notice + cancel flow
- [x] Login/signup with confirm mode + resend confirmation flow
- [x] Backblaze B2 remote backups for Starter VPS (daily cron, encrypted)
- [x] OG social image live at nethost.co/og-image.jpg (1200×630px)
- [x] Footer "My Account" link + authenticated users default to dashboard
- [x] Full end-to-end audit: all plans tested, all flows verified, ready for real customers
- [x] Security audit completed: RLS verified, PHP proxy hardened (CORS + secrets path), no service-role key in frontend
- [x] Terms of Service + Privacy Policy pages live at nethost.co/terms and nethost.co/privacy
- [x] Provisioning failure recovery: order row written before infrastructure APIs called; dashboard shows 'provisioning' status with support link if setup fails
