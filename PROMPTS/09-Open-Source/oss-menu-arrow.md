# Arrow Menu Toggle

Use the bundled Hamburgers component to build a responsive, accessible interface. An animated menu-to-close toggle using the upstream arrow transition. Click the live preview to change its state.

## Included source

- Source: `CODE/oss-menu-arrow.css`
- Runnable local demonstration: `DEMOS/oss-menu-arrow.html`
- License: MIT; retain the copyright and permission notice in `SOURCE/hamburgers/LICENSE`.
- Upstream revision: `b26b25f8c70d1412a73a0bf046c980710843dfca`.

## Build instructions

Read the original source file before adapting it. Preserve the component’s behavior and public API. The preview is a local demonstration of the actual code, with a Form Atlas wrapper; it is not a screenshot of the upstream site. Keep controls keyboard accessible, provide visible focus, and respect reduced-motion preferences. Use the preview to study behavior; remove the demonstration wrapper when integrating into your project.

## Verification

Check the component at phone and desktop widths, inspect its interaction or animation, and confirm that removing network access does not break the local demonstration.

## Dependencies

A modern browser. No JavaScript package or remote service is required.

## Component source

```css
/*
The MIT License (MIT)

Copyright (c) 2016 Jonathan Suh <hello@jonsuh.com> (jonsuh.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*!
 * Hamburgers
 * @description Tasty CSS-animated hamburgers
 * @author Jonathan Suh @jonsuh
 * @site https://jonsuh.com/hamburgers
 * @link https://github.com/jonsuh/hamburgers
 */
.hamburger {
  padding: 15px 15px;
  display: inline-block;
  cursor: pointer;
  transition-property: opacity, filter;
  transition-duration: 0.15s;
  transition-timing-function: linear;
  font: inherit;
  color: inherit;
  text-transform: none;
  background-color: transparent;
  border: 0;
  margin: 0;
  overflow: visible; }
  .hamburger:hover {
    opacity: 0.7; }
  .hamburger.is-active:hover {
    opacity: 0.7; }
  .hamburger.is-active .hamburger-inner,
  .hamburger.is-active .hamburger-inner::before,
  .hamburger.is-active .hamburger-inner::after {
    background-color: #000; }

.hamburger-box {
  width: 40px;
  height: 24px;
  display: inline-block;
  position: relative; }

.hamburger-inner {
  display: block;
  top: 50%;
  margin-top: -2px; }
  .hamburger-inner, .hamburger-inner::before, .hamburger-inner::after {
    width: 40px;
    height: 4px;
    background-color: #000;
    border-radius: 4px;
    position: absolute;
    transition-property: transform;
    transition-duration: 0.15s;
    transition-timing-function: ease; }
  .hamburger-inner::before, .hamburger-inner::after {
    content: "";
    display: block; }
  .hamburger-inner::before {
    top: -10px; }
  .hamburger-inner::after {
    bottom: -10px; }

/*
   * Arrow
   */
.hamburger--arrow.is-active .hamburger-inner::before {
  transform: translate3d(-8px, 0, 0) rotate(-45deg) scale(0.7, 1); }

.hamburger--arrow.is-active .hamburger-inner::after {
  transform: translate3d(-8px, 0, 0) rotate(45deg) scale(0.7, 1); }


```

## Required markup

```html
<button class="hamburger hamburger--arrow" type="button" aria-label="Toggle navigation" aria-expanded="false"><span class="hamburger-box"><span class="hamburger-inner"></span></span></button>
```

Toggle the is-active class and aria-expanded value on click. The bundled demo includes the interaction.
