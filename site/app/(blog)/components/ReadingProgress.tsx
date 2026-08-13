'use client';

import { useEffect, useState } from 'react';

export function calculateReadingProgress(
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number,
): number {
  const scrollable = scrollHeight - viewportHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((scrollY / scrollable) * 100)));
}

/** Compact, accessible reading progress for the sticky field-note header. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setProgress(
        calculateReadingProgress(
          window.scrollY,
          document.documentElement.scrollHeight,
          window.innerHeight,
        ),
      );
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-label={`Reading progress: ${progress}%`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress}
      className="article-progress inline-flex w-[112px] items-center gap-2.5 font-[family-name:var(--font-mono)] text-[10px] tracking-[0.06em] text-[var(--muted)] max-md:hidden"
      role="progressbar"
    >
      <span className="w-[48px] shrink-0 text-right">READ {progress}%</span>
      <span className="h-px flex-1 overflow-hidden bg-[var(--line)]">
        <span
          className="block h-full bg-[var(--ink)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </span>
    </div>
  );
}
