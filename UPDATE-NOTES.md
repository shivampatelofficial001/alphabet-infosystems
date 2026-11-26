# Update notes — 26 Nov 2026
- website/_headers, .htaccess: 404.html inline-script hash corrected; 'unsafe-inline' removed from style-src.
- website/style.css: .wa-logo icon colour #072716 (contrast 8.08:1); .step-kicker 0.75rem.
- website/script.js: feedback carousel respects prefers-reduced-motion; Left/Right arrow keys on dots; padStart counter.
- tools/build-single-file.py: case-study link replacement moved before JS embedding. Single-file HTML rebuilt.
- server/test-worker.mjs: Node 18 crypto polyfill; server/package.json: engines + "test" script.
- assets: logo/icon SVG path precision reduced (~27% smaller); icon-192.png and icon-512.png added to site.webmanifest.
Still open (needs hosting/network): security headers on GitHub Pages, Worker deploy, self-hosted fonts, minification, Geetva live URL.
