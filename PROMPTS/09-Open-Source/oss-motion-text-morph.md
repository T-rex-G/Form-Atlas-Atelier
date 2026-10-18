# Text Morph

Use the bundled Motion Primitives component to build a responsive, accessible interface. A local, interactive study of the original Motion Primitives Text Morph component. React source is included separately from the standalone preview.

## Included source

- Source: `CODE/oss-motion-text-morph.tsx`
- Runnable local demonstration: `DEMOS/oss-motion-text-morph.html`
- License: MIT; retain the copyright and permission notice in `SOURCE/motion-primitives/LICENCE.md`.
- Upstream revision: `120f64f6ca60348e251f929e9c81f11ccbe45eda`.

## Build instructions

Read the original source file before adapting it. Preserve the component’s behavior and public API. The preview is a local demonstration of the actual code, with a Form Atlas wrapper; it is not a screenshot of the upstream site. Keep controls keyboard accessible, provide visible focus, and respect reduced-motion preferences. Use the preview to study behavior; remove the demonstration wrapper when integrating into your project.

## Verification

Check the component at phone and desktop widths, inspect its interaction or animation, and confirm that removing network access does not break the local demonstration.

## Dependencies

React, TypeScript, Tailwind CSS, motion, clsx and tailwind-merge. Configure the @ alias and include SOURCE/motion-primitives/lib/utils.ts.

## Component source

```tsx
/*
MIT License

Copyright (c) 2024 ibelick

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
app/page.tsx

*/

'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion, Transition, Variants } from 'motion/react';
import { useMemo, useId } from 'react';

export type TextMorphProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  variants?: Variants;
  transition?: Transition;
};

export function TextMorph({
  children,
  as: Component = 'p',
  className,
  style,
  variants,
  transition,
}: TextMorphProps) {
  const uniqueId = useId();

  const characters = useMemo(() => {
    const charCounts: Record<string, number> = {};

    return children.split('').map((char) => {
      const lowerChar = char.toLowerCase();
      charCounts[lowerChar] = (charCounts[lowerChar] || 0) + 1;

      return {
        id: `${uniqueId}-${lowerChar}${charCounts[lowerChar]}`,
        label: char === ' ' ? '\u00A0' : char,
      };
    });
  }, [children, uniqueId]);

  const defaultVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const defaultTransition: Transition = {
    type: 'spring',
    stiffness: 280,
    damping: 18,
    mass: 0.3,
  };

  return (
    <Component className={cn(className)} aria-label={children} style={style}>
      <AnimatePresence mode='popLayout' initial={false}>
        {characters.map((character) => (
          <motion.span
            key={character.id}
            layoutId={character.id}
            className='inline-block'
            aria-hidden='true'
            initial='initial'
            animate='animate'
            exit='exit'
            variants={variants || defaultVariants}
            transition={transition || defaultTransition}
          >
            {character.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </Component>
  );
}

```

## Shared utility

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```
