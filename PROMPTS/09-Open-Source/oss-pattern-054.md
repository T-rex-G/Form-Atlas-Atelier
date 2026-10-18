# Gradient Pattern 54

Use the bundled CSS Pattern component to build a responsive, accessible interface. A scalable background constructed entirely from CSS gradients and custom properties.

## Included source

- Source: `CODE/oss-pattern-054.css`
- Runnable local demonstration: `DEMOS/oss-pattern-054.html`
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
  --r: 56px; /* control the size */
  --c1: #3FB8AF /*color 1*/ 99%,#0000 101%;
  --c2: #FF9E9D /*color 2*/ 99%,#0000 101%;
  
  --s:calc(var(--r)*.866);  /* .866 = cos(30deg) */
  --g0:radial-gradient(var(--r),var(--c1));
  --g1:radial-gradient(var(--r),var(--c2));
  --f:radial-gradient(var(--r) at calc(100% + var(--s)) 50%,var(--c1));
  --p:radial-gradient(var(--r) at 100% 50%,var(--c2));
  background:
    var(--f) 0 calc(-5*var(--r)/2),
    var(--f) calc(-2*var(--s)) calc(var(--r)/2),
    var(--p) 0 calc(-2*var(--r)),
    var(--g0) var(--s) calc(-5*var(--r)/2),
    var(--g1) var(--s) calc( 5*var(--r)/2),
    radial-gradient(var(--r) at 100% 100%,var(--c1)) 0 calc(-1*var(--r)),   
    radial-gradient(var(--r) at 0%   50% ,var(--c1)) 0 calc(-4*var(--r)),
    var(--g1) calc(-1*var(--s)) calc(-7*var(--r)/2),
    var(--g0) calc(-1*var(--s)) calc(-5*var(--r)/2),
    var(--p) calc(-2*var(--s)) var(--r),
    var(--g0) calc(-1*var(--s)) calc(var(--r)/ 2),
    var(--g1) calc(-1*var(--s)) calc(var(--r)/-2),
    var(--g0) 0 calc(-1*var(--r)),
    var(--g1) var(--s) calc(var(--r)/-2),
    var(--g0) var(--s) calc(var(--r)/ 2) 
    #FF9E9D; /*color 2 again here */
  background-size: calc(4*var(--s)) calc(6*var(--r));
}

```

Apply this stylesheet to the html element. The preview preserves the upstream gradient construction. Customize the color and size variables rather than introducing an image dependency.
