# Keep the atlas growing

## Phone-friendly additions

In Add reference, paste a full prompt or select a Markdown file. Attach your own or properly licensed image and MP4/WebM. Add the reference, export a backup, and keep the ZIP somewhere you control. Restore it on another device from the same dialog. Avoid editing exported backup ZIPs before a browser restore: the browser reads the uncompressed format emitted by the app.

## Permanent additions by hand

Use the app to create an update ZIP, then apply it with the Python builder. Alternatively, add your own Markdown under PROMPTS/08-Personal, an image under IMAGES, and an optional video under VIDEO. Add an object to data/library.json using this shape, then run `python3 builder/build.py`:

```json
{
  "id": "user-my-reference-2026",
  "title": "My reference",
  "category": "Personal",
  "collection": "08-Personal",
  "prompt_file": "PROMPTS/08-Personal/my-reference.md",
  "visual": "IMAGES/my-reference.webp",
  "visual_type": "user-supplied",
  "tags": ["minimal", "motion"],
  "chars": 1000,
  "video": "VIDEO/my-reference.mp4",
  "duration": 8.2,
  "media_role": "preview",
  "media_status": "personal"
}
```

Use unique IDs. Use paths inside the archive, no absolute paths or `..`. Omit `video` when no matching video exists. `duration` is seconds. Use media_role `background` for footage that is an ingredient rather than a recording of the whole design. The app's My references view shows browser-added entries; permanently rebuilt entries appear under All references and their Personal collection metadata.

## Brief for an AI assistant or scraper

> Extend Form Atlas without changing existing IDs or overwriting its content. Inspect data/library.json and MEDIA_PROVENANCE.json first. Only collect public material you are authorized to retain. Preserve source title, provider name, author/license information where available, retrieval date and media role. Download actual media bytes; validate MIME type, file integrity, codec and visible frame changes. Do not substitute unrelated generic clips, background footage or camera movement over a still for a matching design animation. Mark absent or inaccessible media honestly. Put prompts, local images and permitted videos in the existing folders, use unique user- IDs, update the catalog, and rebuild with builder/build.py. Test offline, phone-width layout, real playback, search and detail transitions. Keep third-party executable code outside the app and do not add CDN dependencies.

## Backup update-pack schema

`patch.json` contains `{ "app": "FORM", "schema_version": 3, "entries": [...] }`. Entries use the same fields as above for id/title/category/tags/prompt_file/visual/video; referenced files live in the ZIP. The browser and Python builder accept at most 500 entries and 200 MB per pack; each prompt is at most 2 MB, image 5 MB and video 25 MB. The Python builder also accepts ZIP compression; browser restoration reads the stored-entry format emitted by the app. Duplicate IDs are skipped in browser restoration and rejected by the permanent builder.
