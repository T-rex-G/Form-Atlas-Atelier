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
  VariantLabels,
  Target,
  TargetAndTransition,
  Transition,
} from 'motion/react';

export type TextRollProps = {
  children: string;
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  transition?: Transition;
  variants?: {
    enter: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
    exit: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
  };
  onAnimationComplete?: () => void;
};

export function TextRoll({
  children,
  duration = 0.5,
  getEnterDelay = (i) => i * 0.1,
  getExitDelay = (i) => i * 0.1 + 0.2,
  className,
  transition = { ease: 'easeIn' },
  variants,
  onAnimationComplete,
}: TextRollProps) {
  const defaultVariants = {
    enter: {
      initial: { rotateX: 0 },
      animate: { rotateX: 90 },
    },
    exit: {
      initial: { rotateX: 90 },
      animate: { rotateX: 0 },
    },
  } as const;

  const letters = children.split('');

  return (
    <span className={className}>
      {letters.map((letter, i) => {
        return (
          <span
            key={i}
            className='relative inline-block [perspective:10000px] [transform-style:preserve-3d] [width:auto]'
            aria-hidden='true'
          >
            <motion.span
              className='absolute inline-block [backface-visibility:hidden] [transform-origin:50%_25%]'
              initial={
                variants?.enter?.initial ?? defaultVariants.enter.initial
              }
              animate={
                variants?.enter?.animate ?? defaultVariants.enter.animate
              }
              transition={{
                ...transition,
                duration,
                delay: getEnterDelay(i),
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
            <motion.span
              className='absolute inline-block [backface-visibility:hidden] [transform-origin:50%_100%]'
              initial={variants?.exit?.initial ?? defaultVariants.exit.initial}
              animate={variants?.exit?.animate ?? defaultVariants.exit.animate}
              transition={{
                ...transition,
                duration,
                delay: getExitDelay(i),
              }}
              onAnimationComplete={
                letters.length === i + 1 ? onAnimationComplete : undefined
              }
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
            <span className='invisible'>
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          </span>
        );
      })}
      <span className='sr-only'>{children}</span>
    </span>
  );
}
