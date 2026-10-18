# Form Atlas Atelier

A private, editable design-reference library with 865 complete saved prompts, local previews, and 52 MIT source-code studies. It runs offline without installing packages.

Extract the whole archive and open **START_HERE.html**. For a local browser server:

```bash
python3 serve.py
```

Open http://127.0.0.1:8765. Videos play on request. Copy actions include an exact-text fallback when browser clipboard access is blocked.

## Edit and rebuild

`data/library.json` is the catalog. `builder/template.html`, `builder/ui.css`, `builder/base.css`, and `builder/app.js` define the interface. Complete source prompts and media live in their named folders.

```bash
python3 builder/build.py
python3 builder/verify.py
node builder/export_static.cjs
```

Commit the source, generated HTML/catalogs, and checksum manifest together. `dist/` is generated and ignored by git. The web export rejects stale builds so interface or data edits cannot silently deploy an older page. No npm dependencies or environment secrets are needed for the app or its production build.

The hosted entry is optimized separately: it contains catalog metadata, with complete prompts, source code and demonstrations fetched only when opened. Full-prompt search is loaded on the first search. The standalone `START_HERE.html` still embeds all complete content for offline use. Content-hashed hosted reference files are immutable; entry pages revalidate, and media can be reused from the browser cache.

Bloom uses continuous 24 fps motion from the original footage, with a lighter 720p mobile rendition and 1080p desktop rendition. Muted inline autoplay is attempted only while the feature is visible. Browser restrictions receive a clear tap-to-play fallback; reduced motion and explicit pause choices are respected.

Regression checks after exporting:

```bash
node --test builder/test_*.cjs
```

Optional browser QA (Playwright is a separate testing dependency, not part of the site): `node builder/check_bloom_preview.cjs <chrome-path> <external-evidence-directory>`. Set `ATLAS_WEBKIT=1` with the matching Playwright WebKit browser installed to include WebKit mobile checks. Physical iPhone Low Power Mode is not emulated by these tests.

For a checked download ZIP, write outside this project folder:

```bash
python3 builder/build.py --output ../FORM_ATLAS_SOURCE_MEDIA_EDITION.zip
```

See **README_FIRST.md** for access counts and preview limits, **SOURCE_AUDIT/README.md** for source verification, and **HOSTING.md** for Vercel import settings.
