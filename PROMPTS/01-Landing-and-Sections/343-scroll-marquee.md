---

**Prompt:**

Create a scroll-driven image marquee section using React, Tailwind CSS, and vanilla JS scroll events (no libraries needed for the marquee itself). The site uses the **Google Font "Kanit"** (weights 300-900) and a dark background color `#0C0C0C`. This section sits directly below a full-screen hero section.

**Section layout:**
- Full-width section with `overflow: hidden`, dark background `#0C0C0C`
- Padding: `pt-24 sm:pt-32 md:pt-40 pb-10`
- Contains two horizontal rows of images stacked vertically with a `gap-3` (12px) between them

**Row 1 images (11 images), scrolls RIGHT as user scrolls down:**
```
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
```

**Row 2 images (10 images), scrolls LEFT as user scrolls down (opposite direction):**
```
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
[local visual reference]
```

**Image cards:**
- Each image card is exactly `420px wide x 270px tall`
- `flex-shrink-0` so they never collapse
- `rounded-2xl` (16px border radius) with `overflow: hidden`
- Images use `object-cover` to fill the container, with `loading="lazy"`
- `gap-3` (12px) between cards horizontally

**Scroll-driven parallax animation (vanilla JS, not CSS animation):**
- Each row's image array is tripled (`[...ROW, ...ROW, ...ROW]`) to create enough content for continuous scrolling appearance
- On every scroll event (passive listener), calculate offset:
1. Get the section's bounding rect top relative to the document
2. `scrolled = window.scrollY - sectionTop + window.innerHeight`
3. `offset = scrolled * 0.3` (parallax factor of 0.3)
- Row 1: `transform: translateX(${offset - 200}px)` -- moves right as user scrolls
- Row 2: `transform: translateX(${-(offset - 200)}px)` -- moves left as user scrolls
- Initial transform: Row 1 starts at `translateX(-200px)`, Row 2 starts at `translateX(200px)`
- Use `willChange: 'transform'` for GPU acceleration
- Apply transforms directly via refs (not state) for 60fps performance
- Use `{ passive: true }` on the scroll listener
- Run the handler once on mount to set initial position
- Clean up the listener on unmount

**Technical details:**
- React functional component using `useRef` and `useEffect`
- No framer-motion or animation library needed for this section
- Rows are built with flexbox (`flex gap-3`)
- Each row is wrapped in an `overflow-hidden w-full` container
- The outer section also has `overflow-hidden` and `w-full`
- All images have empty `alt=""` since they are decorative

**Font (loaded in HTML head):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
```

CSS base: `font-family: 'Kanit', sans-serif` on html/body.

---