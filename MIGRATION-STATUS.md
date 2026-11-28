# Alphabet Infosystems — Migration Status

**Company:** Alphabet Infosystems  
**Tagline:** Delivering dependable software solutions.  
**Working Branch:** `migration`  
**Default Branch:** `main` (protected — do not modify without approval)  
**Target Stack:** Eleventy (11ty) + Nunjucks + Decap CMS + Cloudflare Pages  

---

## Phase Overview

- [ ] **Phase 0 — Existing Website Audit**
  - Inspect existing repository files (`index.html`, `case-study-geetva.html`, `style.css`, `script.js`, `assets/`, `form-worker.js`, `wrangler.toml`, `_headers`, `sitemap.xml`, `robots.txt`, `llms.txt`).
  - Document existing sections, animations, Alpha Assist chatbot, WhatsApp integration, and Formspree/Worker configuration.

- [/] **Phase 1 — Eleventy Foundation**
  - [x] Prepare `package.json`
  - [x] Prepare `eleventy.config.js`
  - [x] Prepare `.gitignore`
  - [x] Prepare `MIGRATION-STATUS.md`
  - [ ] Upload and commit Phase 1 files to the `migration` branch
  - [ ] Create `src/` directory and verify initial Eleventy build (`_site/`)

- [ ] **Phase 2 — Multi-Page Conversion**
- [ ] **Phase 3 — Clean URL Architecture**
- [ ] **Phase 4 — Blog and Decap CMS**
- [ ] **Phase 5 — Backend and Integrations**
- [ ] **Phase 6 — SEO, Security and Quality Assurance**
- [ ] **Phase 7 — Cloudflare Deployment**

---

## Phase 1 Foundation Files

1. `package.json` — Defines `@11ty/eleventy` dependency and build scripts (`build`, `start`, `clean`).
2. `eleventy.config.js` — Configures `src/` input, `_site/` output, Nunjucks templates, and passthrough copy for `assets/`, `style.css`, and `script.js`.
3. `.gitignore` — Excludes `node_modules/`, `_site/`, `.wrangler/`, `.DS_Store`, and `Thumbs.db` from Git tracking.
4. `MIGRATION-STATUS.md` — Tracks migration progress across all phases.
