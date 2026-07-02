# Forge Cleaning &amp; Property Services

Marketing website for **Forge Cleaning &amp; Property Services** — Jacksonville, FL.
A fast, single-page static site with a serverless "Request a Quote" form that emails Mike.

- **Phone:** (904) 469-7439
- **Email:** mike@forgecleaningandpropertyservices.com

## Stack

- Static `index.html` + `styles.css` + `main.js` (no build step, no framework)
- One Vercel serverless function at `api/contact.js` that sends quote requests via [Resend](https://resend.com)

## Project structure

```
index.html      # the whole site
styles.css      # design system + all styles
main.js         # nav, scroll reveal, FAQ, form submission
api/contact.js  # serverless endpoint that emails the quote request
vercel.json     # headers + clean URLs
package.json    # declares the `resend` dependency
.env.example    # environment variables to set
```

## The contact form (Resend setup)

The form posts to `/api/contact`, which emails the submission to Mike.

1. Create a free account at **https://resend.com** — sign up with **mike@forgecleaningandpropertyservices.com**
   (this lets emails send immediately, before any domain verification).
2. Go to **API Keys → Create API Key**, copy the key (starts with `re_`).
3. In Vercel: **Project → Settings → Environment Variables**, add:
   - `RESEND_API_KEY` = the key you copied
   - (optional) `TO_EMAIL` = `mike@forgecleaningandpropertyservices.com`
4. Redeploy. Submissions now arrive in Mike's inbox, and replying goes straight back to the customer.

> **Going pro (optional):** verify `forgecleaningandpropertyservices.com` in Resend (add the DNS records they give you),
> then set `FROM_EMAIL` to something like `Forge Website <quotes@forgecleaningandpropertyservices.com>`.

## Run locally

```bash
npm install
npx vercel dev      # runs the static site AND the /api function at http://localhost:3000
```

To test the form locally, create a `.env.local` from `.env.example` with a real `RESEND_API_KEY`.
(Opening `index.html` directly in a browser shows the site, but the form needs `vercel dev` to work.)

## Deploy

```bash
npx vercel          # preview deploy
npx vercel --prod   # production
```

Or connect the GitHub repo in the Vercel dashboard for automatic deploys on every push.

## Editing content

- **Text, services, contact info:** all in `index.html`.
- **Colors, fonts, spacing:** CSS variables at the top of `styles.css` (`:root`).
- **Hero image:** the right-side hero is a self-contained SVG illustration (`.hero-visual` in `index.html`).
  To use a real photo of a finished job, replace the `<div class="hero-art">…</div>` block with
  `<img src="your-photo.jpg" alt="…">` and drop the image next to `index.html`.
- **Testimonials:** the three reviews in the `#reviews` section are **placeholders**. Replace the
  `<blockquote>` text and `<figcaption>` with real customer reviews before relying on them.
