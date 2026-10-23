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

> **Supabase hosting (since 2026-10-13):** the NETHOST project (`qsvwdemwttwrqgvsonql`) lives in the **free "NETHOST" Supabase org**, moved out of the paid REALFORM Studios org to cut costs while there are no customers. Free-tier tradeoffs: the project **auto-pauses after 7 days of no DB activity** (signups and the Stripe webhook fail until it is restored from the dashboard) and there are no daily backups. **When the first paying customer signs up, transfer it back to the REALFORM Studios Pro org** (~$10/mo). The free org's 2nd slot is used by Permiana (`ptxrxekttwxpmmylccal`). Project URL, keys, Edge Functions and secrets were unchanged by the transfer. **Kept awake by a daily ping since 2026-10-23:** root cron `17 9 * * *` on the NETHOST VPS runs `/usr/local/bin/supabase-keepalive.sh`, a 1-row REST read on NETHOST (`orders`) and Permiana (`publications`) using the public anon keys in `/root/.supabase-keepalive.env`; log at `/var/log/supabase-keepalive.log` (expect HTTP 200). If a project is ever transferred, re-keyed or moves to Pro, update or remove its line in the script.

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
**Billing portal:** `create-portal-session` Edge Function → Stripe Customer Portal (cancel, update payment method). Portal URLs are generated per session, so they use `billing.stripe.com`.

> **Stripe custom domain removed (2026-09-27):** `billing.nethost.co` was set up as a Stripe custom domain (Checkout, Payment Links, Customer Portal), which costs **$10/month**. With no revenue, Stripe pulled the fee from the business bank account as a monthly ACH "TRANSFER" debit (~3rd of each month, `IND ID:ST-...`). Removed in Stripe (Settings → Business → Custom domains) and the `billing` CNAME deleted from Cloudflare. Nothing in the code references it. Re-add only once there are paying customers and branded billing URLs are worth $120/yr.
**SSL:** CyberPanel handles Let's Encrypt SSL for Starter; Cloudways handles SSL for Business/Pro
**Backups:** Starter — daily rclone cron job (**database-only since 2026-07-24**, see gotcha note below) to Backblaze B2 (`nethost-backups` bucket, `s3.us-east-005.backblazeb2.com`); rclone remote named `backblaze` configured at `/root/.config/rclone/rclone.conf`; script at `/usr/local/bin/nethost-backup.sh`; runs `0 2 * * *`. All 4 VPS template sites also have UpdraftPlus installed (weekly schedule, retain 2 copies) backing up to the same B2 bucket via S3-Compatible (Generic) endpoint; path prefix per site is `updraftplus/[domain]` (e.g. `updraftplus/template.nethost.co`). Business/Pro — Cloudways built-in backups.

