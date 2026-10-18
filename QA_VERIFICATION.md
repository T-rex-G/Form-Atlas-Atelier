# Verification — Source Media Edition

Access and application follow-up checked 18 October 2026. Media decoding and recovery checks from 17 October are retained because every source/media byte is unchanged.

| Check | Result |
| --- | --- |
| IDs and complete prompt bytes | PASS · 865/865 preserved against supplied Atelier |
| Code, license and demo bytes | PASS · unchanged |
| Referenced files and still-image decoding | PASS · no missing/invalid or animated browsing images |
| Full MP4 decoding | PASS · 478 unique videos |
| Generic HorizonX fallback cluster | PASS · zero remaining |
| False design reconstructions | PASS · zero presented as source previews |
| Offline render and external requests | PASS · meaningful render, zero external runtime requests |
| Runtime errors and framework overlays | PASS · none observed |
| Desktop / phone layouts | PASS · 1536×1024, 390×844, 320×844; no horizontal page overflow |
| Source playback and Full image | PASS · real playback, native dimensions, close unloads media |
| Clipboard allowed / denied | PASS · exact prompt and code text; denial exposes exact selectable fallback |
| Personal state | PASS · notes, bookmarks and references survive reload; backup ZIP exported |
| Access labels | PASS · 423 free or limited-free / 332 paid source or membership / 110 unverified current access |
| Access explanations, name collisions and source filters | PASS · 80 rendered checks including native prompt/code clipboard and denied fallback |
| Source/media preservation against supplied Source Media Edition | PASS · all 2,908 source/media files unchanged, including all 865 complete prompts |
| Web export | PASS · root app, local assets and native clipboard tested; stale manifest rejected |

The target flow was: offline app → matched reference → full-resolution still / manual real-source video → close and unload. The mobile drawer fits the viewport and makes the workspace inert behind it; Copy remains visible. Native clipboard and IndexedDB tests used the included local server on 127.0.0.1. Browser plugin was unavailable; Playwright with Chromium 153 was used.

The verified baseline passed 28 rendered-app assertions and 10 native clipboard/personal-library assertions. The media follow-up additionally passed 76 checks of every changed reference, native-resolution images, all four added clips, exact prompt copying with mismatch notices, and mobile layouts. Unchanged video bytes reuse prior successful decoding results; every new clip was fully decoded and sampled for actual frame changes. Representative source previews and source-provider contact sheets were visually reviewed; this is not a claim that every prompt has been manually compared against every pixel of the current publisher revision.

The access follow-up passed 80 checks in Chrome for Testing 155 at desktop, 390px and 320px widths, with zero external runtime requests or JavaScript errors. Access explanations were checked across paid membership, public prompts, limited copies, archived flags and unresolved identities. A signed-in or actual Vercel deployment was not tested. GitHub repository permissions remain an external delivery requirement.

Remaining limits: 110 entries without an exact current access match; 8 explicitly unavailable source previews; two archived prompt/preview mismatches visibly disclosed; placeholder photos within two publisher drafts; archived-source entries not newly publisher-confirmed; actual iOS Safari / Files / Quick Look and all third-party HTML viewers untested. Public asset access does not establish redistribution or design-ownership rights. Sources that return access errors are not bypassed.

The ZIP is built atomically with standard DEFLATE, CRC checks, full extraction and per-file SHA-256 verification. Saved-delivery bytes are checked again before handoff.
