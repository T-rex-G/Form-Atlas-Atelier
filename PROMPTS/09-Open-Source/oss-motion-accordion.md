# Accordion

Use the bundled Motion Primitives component to build a responsive, accessible interface. A local, interactive study of the original Motion Primitives Accordion component. React source is included separately from the standalone preview.

## Included source

- Source: `CODE/oss-motion-accordion.tsx`
- Runnable local demonstration: `DEMOS/oss-motion-accordion.html`
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
import {
  motion,
  AnimatePresence,
  Transition,
  Variants,
  Variant,
  MotionConfig,
} from 'motion/react';
import { cn } from '@/lib/utils';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AccordionContextType = {
  expandedValue: React.Key | null;
  toggleItem: (value: React.Key) => void;
  variants?: { expanded: Variant; collapsed: Variant };
};

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionProvider');
  }
  return context;
}

export type AccordionProviderProps = {
  children: ReactNode;
  variants?: { expanded: Variant; collapsed: Variant };
  expandedValue?: React.Key | null;
  onValueChange?: (value: React.Key | null) => void;
};

function AccordionProvider({
  children,
  variants,
  expandedValue: externalExpandedValue,
  onValueChange,
}: AccordionProviderProps) {
  const [internalExpandedValue, setInternalExpandedValue] =
    useState<React.Key | null>(null);

  const expandedValue =
    externalExpandedValue !== undefined
      ? externalExpandedValue
      : internalExpandedValue;

  const toggleItem = (value: React.Key) => {
    const newValue = expandedValue === value ? null : value;
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalExpandedValue(newValue);
    }
  };

  return (
    <AccordionContext.Provider value={{ expandedValue, toggleItem, variants }}>
      {children}
    </AccordionContext.Provider>
  );
}

export type AccordionProps = {
  children: ReactNode;
  className?: string;
  transition?: Transition;
  variants?: { expanded: Variant; collapsed: Variant };
  expandedValue?: React.Key | null;
  onValueChange?: (value: React.Key | null) => void;
};

function Accordion({
  children,
  className,
  transition,
  variants,
  expandedValue,
  onValueChange,
}: AccordionProps) {
  return (
    <MotionConfig transition={transition}>
      <div className={cn('relative', className)} aria-orientation='vertical'>
        <AccordionProvider
          variants={variants}
          expandedValue={expandedValue}
          onValueChange={onValueChange}
        >
          {children}
        </AccordionProvider>
      </div>
    </MotionConfig>
  );
}

export type AccordionItemProps = {
  value: React.Key;
  children: ReactNode;
  className?: string;
};

function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { expandedValue } = useAccordion();
  const isExpanded = value === expandedValue;

  return (
    <div
      className={cn('overflow-hidden', className)}
      {...(isExpanded ? { 'data-expanded': '' } : {'data-closed': ''})}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            value,
            expanded: isExpanded,
          });
        }
        return child;
      })}
    </div>
  );
}

export type AccordionTriggerProps = {
  children: ReactNode;
  className?: string;
};

function AccordionTrigger({
  children,
  className,
  ...props
}: AccordionTriggerProps) {
  const { toggleItem, expandedValue } = useAccordion();
  const value = (props as { value?: React.Key }).value;
  const isExpanded = value === expandedValue;

  return (
    <button
      onClick={() => value !== undefined && toggleItem(value)}
      aria-expanded={isExpanded}
      type='button'
      className={cn('group', className)}
      {...(isExpanded ? { 'data-expanded': '' } : {'data-closed': ''})}
    >
      {children}
    </button>
  );
}

export type AccordionContentProps = {
  children: ReactNode;
  className?: string;
};

function AccordionContent({
  children,
  className,
  ...props
}: AccordionContentProps) {
  const { expandedValue, variants } = useAccordion();
  const value = (props as { value?: React.Key }).value;
  const isExpanded = value === expandedValue;

  const BASE_VARIANTS: Variants = {
    expanded: { height: 'auto', opacity: 1 },
    collapsed: { height: 0, opacity: 0 },
  };

  const combinedVariants = {
    expanded: { ...BASE_VARIANTS.expanded, ...variants?.expanded },
    collapsed: { ...BASE_VARIANTS.collapsed, ...variants?.collapsed },
  };

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial='collapsed'
          animate='expanded'
          exit='collapsed'
          variants={combinedVariants}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

```

## Shared utility

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```
