# BTDD V30.57 — ASARKAYA uygulama ikonu ve açılış

Text patch `BTDD_V30_57.patch` applies to the complete verified V30.56 package root. Before rebuilding, copy the five files in `assets/` to that package root, replacing `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png`; also add `asarkaya.ico` and `asarkaya-mark.svg`.

- Adds the ASARKAYA monogram to the Windows executable/setup icon, PWA and iPhone home-screen images.
- Adds an accessible startup screen that dismisses after data restoration; an independent 2.4-second timeout prevents it from blocking use if startup is slow.
- Selects the desktop shortcut by default during installation, removes only old BTDD shortcut links, and preserves BTDD receipt branding.
- Keeps BTDD executable, storage paths and synchronization identifiers unchanged.

Validation: icon format/dimension checks, splash fallback assertions, 53 frontend, product analytics/renderer, sales, assistant, sync, close-day/data-safety, table-alert, chart-geometry and static checks passed; text patch applies cleanly and ZIP integrity passed. No Windows build or real device/browser test is claimed. Main remains a README placeholder; this PR is a versioned patch/assets bundle.
