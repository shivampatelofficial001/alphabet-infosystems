# Alphabet Infosystems — Migration Status

**Company:** Alphabet Infosystems  
**Tagline:** Delivering dependable software solutions.  
**Working Branch:** `migration`  
**Default Branch:** `main` (protected — do not modify without approval)  
**Target Stack:** Eleventy (11ty) + Nunjucks + Decap CMS + Cloudflare Pages  

---

## Phase Overview

- [x] **Phase 0 — Existing Website Audit**
- [x] **Phase 1 — Eleventy Foundation**
- [x] **Phase 2 — Multi-Page Conversion**
- [x] **Phase 3 — Clean URL Architecture**
- [x] **Phase 4 — Blog and Decap CMS**
- [x] **Phase 5 — Backend and Integrations**
  - Audited `server/form-worker.js`, verified 15/15 `test-worker.mjs` checks, updated `wrangler.toml` `ALLOWED_ORIGINS` (`6f5f4f6`).

- [/] **Phase 6 — SEO, Security and Quality Assurance**
  - [x] Create dynamic `src/sitemap.njk` (`/sitemap.xml`)
  - [x] Update `robots.txt` and `llms.txt` for multi-page URLs and add passthrough copy in `eleventy.config.js`
  - [x] Update `_headers` with strict public CSP and `/admin/*` Decap CMS CSP + `X-Robots-Tag`
  - [x] Add `Article` and `BreadcrumbList` JSON-LD to `src/_includes/layouts/post.njk`
  - [ ] Upload Phase 6 files to `migration` branch and verify `_site/sitemap.xml`, `_site/robots.txt`, `_site/llms.txt`

- [ ] **Phase 7 — Cloudflare Deployment**
