# CLAUDE.md — Forge Cleaning & Property Services website

Guidance for Claude Code when working in this repo.

## What this is
The marketing website for **Forge Cleaning & Property Services** (Jacksonville, FL).
Owner/contact: **Mike** — (904) 469-7439 · mike@forgecleaningandpropertyservices.com

Single-page static site, no build step or framework:
- `index.html` — all page content/structure
- `styles.css` — the entire design system + styles
- `main.js` — nav, scroll reveal, FAQ accordion, contact-form submit
- `api/contact.js` — Vercel serverless function; emails the quote form via Resend
- `forge-logo.png` / `forge-mark.png` — brand logo (hero/footer, and nav mark)

## How to preview locally
Any static server works, e.g. `python3 -m http.server 4321` then open http://localhost:4321.
The contact form needs the serverless function, so to test the form locally use `npx vercel dev`
(requires a `.env.local` with `RESEND_API_KEY` — see `.env.example`).

## How it deploys
Hosted on **Vercel**, connected to this GitHub repo. **Every push to `main` auto-deploys.**
There is no manual deploy step — commit and push, and the live site updates in ~1 minute.
Live URL: https://forgecleaningandproperty.vercel.app (custom domain
forgecleaningandpropertyservices.com may be pointed at it via Porkbun DNS).

## Design direction (keep consistent)
Dark "forge & stone" theme pulled from the logo:
- Black background, charcoal-stone surfaces, subtle stone grain
- **Forged gold** accent `#C6A15B` (the "FORGE" lettering color)
- **Stone-textured grey** tactile buttons (bevel + hover lift + press-down)
- Fonts: Fraunces (headings) + Inter (body). All tokens are CSS variables at the top of `styles.css`.
- Client prefers it lean and professional — confirm before adding big new marketing sections.

## The contact form
Posts to `/api/contact`, which sends the quote request to Mike via Resend.
Requires the `RESEND_API_KEY` environment variable **in Vercel** (Settings → Environment Variables,
Production scope). After changing any env var you must **redeploy** for it to take effect.

## ⚠️ Do not touch the domain's email DNS
`forgecleaningandpropertyservices.com` runs **Microsoft 365 email** (mike@…). If editing DNS at
Porkbun to point the site at Vercel, only change the website records (apex `A` → Vercel IP, and the
`www` CNAME). Never remove/alter the `MX`, `autodiscover`, or Microsoft `TXT` (SPF / `MS=…`) records —
doing so breaks Mike's email.

## Editing tips
- Text, services, phone/email, and section content are all in `index.html`.
- Colors/fonts/spacing: the `:root` variables in `styles.css`.
- To use real job photos, replace the hero `<img class="hero-logo">` or add an image where noted.
- Keep it accessible (labels, alt text, focus states) and responsive (test mobile width).
