'use client';

import { X } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { SegmentedControl } from './site/SegmentedControl';
import {
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from './ui/toast';

type ViewMode = 'fancy' | 'simple';

const storageKey = 'halkliff-view-mode';
const interactionKey = 'halk-layout-onboarding-v3';

const segmentedControlVariants = cva(
  'flex items-center border border-[var(--dark-line)] p-0.5 [&>button]:cursor-pointer [&>button]:border-0 [&>button]:bg-transparent [&>button]:font-[var(--font-mono)] [&>button]:uppercase',
  {
    variants: {
      kind: {
        preference:
          'w-max text-[8px] tracking-[0.08em] [&>button]:h-8 [&>button]:rounded-md [&>button]:px-3 [&>button]:py-0 [&>button]:text-[8px] [&>button]:font-normal [&>button]:tracking-[0.04em] [&>button]:text-[#9ca7aa] [&>button.active]:bg-[var(--dark-fg)] [&>button.active]:text-[var(--dark-bg)]',
        nudge:
          '[&>button]:h-9 [&>button]:rounded-md [&>button]:px-[11px] [&>button]:py-0 [&>button]:text-[9px] [&>button]:font-bold [&>button]:tracking-[0.05em] [&>button]:text-[#9ca7aa] [&>button.active]:bg-[var(--acid)] [&>button.active]:text-[var(--accent-contrast)]',
      },
    },
    defaultVariants: {
      kind: 'preference',
    },
  },
);

function LandingControlsContent() {
  const [mode, setMode] = useState<ViewMode>('fancy');
  const [showHint, setShowHint] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(true);
  const toastManager = useToastManager();
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const interacted = window.localStorage.getItem(interactionKey) === 'true';

    if (saved === 'simple' || saved === 'fancy') {
      window.queueMicrotask(() => {
        setMode(saved);
        document.documentElement.dataset.viewMode = saved;
      });
    }
    window.queueMicrotask(() => setHasInteracted(interacted));

    function onScroll() {
      if (interacted) return;
      const hero = document.querySelector('.hero');
      const threshold = hero
        ? Math.min(
            hero.getBoundingClientRect().height * 0.58,
            window.innerHeight * 0.72,
          )
        : window.innerHeight * 0.65;
      setShowHint(window.scrollY > threshold);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!hasInteracted && showHint) {
      if (!toastIdRef.current) {
        toastIdRef.current = toastManager.add({
          description: 'Fancy keeps the machine. Simple trims the noise.',
          id: 'layout-preference',
          timeout: 0,
          title: 'Pick your preferred view.',
        });
      }
      return;
    }

    if (toastIdRef.current) {
      const toastId = toastIdRef.current;
      toastIdRef.current = null;
      toastManager.close(toastId);
    }
  }, [hasInteracted, showHint, toastManager]);

  function selectMode(nextMode: ViewMode) {
    setMode(nextMode);
    document.documentElement.dataset.viewMode = nextMode;
    window.localStorage.setItem(storageKey, nextMode);
    window.localStorage.setItem(interactionKey, 'true');
    setHasInteracted(true);
    setShowHint(false);
  }

  function dismissHint() {
    window.localStorage.setItem(interactionKey, 'true');
    setHasInteracted(true);
    setShowHint(false);
  }

  return (
    <>
      <SegmentedControl
        ariaLabel="Landing page style"
        className={cn(segmentedControlVariants({ kind: 'preference' }))}
        onChange={selectMode}
        options={[
          { value: 'fancy', label: 'Fancy' },
          { value: 'simple', label: 'Simple' },
        ]}
        value={mode}
      />
      <ToastPortal>
        <ToastViewport aria-label="Portfolio preferences">
          {toastManager.toasts.map((toast) => (
            <ToastRoot
              aria-label="Choose a preferred portfolio layout"
              key={toast.id}
              toast={toast}
            >
              <ToastContent className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-3.5 max-md:grid-cols-[1fr_auto] max-md:gap-2.5">
                <div>
                  <ToastTitle className="block text-[13px] font-semibold" />
                  <ToastDescription className="mt-1 block font-[var(--font-mono)] text-[8px] uppercase tracking-[0.05em] text-[#9ca7aa]" />
                </div>
                <SegmentedControl
                  ariaLabel="Choose a preferred portfolio layout"
                  className={cn(
                    segmentedControlVariants({ kind: 'nudge' }),
                    'max-md:col-start-1 max-md:row-start-2',
                  )}
                  onChange={selectMode}
                  options={[
                    { value: 'fancy', label: 'Fancy' },
                    { value: 'simple', label: 'Simple' },
                  ]}
                  value={mode}
                />
                <ToastClose
                  aria-label="Dismiss layout suggestion"
                  className="cursor-pointer border-0 bg-transparent px-2 py-1 text-[#9ca7aa] hover:text-white max-md:col-start-2 max-md:row-start-1"
                  onClick={dismissHint}
                >
                  <X
                    aria-hidden="true"
                    className="size-5"
                  />
                </ToastClose>
              </ToastContent>
            </ToastRoot>
          ))}
        </ToastViewport>
      </ToastPortal>
    </>
  );
}

export function LandingControls() {
  return (
    <ToastProvider timeout={0}>
      <LandingControlsContent />
    </ToastProvider>
  );
}
