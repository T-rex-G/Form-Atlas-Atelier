# Gradient Pattern 08

Use the bundled CSS Pattern component to build a responsive, accessible interface. A scalable background constructed entirely from CSS gradients and custom properties.

## Included source

- Source: `CODE/oss-pattern-008.css`
- Runnable local demonstration: `DEMOS/oss-pattern-008.html`
- License: MIT; retain the copyright and permission notice in `SOURCE/CSS-Pattern/LICENCE`.
- Upstream revision: `66681684c1ca514328043b8ebd1407fe65830cc7`.

## Build instructions

Read the original source file before adapting it. Preserve the component’s behavior and public API. The preview is a local demonstration of the actual code, with a Form Atlas wrapper; it is not a screenshot of the upstream site. Keep controls keyboard accessible, provide visible focus, and respect reduced-motion preferences. Use the preview to study behavior; remove the demonstration wrapper when integrating into your project.

## Verification

Check the component at phone and desktop widths, inspect its interaction or animation, and confirm that removing network access does not break the local demonstration.

## Dependencies

A modern browser. No JavaScript package or remote service is required.

## Component source

```css
/*
MIT License

Copyright (c) 2022 Temani Afif

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/* Temani Afif — MIT. See LICENCE. */
html {
  --s: 100px; /* control the size */
  --c1: #4ECDC4;
  --c2: #556270;

  background: 
    linear-gradient(-26.56deg,var(--c1) 33%,var(--c2) 33.3% 66.6%,var(--c1) 67%) 
    0/var(--s) var(--s);
  /* 26.56deg = arctan(0.5) */
}

```

Apply this stylesheet to the html element. The preview preserves the upstream gradient construction. Customize the color and size variables rather than introducing an image dependency.