> **Backup retention/cap gotcha (2026-07-20):** `nethost-backup.sh` originally had no retention — it wrote a new dated folder every day and never pruned, so daily backups accumulated and filled the B2 free-tier storage cap ~June 13, silently blocking ALL uploads for ~5 weeks (the 2 AM cron keeps running but `rclone sync` 403s, hidden by `--quiet`). Script now keeps the newest 14 dated folders ([vps-files/nethost-backup.sh](vps-files/nethost-backup.sh)). BUT the rclone remote is **S3-compatible (`type=s3`)** against Backblaze, so rclone deletes only create B2 *hidden versions* that still count toward billed storage; real reclamation requires a **B2 bucket Lifecycle Rule "Keep only the last version of the file"** (console) plus raising the **Caps & Alerts → Storage Cap** to the 10 GB free ceiling (real data is only ~6.3 GB). **Resolved 2026-07-20:** lifecycle rule confirmed already set (`daysFromHidingToDeleting:1`); a one-time B2-native-API pass deleted 308 stale versions (~3.5 GB reclaimed) so uploads unblocked immediately instead of waiting on B2's ~daily lifecycle run; verified working (fresh `2026-07-20/` folder uploaded, retention aged out the oldest). Steady state ~6.9 GB current data → stays in the 10 GB free tier ($0). The reclaim reused the rclone key's own B2 creds (turned out to have full caps incl. `writeBucketLifecycleRules`).
>
> **Update 2026-07-24 — switched to database-only:** the cap recurred. Root cause was two-fold: (1) the per-site file tarballs were sweeping in UpdraftPlus's own `wp-content/updraft` archives — **backing up backups**, ~620MB/run, which ballooned each daily from ~380MB to ~980MB; and (2) 14 daily full backups of 6 template sites simply exceed the 10GB free tier. Since there is still **no client data** and site files are already covered by UpdraftPlus (weekly) + Hostinger weekly full-VM backups, `nethost-backup.sh` was switched to **database-only** (`mysqldump --all-databases` only; retention 7). Each daily run is now **~6MB**; whole bucket ~200MB (incl. the `updraftplus/` prefix). NOTE: also had to strip old bloated dated folders + reclaim versions to get back under the (evidently low / laggy) cap. **When real client data arrives, re-add per-site file backups** — git history of `vps-files/nethost-backup.sh` has the `tar` version with `--exclude` patterns for `updraft`/`cache`/`wflogs`/`*.log` so you never re-introduce the backup-of-backups bloat.

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
├── App.jsx                 # Imports all sections; manages contactOpen state (useState); passes onContactOpen prop to Navbar, Pricing, AdditionalServices, Footer; renders ContactModal; routes: /, /resources, /services, /terms, /privacy
├── index.css               # Tailwind directives + custom utilities
├── pages/
│   ├── Terms.jsx           # Terms of Service page (/terms)
│   ├── Privacy.jsx         # Privacy Policy page (/privacy)
│   ├── Resources.jsx       # Resources page (/resources)
│   ├── Services.jsx        # Supplemental services page (/services) — branding, web, marketing, AI/automation; not in main nav; linked from AdditionalServices cards + "Explore all services →"
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
| `stripe-webhook` | Handles Stripe subscription lifecycle events (payment_succeeded, payment_failed, subscription.deleted, subscription.updated) → updates `orders.status`. Uses HMAC SHA-256 signature verification (no Stripe SDK). Uses service-role key for DB updates. **Must be deployed with `--no-verify-jwt`** (Stripe webhooks don't include Supabase JWTs). Registered in Stripe as NETHOST-SignUp webhook (**Live mode**) pointing to `https://qsvwdemwttwrqgvsonql.supabase.co/functions/v1/stripe-webhook`. GOTCHA: Stripe keeps **separate Test-mode and Live-mode webhook lists** — a stale *test-mode* endpoint pointing at an old, Supabase project (`ptxrxekttwxpmmylccal` = Permiana, a separate app) kept generating "webhook delivery issues [test mode]" emails; removed 2026-07-20. When auditing Stripe webhooks check BOTH lists: `dashboard.stripe.com/webhooks` (live) and `dashboard.stripe.com/test/webhooks` (test). |
| `domain-check` | Checks Namecheap availability + price via PHP proxy |
| `domain-register` | Registers domain via Namecheap PHP proxy |
| `provision-hosting` | Routes to CyberPanel (Starter) or Cloudways (Business/Pro); sets DNS via Namecheap; returns `{ wpAdminUrl, username, password, email, serverIp }`. **Before provisioning:** uses service-role key to insert an `orders` row with `status: 'provisioning'` (reuses existing provisioning row on retry). **After success:** updates row with credentials and `status: 'active'`. Step7 no longer does its own DB insert. Cloudways path: authenticates with `CLOUDWAYS_ACCESS_TOKEN` as a Bearer token (no OAuth exchange), creates app via POST /app, waits 30s, then polls GET /server every 10s (up to 12×) to find app + credentials in server.apps array. Credentials may be at top-level app fields (sys_user/sys_password) not nested under creds[]. |
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

---

## WordPress Template Site (template.nethost.co)

The Starter plan provisioning clones this pre-built WordPress site as every customer's starting point. `provision-cyberpanel.php` does a WP-CLI DB export → import → search-replace (`template.nethost.co` → customer domain) → admin credential update → uploads rsync.

### Access
```bash
# SSH
ssh -i ~/.ssh/nethost_vps root@76.13.118.227
# or via alias (configured in ~/.ssh/config)
ssh nethost-vps

# WP-CLI — base path on the VPS
/usr/bin/wp --allow-root --path=/home/template.nethost.co/public_html

# GOTCHA: the system `php` CLI (8.1 at /usr/bin/php) has NO mysqli extension, so any
# DB-touching WP-CLI command (plugin list/update, option get/patch, eval-file, search-replace)
# errors with "missing the MySQL extension". Prefix with lsphp 8.3 (has mysqli):
/usr/local/lsws/lsphp83/bin/php /usr/bin/wp --allow-root --path=/home/<domain>/public_html <cmd>

# Deploy a file
scp -i ~/.ssh/nethost_vps <local-file> root@76.13.118.227:/tmp/<file>
```

### Theme + Page Builder
- **Theme:** Astra (Balor Starter Template — black/white, Poppins font)
- **Page builder:** Elementor 4.x — flexbox container format (`elType: "container"`)
- **Font:** Poppins loaded via Google Fonts / Astra theme

### Template Sites (Wizard Selection)
| Wizard Option | VPS Domain | Design | Plugins |
|---|---|---|---|
| Minimal | `template.nethost.co` | Astra Balor | Elementor, Astra Sites |
| Corporate | `template-minimal.nethost.co` | Digital Agency | Elementor, UAE, SureForms, LatePoint |
| Bold | `template-corporate.nethost.co` | David Williams | Elementor, WPForms Lite |
| Blank | `template-blank.nethost.co` | Astra + Elementor only | Elementor |

All template sites use `admin` / `NHtemplate25!` (internal use — change via WP admin).
Provisioning maps are in `vps-files/provision-cyberpanel.php` → `$templateMap`.

### Page IDs
The site was rebuilt after the earlier Elementor-corruption incident, so all the old IDs (18/137/138/142/165/168/169) are gone. Current published page set (verified 2026-07-20), all built in Elementor except Blog (a posts-listing page, no Elementor data — correct):
| Page | ID | Slug | Notes |
|---|---|---|---|
| Home | 762 | `home` | Front page (`page_on_front`); ~99 KB Elementor |
| About | 764 | `about` | Elementor |
| Services | 765 | `services` | Elementor; renamed from `services-2` after trashing old duplicate 142 (2026-07-20) |
| Blog | 766 | `blog` | Posts-listing page — intentionally no Elementor data |
| Contact | 767 | `contact` | Elementor |
| Privacy Policy | 3 | `privacy-policy` | Draft |

Nav: active menu is term 9 "Menu" (primary/mobile/footer locations), linking Home→762, About→764, Services→765, Blog→766, Contact→767. An orphaned "Primary Menu" (term 3, no location assigned, not displayed) still exists. Note: `nav_menu_item` posts (e.g. ID 18 = the Blog menu item) show as published title-less posts — do NOT mistake them for empty pages.

### Media Library (Balor Template Images)
Base URL: `http://template.nethost.co/wp-content/uploads/2022/05/`

| File | Attachment ID |
|---|---|
| `hero-img.jpg` | 27 |
| `img-1.jpg` | 37 |
| `img-2.jpg` | 48 |
| `img-3.jpg` | 49 |
| `leah-img.jpg` | 93 |
| `contact.jpg` | 134 |

### MU Plugin
`vps-files/nethost-setup.php` deployed to `/home/template.nethost.co/public_html/wp-content/mu-plugins/nethost-setup.php`
- Redirects new admin logins to Astra Starter Templates until `nethost_setup_done` option is set
- Shows dismissible admin notice pointing to Starter Templates

### Page Builder Scripts
Local PHP scripts in `vps-files/` build/update pages via `wp eval-file`.

| Script | Purpose |
|---|---|
| `vps-files/build-services.php` | Services page full build — use as canonical reference for builder pattern |
| `vps-files/update-template-pages.php` | **DEPRECATED / BROKEN** — the `walk_update()` approach corrupted Home (ID 18) and failed on Contact (ID 138). Do not use or extend this pattern. |

**Deploy + run pattern:**
```bash
scp -i ~/.ssh/nethost_vps vps-files/<script>.php root@76.13.118.227:/tmp/<script>.php && \
ssh -i ~/.ssh/nethost_vps root@76.13.118.227 \
  "/usr/bin/wp --allow-root --path=/home/template.nethost.co/public_html eval-file /tmp/<script>.php 2>&1"
```

### Elementor JSON Builder — Critical Rules

Elementor 4.x stores page data as JSON in `_elementor_data` post meta. All build scripts use the same `section_outer()` / `col()` / `w_text()` / `w_heading()` / `w_button()` helper pattern.

1. **Background activation** — must include `background_background: 'classic'` alongside any `background_color` or `background_image`. Without it the background doesn't render (silent fail).

2. **Column widths need two settings** — both `_column_size: 50` AND `width: {size: 50, unit: '%'}`. One alone doesn't work.

3. **No literal newlines inside HTML strings** — `wp_json_encode` preserves `\n` chars, and Elementor's text widget renders them as a visible `n` on the page. Put all HTML on a **single line**. Use `<br>` for line breaks.

4. **Image widgets** — only need `image: {id: "27", url: "..."}` and `image_size: "full"`. No other settings needed.

5. **Use Unicode characters directly** in strings (e.g. `✓`) rather than HTML entities like `&#10003;`. Entities can render as literal text in the widget.

6. **Nested inner containers work** — a `col()` can hold further `col()` entries to build a row-within-column layout (e.g. 4-column step grid inside a section column). Set `flex_direction: 'row'` on the parent col.

7. **Post meta write pattern** after any build:
```php
update_post_meta($id, '_elementor_data', wp_json_encode($data, JSON_UNESCAPED_UNICODE));
update_post_meta($id, '_elementor_edit_mode', 'builder');
update_post_meta($id, '_elementor_template_type', 'wp-page');
update_post_meta($id, '_wp_page_template', 'elementor_header_footer');
\Elementor\Plugin::$instance->files_manager->clear_cache(); // clears LiteSpeed + Elementor cache
```

8. **NEVER patch existing Elementor JSON via `json_decode` → modify → `wp_json_encode`** — this corrupts the stored data whenever replacement strings contain `"` (double-quote) characters inside HTML. For example, a testimonial like `<p>"Great service!"</p>` will prematurely terminate the JSON string when re-encoded, breaking the entire page (renders unstyled or blank). The `walk_update()` / find-replace-on-decoded-array approach is inherently unsafe for any HTML that contains quotes. **Always rebuild pages from scratch** using the builder script pattern instead of patching in-place.

9. **Rebuilding is the only safe page update strategy.** If page copy needs updating, write a new full-page build script (like `build-services.php`) that replaces `_elementor_data` entirely with freshly generated JSON. Do not attempt to read, mutate, and re-write existing Elementor data. If a page breaks due to corrupted JSON (symptoms: page renders flush-left, unstyled, or blank), re-import that page from the Astra Starter Templates plugin in WP admin (Appearance → Starter Templates → Balor), then rebuild any custom sections on top.

### Footer
- Widget areas: `footer-widget-1` (description) and `footer-widget-2` (contact info) — Gutenberg block widgets stored in `widget_block` option, entries 7 and 8.
- Copyright text: `footer-sml-section-1-credit` key inside `astra-settings` option. Uses `[current_year]` and `[site_title]` dynamic tags.
- Update via `update_option()` in a `wp eval-file` script.

---

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
CLOUDWAYS_ACCESS_TOKEN                # Cloudways Access Token "NETHOST provision hosting" (Full Access, no expiry); sent directly as Bearer. Replaced legacy CLOUDWAYS_EMAIL + CLOUDWAYS_API_KEY on 2026-09-27 (API keys retired 2026-10-15)
CLOUDWAYS_TEMPLATE_APP_ID_BOLD        # Cloudways app ID for Bold (Balor) template
CLOUDWAYS_TEMPLATE_APP_ID_MINIMAL     # Cloudways app ID for Minimal template
CLOUDWAYS_TEMPLATE_APP_ID_CORPORATE   # Cloudways app ID for Corporate template
# CLOUDWAYS_TEMPLATE_APP_ID still accepted as a generic fallback
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
RLS: users can SELECT and INSERT their own rows. `stripe-webhook` and `provision-hosting` use service-role key for UPDATE/INSERT (bypasses RLS). Valid status values: `'provisioning'` | `'active'` | `'past_due'` | `'cancelled'`. All webhook status writes use `'cancelled'` (double l) and `'past_due'` — must match Dashboard checks.

> **Supabase Data API note:** For any new tables added after Oct 30, 2026, include `GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_name TO anon, authenticated;` in the migration SQL — Supabase will no longer auto-expose public schema tables to the Data API on existing projects after that date.

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

### WordPress Hardening (Template Sites)

**MU Plugin** — deployed to all 4 VPS template sites and all 3 Cloudways template apps at:
`wp-content/mu-plugins/nethost-security.php`
Sets security headers via `send_headers` hook (PHP-level — required because OLS ignores mod_headers in .htaccess and Cloudways uses Nginx), removes REST API user enumeration endpoints, redirects author archive pages, strips WP generator tag, sets `DISALLOW_FILE_EDIT`.

**VPS .htaccess** — all 4 VPS template sites have OLS-compatible security rules using `RewriteRule [F,L]` (not `Files`/`FilesMatch` — those are ignored by OpenLiteSpeed):
- Blocks: `xmlrpc.php`, `readme.html`, `license.txt`, `.user.ini`, `?author=` enumeration
- `.user.ini` additionally blocked via OLS vhost context block in `/usr/local/lsws/conf/vhosts/[domain]/vhost.conf` (RewriteRule can't match dotfiles in OLS)

**Cloudways apps** — `readme.html` and `license.txt` deleted from all 3 apps' `/public_html/` (Nginx ignores .htaccess deny rules; file deletion is the only option). WP admin username on all 3 is `nhadmin`.

**Cloudflare Snippet** — `security_headers` snippet active on nethost.co (free-tier alternative to Transform Rules); sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-XSS-Protection`, `Permissions-Policy` on all responses.

**Wordfence** — installed on all 4 VPS template sites. `php-ai-client` false positives suppressed via `scan_exclude_paths` in `wp_wfconfig` table (WP-CLI: `wp option patch insert wp_wfconfig scan_exclude_paths "wp-includes/php-ai-client/"`).

**api.nethost.co** — `/home/api.nethost.co/public_html/.htaccess` blocks direct access to `nethost-secrets.php` and sets security headers. The legitimate secrets file remains at `/home/api.nethost.co/nethost-secrets.php` (outside webroot).

### VPS / Host-Level Hardening (2026-07-20)

The CyberPanel VPS (Hostinger KVM, VM id `1566822`, `76.13.118.227`) was fully firewalled + hardened after finding it wide open (no firewall, root+password SSH, public admin consoles):

- **SSH is key-only:** `PasswordAuthentication no` + `PermitRootLogin prohibit-password` via `/etc/ssh/sshd_config.d/00-nethost-hardening.conf`. It's named `00-` so it sorts before Ubuntu's `50-cloud-init.conf`, which was forcing `PasswordAuthentication yes` (also patched to `no`). Only the `~/.ssh/nethost_vps` key logs in now — there is no password fallback.
- **fail2ban** active (sshd jail; `bantime 1h`, `maxretry 5`), config `/etc/fail2ban/jail.local`. `ignoreip` includes the admin IP `71.199.212.179` so admin activity can't self-ban. NOTE: don't hammer port 22 with `nc`/probes from a non-ignored IP or fail2ban may ban it.
- **Disabled services:** CyberPanel WebSSH (`fastapi_ssh_server`, was a public **root web terminal** on `:8888`) and FTP (`pure-ftpd-mysql`, `:21`) — stopped + disabled/masked. Use SFTP-over-SSH instead of FTP.
- **Hostinger cloud firewall** `nethost-vps` (id `331984`) attached to the VM (default-drop; managed via Hostinger API/console, not host iptables):
  - Public (any): 80, 443 (TCP+UDP), 25, 465, 587, 110, 143, 993, 995, 53 (TCP+UDP), 22, ICMP.
  - **Admin, restricted to `71.199.212.179`:** 8090 (CyberPanel), 7080 (OLS WebAdmin).
  - Everything else dropped (e.g. 4190 ManageSieve). MySQL/Redis/memcached were already localhost-only.
  - **Admin IP is residential/dynamic** — if it changes, edit the 8090/7080 rules in Hostinger console (VPS → Firewall). Can't be permanently locked out: SSH (22) stays open to any (protected by key-only + fail2ban).
  - **GOTCHA:** after creating/editing rules you must **activate AND sync** the firewall to the VM (`is_synced` starts false; activation alone isn't enough). During a sync the box's networking is rewritten and connections briefly blip (SSH/HTTP can drop for ~seconds) — wait for it to settle before concluding a rule is wrong.
- **PHP is NOT auto-patched (2026-10-21 lesson):** unattended-upgrades only covers Ubuntu repos. CyberPanel's `lsphp*` packages come from the LiteSpeed repo, so they sat on 8.3.30 while a critical PHP CVE was being exploited. **Check monthly** and patch with: `apt-get update && apt list --upgradable | grep lsphp`, then `apt-get install -y --only-upgrade $(apt list --upgradable 2>/dev/null | grep -oE "^lsphp[^/]+")` and `/usr/local/lsws/bin/lswsctrl restart`. (Passing every installed `lsphp*` name in one install command silently fails; use the upgradable list.) Patched 2026-10-21 → lsphp83 8.3.36, lsphp82 8.2.35; also installed 12 pending Ubuntu security updates.
- **All vhosts on lsphp83 (2026-10-21):** `api.nethost.co` moved from lsphp81 (EOL) and `panel.nethost.co` from lsphp80 (EOL) by editing `extprocessor ... path` in `/usr/local/lsws/conf/vhosts/<domain>/vhost.conf` (backups: `vhost.conf.bak-2026-10-21`). lsphp80/81 are still installed but unused; do not point new sites at them.
- **Cloudways template apps run PHP 8.3** (switched from 8.2 on 2026-10-22; per-app: Application Settings → PHP Settings). Keep all apps on the server on the same PHP version: Cloudways warns that mixed versions use extra RAM on the 2 GB server. App URLs: Corporate `wordpress-1628504-6441651.cloudwaysapps.com`, Minimal `wordpress-1628504-6441650.cloudwaysapps.com`, Bold `template-bold.nethost.co` (primary domain since 2026-10-22; its custom Let's Encrypt cert only covers that domain, so it must stay primary or wp-admin hits a certificate error).
- Monarx malware agent active. Verified end-state from external nodes: public ports reachable, 8090/7080 blocked except from the admin IP, 4190 blocked.

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
- When building Elementor pages programmatically, keep all HTML strings on single lines — no literal newlines
- Store new VPS-side PHP scripts in `vps-files/` locally so they're version-controlled
- Use `/usr/bin/wp --allow-root` as the WP-CLI path on the VPS (not `/usr/local/bin/wp`); for any DB-touching command prefix with lsphp 8.3 — `/usr/local/lsws/lsphp83/bin/php /usr/bin/wp ...` — because the system php CLI lacks mysqli

### Don't
- Don't use dynamic Tailwind class construction (`bg-${color}-500`) — Tailwind purges these
- Don't add framer-motion animations — keep animations CSS-based
- Don't expose infrastructure provider names (CyberPanel, Cloudways, Namecheap) to end users in the UI — NETHOST is the brand
- Don't merge the marketing site and portal app into a single Vite project
- Don't use `create-payment-intent` Edge Function — it's unused; use `create-subscription` instead
- Don't use `CardElement` from Stripe — use `PaymentElement` (switched for proper billing address / AVS handling)
- Don't use `sshpass` for VPS operations — SSH key auth is configured (`~/.ssh/nethost_vps`)
- Don't store sensitive secrets (keys, passwords) in CLAUDE.md or memory files
- Don't use HTML entities like `&#10003;` in Elementor text-editor HTML — use Unicode chars directly (`✓`)
- Don't put `background_color` on a container without also setting `background_background: 'classic'` — the color won't render
- Don't use `json_decode` → modify array → `wp_json_encode` → `update_post_meta` to patch existing Elementor page data — any `"` in replacement HTML (quotes in copy, attribute values, etc.) will corrupt the JSON and break the page. Rebuild pages from scratch instead.
- Don't try to update Elementor widget copy via find-replace on the decoded PHP array (`walk_update()` pattern) — it is fragile and caused the Home + Contact page corruption incident. Always write a complete fresh build script for any page that needs copy changes.

---

## Pending / Future Work

- [ ] Add test Supabase secrets for local test mode: `STRIPE_SECRET_KEY_TEST`, `STRIPE_PRICE_STARTER_TEST`, `STRIPE_PRICE_BUSINESS_TEST`, `STRIPE_PRICE_PRO_TEST`
- [ ] Dedicated IP as a Pro differentiator — requires Cloudways provisioning changes; not yet implemented
- [ ] Automated site cleanup on cancellation — delete from CyberPanel/Cloudways after billing period ends; currently manual
- [ ] Cloudways multi-server strategy — all Business/Pro customers share one server; need plan for when to add a second
- [x] Set `CLOUDWAYS_TEMPLATE_APP_ID` in Supabase Edge Function secrets — superseded by per-template IDs below
- [x] Email SMTP for Starter sites — Postfix on CyberPanel VPS configured to relay all outgoing mail through Resend (`smtp.resend.com:587`, from `hello@nethost.co`); credentials in `/etc/postfix/sasl_passwd`; applies automatically to all VPS-hosted WP sites with no per-site config needed
- [x] UpdraftPlus configured on all 4 VPS template sites — weekly backups to Backblaze B2 (`nethost-backups` bucket, S3-Compatible endpoint, path prefix `updraftplus/[domain]`)
- [ ] Template site: swap placeholder split-section image on Services page with a generated/custom photo (see prompt in `vps-files/build-services.php` comments)
- [x] Set `CLOUDWAYS_TEMPLATE_APP_ID_BOLD`, `_MINIMAL`, `_CORPORATE` in Supabase secrets — confirmed set 2026-05-24
- [x] All 4 Starter template sites built and live on VPS
- [x] ~~BROKEN: Home (ID 18) / Contact (ID 138) pages~~ — RESOLVED (2026-07-20): the template site was rebuilt with a fresh page set, so the corrupted old pages no longer exist. Current pages 762–767 verified healthy; trashed leftover duplicate Services (142) and moved the real Services (765) to the clean `/services` slug. Old IDs 18/137/138/142/165/168/169 are obsolete (18 turned out to be a live `nav_menu_item`, not a page). See the updated Page IDs table.
- [x] Services (ID 142) and About (ID 137) — fully rebuilt, working correctly
- [x] Footer updated — widget areas 7 + 8 updated, copyright text cleaned
- [x] MU plugin deployed
- [x] Enable Cloudways SMTP addon on nethost-business server — configured with Resend SMTP (smtp.resend.com, port 587, username: resend, dedicated `cloudways-smtp` API key). All Business/Pro WordPress sites can now send email.
- [x] Clean up stale Stripe webhooks — removed DFP WooCommerce endpoint and link-spark endpoint

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
- [x] Live site status dots on dashboard — green/amber/red per SiteCard (useSiteStatus hook, no-cors fetch, 8s timeout, skipped for provisioning + DNS-pending orders)
- [x] Stripe webhook fixed: NETHOST-SignUp endpoint now points to correct Supabase project; deployed with --no-verify-jwt; status values aligned ('cancelled'/'past_due') across webhook + cancel-subscription + Dashboard
- [x] Services page live at /services — 4 service categories (branding, web, marketing, AI/automation); linked from AdditionalServices on homepage; each service has full section with "What's Included" card
- [x] SEO pass completed: per-page document.title for all routes; sitemap.xml updated with /services, /terms, /privacy; heading hierarchy verified (h1→h2→h3); all images have alt tags; index.html has full OG/Twitter/JSON-LD
- [x] Security audit: no hardcoded secrets in frontend; PHP proxy CORS locked to app.nethost.co; RLS active; authenticated endpoints use JWT. Note: create-subscription and provision-hosting accept anon-key requests (by design — actual protection is Stripe payment + RLS). Recommendation: add Stripe subscription status check in provision-hosting before provisioning infrastructure.
- [x] WordPress hardening: MU plugin deployed to all 4 VPS + 3 Cloudways template sites (security headers, REST API lockdown, author redirect, DISALLOW_FILE_EDIT); OLS-compatible .htaccess rules on VPS; readme.html + license.txt deleted from Cloudways apps; Cloudflare security_headers snippet live; Wordfence installed on VPS template sites; api.nethost.co webroot hardened
- [x] Plugin vuln patch (2026-07): Elementor ≤4.1.3 (sensitive-data-exposure) + LatePoint ≤5.6.3 (unauth SQLi + priv-esc + IDOR; Patchstack/Cloudways alert). **Fully remediated across the whole fleet → Elementor 4.1.5, LatePoint 5.6.9.** All 4 VPS template sites patched via WP-CLI (template-minimal + template-corporate run LatePoint); all 3 Cloudways template apps (Corporate/Bold/Minimal) patched via WP admin. LatePoint file snapshots at /root/nethost-backups/plugin-snapshots/. markitang.com test app confirmed deleted; no client sites exist → no clone propagation. (WP-CLI DB ops on VPS require lsphp83 — system php CLI lacks mysqli.)
- [x] VPS security hardening (2026-07-20): box was wide open (no firewall, root+password SSH, public CyberPanel 8090 / OLS 7080 / WebSSH 8888 / FTP 21). Fixed → SSH key-only + fail2ban, disabled WebSSH+FTP, Hostinger cloud firewall (id 331984) default-drop with admin panels locked to the admin IP. Verified from external nodes. Details under Security Notes → "VPS / Host-Level Hardening".
- [x] Stripe stale test-mode webhook removed (2026-07-20): recurring "webhook delivery issues [test mode]" emails came from an orphaned **Test-mode** endpoint pointing to the **Permiana** Supabase project (`ptxrxekttwxpmmylccal`, a separate app), not NETHOST (`qsvwdemwttwrqgvsonql`). Deleted from Stripe's Test-mode webhook list; live `NETHOST-SignUp` endpoint unaffected. Root cause it recurred: Stripe's Test and Live webhook lists are separate and prior cleanups only touched Live.
- [x] Backup pipeline fixed (2026-07-20): `nethost-backup.sh` had no retention → daily dated folders filled the B2 free-tier cap ~June 13, silently blocking all uploads for ~5 weeks. Added keep-newest-14 retention; confirmed B2 lifecycle rule (keep-only-last-version); reclaimed 308 stale versions (~3.5 GB) via B2 native API for immediate unblock; verified fresh backup uploads + retention aging. Steady state ~6.9 GB → free tier ($0). Details in the Backups gotcha note above.
