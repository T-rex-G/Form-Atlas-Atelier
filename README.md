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

Commit the source, generated HTML/catalogs, and checksum manifest together. `dist/` is generated and ignored by git. The web export rejects stale builds so interface or data edits cannot silently deploy an older page. No npm dependencies or environment secrets are needed.

For a checked download ZIP, write outside this project folder:

```bash
python3 builder/build.py --output ../FORM_ATLAS_SOURCE_MEDIA_EDITION.zip
```

See **README_FIRST.md** for the current access counts and preview limits, **SOURCE_AUDIT/README.md** for source verification, and **HOSTING.md** for Vercel import settings. No Vercel deployment has been created or tested by this package.
