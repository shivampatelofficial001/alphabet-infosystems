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
  - Reusable layouts, partials, 7 multi-page templates, and multi-page Alpha Assist verified (`a4c5175`).

- [/] **Phase 3 — Clean URL Architecture**
  - [x] Create `_redirects` for legacy `.html` URLs (`/case-study-geetva.html` -> `/work/geetva/`, etc.)
  - [x] Update `assets/site.webmanifest` to root-relative `start_url` and icon paths
  - [x] Update `eleventy.config.js` to passthrough copy `_redirects` and `_headers`
  - [x] Audit all `src/` templates for root-relative asset paths and clean trailing-slash links
  - [ ] Upload Phase 3 files to `migration` branch and verify `_site/` output

- [ ] **Phase 4 — Blog and Decap CMS**
- [ ] **Phase 5 — Backend and Integrations**
- [ ] **Phase 6 — SEO, Security and Quality Assurance**
- [ ] **Phase 7 — Cloudflare Deployment**
