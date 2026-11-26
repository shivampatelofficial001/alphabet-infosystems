# Security notes - Alphabet Infosystems website

Last updated: 2026-11-21. This site is a static website. It has no login, no database and no server code of its own, so some items in a typical security checklist do not apply. The table below says what was done and what was not, plainly.

## What is in place

| Area | What was done | Where |
|---|---|---|
| Content Security Policy | Only this site's own scripts run. Inline code is limited to one hashed line. Plugins and `<base>` tricks are blocked. Forms may post only to this site and Formspree. | `<meta>` in all 3 pages, plus `_headers` and `.htaccess` |
| Referrer policy | Only the site address (not the full page) is sent to other sites | `<meta name="referrer">` and headers |
| Form input | Length limits in the HTML, tags and control characters removed, email format checked, dropdown values checked against the real option list, message needs at least 10 characters | `script.js` (`FormGuard`) |
| Spam | Hidden trap field, 3-second minimum before sending, 45-second gap and 5 messages per hour per browser | `script.js` |
| XSS | No `innerHTML`, `eval` or `document.write` anywhere. Visitor text is only ever set as plain text. | `script.js` (checked by search) |
| External links | `rel="noopener"` on links that open a new tab | HTML |
| Secrets | No API keys in the website files. The Formspree address is a public form address, not a secret. | - |
| Server-side form handler (optional) | Origin check, JSON-only, size limit, full re-validation, hidden-field trap, rate limit per visitor address, plain-text email, secrets in Worker secrets, fails closed if not configured. 15 automated checks pass. | `server/` |
| HTTPS and headers | HSTS, nosniff, frame blocking, permissions policy, COOP | `_headers` (Netlify, Cloudflare Pages) or `.htaccess` (Apache) |

## Items that do not apply to this site

- **SQL injection, sessions, login, access control:** there is no database, no login and no session. Nothing to inject into or to log in to. If you add an admin area or a database later, these must be designed in from the start.
- **CSRF:** the contact form changes nothing on a logged-in account, because there are no accounts. The optional handler also accepts only JSON from an allowed origin, which a cross-site form cannot send.

## Read this: limits of what a static host can do

1. **GitHub Pages cannot send HTTP headers.** The CSP and referrer rules work through `<meta>` tags, but `frame-ancestors`, HSTS and `X-Frame-Options` only work as real headers. To get them, host on Netlify or Cloudflare Pages (use `_headers`) or Apache (`.htaccess`), or put Cloudflare in front of the domain. GitHub Pages already forces HTTPS.
2. **Browser-side limits can be bypassed.** Anyone can skip the page and post straight to Formspree. Formspree has its own spam filter and rate limit, but the strict server-side checks only exist if you deploy `server/form-worker.js` and set `secureEndpoint` in `script.js`.
3. **`style-src` allows inline styles** because the pages use `style` attributes and scripts set styles for animation. Inline scripts are not allowed, so this is a small gap.
4. **Fonts load from Google Fonts**, a third party. Self-hosting the three fonts would remove that dependency and let the CSP drop two Google addresses.
5. **The email address is public** (in the page and in structured data). Expect some spam to it. Nothing here can hide it from scrapers.
6. **Formspree free plan limits** apply to the current setup, and Formspree stores the messages on their servers.
7. **Rate limiting in the optional handler uses KV**, which is not atomic. A fast burst from one address could slip a message or two past the limit. For hard limits, add a Cloudflare rate-limiting rule on the route.
8. **No site can be called 100% hack-proof.** This reduces common risks. It is not a penetration test. Before launch, run a scan such as securityheaders.com and Mozilla Observatory on the live address.

## Turning on the server-side handler

1. `cd server`, then `npx wrangler kv namespace create RATE` and paste the id into `wrangler.toml`.
2. `npx wrangler secret put RESEND_API_KEY` and `npx wrangler secret put RATE_SALT` (any long random text).
3. Check `ALLOWED_ORIGINS`, `TO_EMAIL` and `FROM_EMAIL` in `wrangler.toml` (the sending domain must be verified at Resend).
4. `npx wrangler deploy`
5. In `script.js` set `secureEndpoint` to the deployed address ending in `/send`, and add that address to `connect-src` in the three pages and in `_headers` / `.htaccess`.
6. Run `node server/test-worker.mjs` to repeat the checks.

## Before launch checklist

- Verify the Formspree form and its email confirmation.
- Send a test message from a phone and from a laptop.
- Rotate any key that was ever pasted into a chat, file or screenshot.
