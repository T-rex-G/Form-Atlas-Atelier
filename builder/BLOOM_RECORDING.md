# Bloom's saved-code recording

Bloom's Discovery feature and reference 57 use `VIDEO/bloom-code-render-1080p.mp4`, a local recording of the complete saved HTML in `PROMPTS/01-Landing-and-Sections/057-bl.md`. The original prompt and all previous publisher previews remain unchanged. The new still is `FULL_IMAGES/bloom-code-render.webp`.

This is a real browser render at 1920 × 1080, 30 fps, not an upscaled publisher preview or an AI reconstruction. The three original 1920 × 1080, 24 fps botanical source clips are sought frame-exactly, with deliberately slower scroll progression and readable holds. The result is silent H.264, 32.5 seconds, with a 1.5-second wrap dissolve and adjacent original timeline frames at the loop boundary. Intentional blur transitions from the saved design remain; stationary text stays crisp.

`SOURCE_AUDIT/BLOOM_RENDER.json` records the source-prompt hash, original asset hashes, output hash and recording metadata. These describe provenance, not a new license or ownership claim.

## Optional reproduction

Normal Atlas builds still require no npm dependencies. Recording additionally requires Chrome, FFmpeg and Playwright 1.62.1 installed outside the repository. Point `NODE_PATH` to that installation's `node_modules`.

```bash
python3 builder/prepare_bloom_assets.py /tmp/bloom-inputs
node builder/render_bloom.cjs /tmp/bloom-inputs /tmp/bloom-render /usr/bin/google-chrome
```

The input helper checks every font/video hash and the original native video formats before recording. When a source host does not permit downloads, use already acquired local input files in that directory; do not bypass the host's restrictions. `render_bloom.cjs` modifies only an external render copy (font/media localization, deterministic scroll driver, and awaited seeks); it never writes to the source prompt.

After rebuilding and exporting the site, optional regression checks run with:

```bash
node builder/check_bloom_preview.cjs /usr/bin/google-chrome /tmp/bloom-qa
```

The browser check compares non-Bloom catalog records and protected content with `origin/main`, tests desktop/mobile playback and looping, and saves screenshots outside the repository. Use the pre-change main ref for that comparison when validating a release.
