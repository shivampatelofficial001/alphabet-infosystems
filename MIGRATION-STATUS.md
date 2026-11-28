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
  - `_redirects`, root-relative `site.webmanifest`, and passthrough config verified (`bf72c4b`).

- [/] **Phase 4 — Blog and Decap CMS**
  - [x] Configure `posts` collection and date filters in `eleventy.config.js`
  - [x] Create `/blog/` listing page (`src/blog/index.njk`) and article layout (`src/_includes/layouts/post.njk`)
  - [x] Add Gujarati and English font/language support (`Noto Sans Gujarati` + `lang` attribute)
  - [x] Create `src/blog/posts/posts.json` and sample article `src/blog/posts/example-article.md`
  - [x] Configure Decap CMS (`admin/index.html`, `admin/config.yml`)
  - [x] Implement Cloudflare Pages Functions OAuth (`functions/api/auth.js`, `functions/api/callback.js`)
  - [x] Add Blog navigation link and minimal blog styling in `style.css`
  - [ ] Upload Phase 4 files to `migration` branch and verify Eleventy build (`_site/blog/`, `_site/admin/`)

- [ ] **Phase 5 — Backend and Integrations**
- [ ] **Phase 6 — SEO, Security and Quality Assurance**
- [ ] **Phase 7 — Cloudflare Deployment**
