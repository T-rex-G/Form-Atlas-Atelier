# Gradient Pattern 103

Use the bundled CSS Pattern component to build a responsive, accessible interface. A scalable background constructed entirely from CSS gradients and custom properties.

## Included source

- Source: `CODE/oss-pattern-103.css`
- Runnable local demonstration: `DEMOS/oss-pattern-103.html`
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
  --s: 50px; /* control the size */
  
  --c:calc(50%/3),#0000 75%,#5E412F 0; /* 1st color */
  --g:conic-gradient(at 50% var(--c));
  --l:conic-gradient(at var(--c));
  background:
    var(--g),
    var(--g) calc(var(--s)/2) var(--s),
    var(--g) var(--s) calc(2*var(--s)),
    var(--l) calc(2*var(--s)) 0,
    var(--l) 0 var(--s) #CCC68D; /* 2nd color */
  background-size: calc(3*var(--s)) calc(3*var(--s));
}

```

Apply this stylesheet to the html element. The preview preserves the upstream gradient construction. Customize the color and size variables rather than introducing an image dependency.
