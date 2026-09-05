'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Typography } from './ui/typography';

function CleoCardBody({ close }: { close: () => void }) {
  return (
    <>
      <span className="relative block aspect-square overflow-hidden border border-(--dark-line)">
        <Image
          alt="Cleo, a Shih-Tzu with a pink bow, sitting in the grass"
          className="object-cover object-[50%_40%]"
          fill
          sizes="96px"
          src="/cleo.webp"
        />
      </span>
      <span className="block">
        <Typography
          as="strong"
          className="block font-(--font-sans) text-[14px] leading-snug"
          variant="body"
        >
          Cleo · Chief Emotional Support Officer
        </Typography>
        <Typography
          as="small"
          className="mt-2 block text-[11px] leading-normal text-[#9ca7aa]"
          variant="caption"
        >
          The real manager, yet terrified of her own shadow. Enforces the
          treat-for-commits policy anyway.
        </Typography>
      </span>
      <button
        aria-label="Close Cleo profile"
        className="self-start cursor-pointer border-0 bg-transparent text-[17px] text-[#9ca7aa]"
        onClick={close}
        type="button"
      >
        <X
          aria-hidden="true"
          className="size-5"
        />
      </button>
    </>
  );
}

/**
 * Cleo is an intentionally small easter egg. Desktop uses a click-opened card
 * attached to her name; mobile uses a modal AlertDialog so the card remains
 * readable without competing with the page layout.
 */
export function CleoEgg() {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <HoverCard
        open={open}
        onOpenChange={setOpen}
        openOnHover={false}
      >
        <HoverCardTrigger
          asChild
          onFocus={(event) => event.preventDefault()}
        >
          <button
            aria-expanded={open}
            className="cursor-pointer border-0 border-b border-dashed border-current bg-transparent p-0 pb-px font-inherit text-inherit hover:text-(--acid) [aria-expanded='true']:text-(--acid)"
            type="button"
          >
            Chief Emotional Support Officer 🌒👅🌘
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          aria-label="About Cleo"
          className="grid w-110 max-w-[calc(100vw-32px)] grid-cols-[96px_1fr_auto] items-center gap-4 border border-(--dark-line) bg-(--dark-bg) p-4 text-left text-(--dark-fg) shadow-[0_22px_70px_rgba(0,0,0,0.35)] absolute left-0 top-[calc(100%+10px)] z-20 max-md:hidden"
        >
          <CleoCardBody close={() => setOpen(false)} />
        </HoverCardContent>
      </HoverCard>

      <AlertDialog
        open={open}
        onOpenChange={setOpen}
      >
        <AlertDialogContent
          aria-describedby="cleo-mobile-description"
          aria-labelledby="cleo-mobile-title"
          className="fixed left-1/2 top-1/2 grid w-[min(360px,calc(100vw-32px))] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 grid-cols-1 items-stretch gap-3.5 border border-(--dark-line) bg-(--dark-bg) p-4 text-left text-(--dark-fg) shadow-[0_22px_70px_rgba(0,0,0,0.35)] max-md:gap-3.5 z-1"
          overlayClassName="hidden max-md:block"
        >
          <span className="relative block aspect-4/3 w-full overflow-hidden border border-(--dark-line)">
            <Image
              alt="Cleo, a Shih-Tzu with a pink bow, sitting in the grass"
              className="object-cover object-[50%_40%]"
              fill
              sizes="(max-width: 392px) calc(100vw - 66px), 326px"
              src="/cleo.webp"
            />
          </span>
          <AlertDialogHeader className="grid gap-1.5 pr-4.5">
            <AlertDialogTitle
              className="m-0 text-[15px] font-semibold leading-tight"
              id="cleo-mobile-title"
            >
              Cleo · Chief Emotional Support Officer
            </AlertDialogTitle>
            <AlertDialogDescription
              className="m-0 text-[11px] leading-normal text-[#9ca7aa]"
              id="cleo-mobile-description"
            >
              The real manager, yet terrified of her own shadow. Enforces the
          treat-for-commits policy anyway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel
            aria-label="Close Cleo profile"
            className="absolute right-6 top-6 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-[#10171b] p-0 text-white shadow-md hover:bg-[#263238] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10171b]"
          >
            <X
              aria-hidden="true"
              className="size-5"
            />
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  );
}
