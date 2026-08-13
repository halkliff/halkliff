'use client';

import { useState } from 'react';
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
      <span
        aria-label="Future photo of Cleo"
        className="flex aspect-square flex-col items-center justify-center border border-dashed border-[#697276] font-(--font-mono) text-[8px] tracking-[0.08em] text-[#9ca7aa]"
      >
        <Typography
          as="span"
          className="text-[8px] tracking-[0.08em] text-[#9ca7aa]"
          variant="codeLabel"
        >
          PHOTO
        </Typography>
        <Typography
          as="small"
          className="text-[7px]"
          variant="caption"
        >
          SLOT
        </Typography>
      </span>
      <span className="block">
        <Typography
          as="strong"
          className="block font-(--font-sans) text-[11px]"
          variant="body"
        >
          Cleo · Chief Emotional Support Officer
        </Typography>
        <Typography
          as="small"
          className="mt-1.25 block text-[8px] leading-normal text-[#9ca7aa]"
          variant="caption"
        >
          The real manager, keeper of the treat-for-commits system, and a
          reliable source of chaotic energy.
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
          className="size-4"
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
            Chief Emotional Support Officer
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          aria-label="About Cleo"
          className="grid w-85 grid-cols-[64px_1fr_auto] items-center gap-3 border border-(--dark-line) bg-(--dark-bg) p-3 text-left text-(--dark-fg) shadow-[0_22px_70px_rgba(0,0,0,0.35)] absolute left-0 top-[calc(100%+10px)] z-20 max-md:hidden"
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
          <span
            aria-label="Future photo of Cleo"
            className="flex aspect-4/3 w-full flex-col items-center justify-center border border-dashed border-[#697276] font-(--font-mono) text-[8px] tracking-[0.08em] text-[#9ca7aa]"
          >
            <Typography
              as="span"
              className="text-[8px] tracking-[0.08em] text-[#9ca7aa]"
              variant="codeLabel"
            >
              PHOTO
            </Typography>
            <Typography
              as="small"
              className="text-[7px]"
              variant="caption"
            >
              SLOT
            </Typography>
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
              The real manager, keeper of the treat-for-commits system, and a
              reliable source of chaotic energy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel
            aria-label="Close Cleo profile"
            className="absolute right-3 top-2.5 cursor-pointer border-0 bg-transparent p-0 text-[17px] text-[#9ca7aa]"
          >
            <X
              aria-hidden="true"
              className="size-4"
            />
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  );
}
