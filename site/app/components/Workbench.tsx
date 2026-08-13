'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  GitBranch,
  PanelRightClose,
  PanelRightOpen,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './ui/sidebar';
import { Kbd, KbdShortcut, useKeyboardPlatform } from './ui/kbd';
import { Typography } from './ui/typography';
import {
  type FormEvent as ReactFormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type Tab = 'profile' | 'stack' | 'lab';

type TerminalEntry = {
  command: string;
  output: string[];
  tone?: 'normal' | 'error';
};

const branchStates = [
  {
    name: 'main*',
    message: 'Fast-forwarded main. No merge conflicts in this timeline.',
  },
  {
    name: 'feat/joy',
    message: 'Switched to feat/joy. Side effects may include delight.',
  },
  {
    name: 'fix/reality',
    message: 'Reality patched. Tests remain suspiciously green.',
  },
];

const stack = [
  ['TypeScript', 96],
  ['React / Next', 96],
  ['Python', 92],
  ['AWS', 84],
  ['Rust', 68],
];

const captionClass =
  'font-[var(--font-mono)] text-[9px] tracking-[0.13em] text-[#7c8178]';

function railItemClass(active: boolean) {
  return cn(
    'flex cursor-pointer items-center gap-2 border-0 bg-transparent px-[10px] py-2 pl-[23px] text-left font-[var(--font-mono)] text-[10px] text-[#969b91] hover:bg-[#252925] hover:text-white max-md:min-w-0 max-md:flex-1 max-md:p-[9px_6px]',
    active && 'bg-[#252925] text-white',
  );
}

function editorTabClass(active: boolean) {
  return cn(
    'relative flex h-10 cursor-pointer items-center gap-2 border-0 border-r border-[var(--dark-line)] bg-transparent px-4 text-left font-[var(--font-mono)] text-[10px] text-[#969b91]',
    active &&
      "bg-[#1b1e1b] text-[#f2f3ed] after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-[var(--acid)] after:content-['']",
  );
}

function memoryCellClass(active: boolean) {
  return cn(
    'relative aspect-square border border-[#343934] bg-[#2a2e2a] after:pointer-events-none after:absolute after:bottom-[calc(100%+7px)] after:left-1/2 after:z-[2] after:-translate-x-1/2 after:bg-[var(--paper)] after:px-[7px] after:py-[5px] after:font-[var(--font-mono)] after:text-[8px] after:text-[var(--ink)] after:opacity-0 after:whitespace-nowrap after:content-[attr(data-address)] hover:after:opacity-100',
    active && 'border-[var(--mint)] bg-[rgba(126,255,196,0.72)]',
  );
}

function diagnosticIconClass(tone: 'pass' | 'warn') {
  return cn(
    'flex size-[17px] shrink-0 items-center justify-center rounded-full border border-current font-[var(--font-mono)] text-[8px]',
    tone === 'pass' ? 'text-[var(--mint)]' : 'text-[#e3cd66]',
  );
}

function DiagnosticsPanel({ className }: { className?: string }) {
  return (
    <div
      aria-label="Workbench diagnostics"
      className={cn(
        'border-l border-[var(--dark-line)] bg-[#141714] p-[18px_14px] text-[#d7ddd4]',
        className,
      )}
    >
      <div
        className={cn(
          captionClass,
          'mb-[14px] flex items-center justify-between',
        )}
      >
        <Typography
          as="span"
          variant="codeLabel"
        >
          DIAGNOSTICS
        </Typography>
        <Typography
          as="small"
          className="text-[8px] text-[var(--mint)]"
          variant="caption"
        >
          0 ERRORS
        </Typography>
      </div>
      <div className="flex items-start gap-[10px] border-t border-[var(--dark-line)] py-[15px]">
        <Check
          aria-hidden="true"
          className={cn(diagnosticIconClass('pass'), 'size-3')}
        />
        <div>
          <Typography
            as="strong"
            className="block text-[9px] tracking-[0.06em] text-[#c3c7c0]"
            variant="codeLabel"
          >
            CI / CD
          </Typography>
          <Typography
            as="small"
            className="mt-1 block text-[8px] text-[#8a9187]"
            variant="caption"
          >
            All checks passing
          </Typography>
        </div>
      </div>
      <div className="flex items-start gap-[10px] border-t border-[var(--dark-line)] py-[15px]">
        <Check
          aria-hidden="true"
          className={cn(diagnosticIconClass('pass'), 'size-3')}
        />
        <div>
          <Typography
            as="strong"
            className="block text-[9px] tracking-[0.06em] text-[#c3c7c0]"
            variant="codeLabel"
          >
            BRANCH COVERAGE
          </Typography>
          <Typography
            as="small"
            className="mt-1 block text-[8px] text-[#8a9187]"
            variant="caption"
          >
            100.0% · suspiciously nice
          </Typography>
        </div>
      </div>
      <div className="flex items-start gap-[10px] border-t border-[var(--dark-line)] py-[15px]">
        <TriangleAlert
          aria-hidden="true"
          className={cn(diagnosticIconClass('warn'), 'size-3')}
        />
        <div>
          <Typography
            as="strong"
            className="block text-[9px] tracking-[0.06em] text-[#c3c7c0]"
            variant="codeLabel"
          >
            SLEEP DEBT
          </Typography>
          <Typography
            as="small"
            className="mt-1 block text-[8px] text-[#8a9187]"
            variant="caption"
          >
            0.0 hrs · enforced
          </Typography>
        </div>
      </div>
      <Card className="mt-5 rounded-none border-[var(--dark-line)] bg-[#1e221e] p-[14px] text-[#d7ddd4] shadow-none">
        <Typography
          as="p"
          className="m-0 text-[8px] tracking-[0.1em] text-[#8a9187]"
          variant="codeLabel"
        >
          RUNTIME
        </Typography>
        <Typography
          as="strong"
          className="my-2 block text-[11px] text-[#d7ddd4]"
          variant="codeLabel"
        >
          WORKER-01
        </Typography>
        <div className="mb-3 flex h-[72px] items-end gap-1">
          {[24, 36, 30, 48, 42, 68, 52, 74, 58, 82, 64, 86].map(
            (height, index) => (
              <i
                className="min-w-[2px] flex-1 bg-[var(--acid)] opacity-70"
                style={{ height: `${height}%` }}
                key={index}
              />
            ),
          )}
        </div>
        <Typography
          as="small"
          className="m-0 text-[8px] tracking-[0.1em] text-[#8a9187]"
          variant="caption"
        >
          4.2ms frame · stable
        </Typography>
      </Card>
    </div>
  );
}

export function Workbench() {
  const [tab, setTab] = useState<Tab>('profile');
  const [bytes, setBytes] = useState(16);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const keyboardPlatform = useKeyboardPlatform();
  const modifierKey = keyboardPlatform === 'apple' ? '⌘' : 'Ctrl';
  const [branchIndex, setBranchIndex] = useState(0);
  const [branchMessage, setBranchMessage] = useState('');
  const [terminalCommand, setTerminalCommand] = useState('');
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([]);
  const [consolePosition, setConsolePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);
  const dragOrigin = useRef<{
    pointerX: number;
    pointerY: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const terminalBody = terminalBodyRef.current;
    if (!terminalBody) return;
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }, [terminalEntries]);

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      if (!dragOrigin.current) return;
      setConsolePosition({
        x: dragOrigin.current.x + event.clientX - dragOrigin.current.pointerX,
        y: dragOrigin.current.y + event.clientY - dragOrigin.current.pointerY,
      });
    }

    function onMouseUp() {
      dragOrigin.current = null;
      setIsDragging(false);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (event.key === 'Escape') setPaletteOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const segments = useMemo(
    () =>
      Array.from({ length: bytes }, (_, index) => ({
        address: `0x${(4096 + index).toString(16).toUpperCase()}`,
        active: index < Math.round(bytes * 0.68),
      })),
    [bytes],
  );

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: consolePosition.x,
      y: consolePosition.y,
    };
    setIsDragging(true);
  }

  function beginMouseDrag(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || dragOrigin.current) return;
    event.preventDefault();
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: consolePosition.x,
      y: consolePosition.y,
    };
    setIsDragging(true);
  }

  function continueDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current) return;
    setConsolePosition({
      x: dragOrigin.current.x + event.clientX - dragOrigin.current.pointerX,
      y: dragOrigin.current.y + event.clientY - dragOrigin.current.pointerY,
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragOrigin.current = null;
    setIsDragging(false);
  }

  function nudgeConsole(event: ReactKeyboardEvent<HTMLDivElement>) {
    const distance = event.shiftKey ? 32 : 12;
    const movement = {
      ArrowUp: { x: 0, y: -distance },
      ArrowDown: { x: 0, y: distance },
      ArrowLeft: { x: -distance, y: 0 },
      ArrowRight: { x: distance, y: 0 },
    }[event.key];

    if (movement) {
      event.preventDefault();
      setConsolePosition((position) => ({
        x: position.x + movement.x,
        y: position.y + movement.y,
      }));
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setConsolePosition({ x: 0, y: 0 });
    }
  }

  function cycleBranch() {
    const nextIndex = (branchIndex + 1) % branchStates.length;
    setBranchIndex(nextIndex);
    setBranchMessage(branchStates[nextIndex].message);
  }

  function executeTerminalCommand() {
    const command = terminalCommand.trim();
    if (!command) return;

    const normalized = command.toLowerCase();
    if (normalized === 'clear') {
      setTerminalEntries([]);
      setTerminalCommand('');
      return;
    }

    let output: string[];
    let tone: TerminalEntry['tone'] = 'normal';

    switch (normalized) {
      case 'help':
        output = ['Try: whoami · quest · coffee · cleo · git status · clear'];
        break;
      case 'whoami':
        output = ['Werberth / Halk — Software Engineer, systems curious.'];
        break;
      case 'quest':
        output = [
          'Current quest: make ToyEngine render more than suspicious triangles.',
        ];
        break;
      case 'coffee':
        output = ['coffee: command not found. Water subsystem is healthy.'];
        break;
      case 'cleo':
        output = [
          'Cleo is hiding upstairs. Her name knows more than it admits.',
        ];
        break;
      case 'git status':
        output = [
          'On branch feat/joy',
          'nothing to commit, curiosity tree clean',
        ];
        break;
      default:
        output = [`${command}: command not found. Try \`help\`.`];
        tone = 'error';
    }

    setTerminalEntries((entries) =>
      [...entries, { command, output, tone }].slice(-4),
    );
    setTerminalCommand('');
  }

  function runTerminalCommand(event: ReactFormEvent<HTMLFormElement>) {
    event.preventDefault();
    executeTerminalCommand();
  }

  function handleTerminalKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    executeTerminalCommand();
  }

  return (
    <>
      <div className="relative mx-auto min-h-[600px] max-w-[1380px] border border-white/[0.16] bg-[#181b18] shadow-[0_36px_100px_rgba(0,0,0,0.42)]">
        <div className="grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--dark-line)] px-3.5 font-[var(--font-mono)] text-[10px] tracking-[0.04em] max-md:grid-cols-[1fr_auto]">
          <div
            className="flex gap-[7px]"
            aria-hidden="true"
          >
            <i className="size-2 rounded-full bg-[var(--orange)]" />
            <i className="size-2 rounded-full bg-[#e5c660]" />
            <i className="size-2 rounded-full bg-[#65ca87]" />
          </div>
          <Typography
            as="span"
            className="max-md:hidden"
            variant="codeLabel"
          >
            bridge://halkliff/profile
          </Typography>
          <button
            aria-label={`${modifierKey} K: open quick navigation`}
            className="inline-flex cursor-pointer items-center justify-self-end gap-1.5 border border-[var(--dark-line)] bg-transparent px-2.5 py-2 text-[#acb1a7] hover:border-[var(--acid)] hover:text-[var(--acid)] max-md:col-start-2"
            type="button"
            onClick={() => setPaletteOpen(true)}
          >
            <KbdShortcut
              aria-hidden="true"
              className="gap-0.5"
              keyClassName="h-auto min-w-0 rounded-none border-[#50554d] bg-transparent px-[3px] py-px font-[var(--font-mono)] text-[9px] font-normal leading-normal text-inherit"
              keyLabel="K"
            />
            <Typography
              as="span"
              variant="codeLabel"
            >
              QUICK OPEN
            </Typography>
          </button>
        </div>

        <SidebarProvider
          className={cn(
            'grid min-h-[552px] grid-cols-[190px_minmax(420px,1fr)_248px] transition-[grid-template-columns] duration-300 max-md:block max-md:min-h-0',
            diagnosticsOpen
              ? 'max-lg:grid-cols-[160px_minmax(0,1fr)_248px]'
              : 'max-lg:grid-cols-[160px_minmax(0,1fr)_0px]',
          )}
          onOpenChange={setDiagnosticsOpen}
          open={diagnosticsOpen}
        >
          <aside className="flex flex-col border-r border-[var(--dark-line)] bg-[#141714] px-2 pb-2 pt-4 max-md:flex-row max-md:overflow-x-hidden max-md:border-r-0 max-md:border-b max-md:p-1.5">
            <Typography
              as="div"
              className={cn(captionClass, 'px-2 pb-4 max-md:hidden')}
              variant="codeLabel"
            >
              EXPLORER
            </Typography>
            <Typography
              as="p"
              className="m-0 mb-1.5 px-1.5 py-1 text-[10px] font-semibold text-[#c3c7bf] max-md:hidden"
              variant="codeLabel"
            >
              <span className="inline-flex items-center gap-1">
                <ChevronDown
                  aria-hidden="true"
                  className="size-3"
                />{' '}
                HALK
              </span>
            </Typography>
            <button
              className={railItemClass(tab === 'profile')}
              onClick={() => setTab('profile')}
              type="button"
            >
              <span className="inline-block size-[7px] shrink-0 rounded-[2px] bg-[var(--orange)]" />
              <Typography
                as="span"
                variant="codeLabel"
              >
                profile.rs
              </Typography>
            </button>
            <button
              className={railItemClass(tab === 'stack')}
              onClick={() => setTab('stack')}
              type="button"
            >
              <span className="inline-block size-[7px] shrink-0 rounded-[2px] bg-[var(--blue)]" />
              <Typography
                as="span"
                variant="codeLabel"
              >
                stack.ts
              </Typography>
            </button>
            <button
              className={railItemClass(tab === 'lab')}
              onClick={() => setTab('lab')}
              type="button"
            >
              <span className="inline-block size-[7px] shrink-0 rounded-[2px] bg-[var(--violet)]" />
              <Typography
                as="span"
                variant="codeLabel"
              >
                allocation.rs
              </Typography>
            </button>
            <Link
              className={cn(railItemClass(false), 'max-md:hidden')}
              href="/blog/memory-layout-for-react-devs"
            >
              <span className="inline-block size-[7px] shrink-0 rounded-[2px] bg-[var(--mint)]" />
              <Typography
                as="span"
                variant="codeLabel"
              >
                notes.md
              </Typography>
            </Link>
            <div className="flex-1 max-md:hidden" />
            {branchMessage && (
              <Typography
                as="small"
                className="block px-2 pb-2 text-[7px] leading-[1.45] text-[var(--acid)] max-md:hidden"
                role="status"
                variant="caption"
              >
                {branchMessage}
              </Typography>
            )}
            <button
              aria-label="Switch imaginary git branch"
              className="block w-full cursor-pointer border-0 border-t border-[var(--dark-line)] bg-transparent px-2 pb-[3px] pt-[14px] text-left font-[var(--font-mono)] text-[9px] text-[#8b9186] hover:text-[var(--acid)] focus-visible:text-[var(--acid)] max-md:hidden"
              onClick={cycleBranch}
              title="This branch is suspiciously clickable."
              type="button"
            >
              <GitBranch
                aria-hidden="true"
                className="mr-1 inline size-3"
              />{' '}
              <Typography
                as="span"
                variant="codeLabel"
              >
                {branchStates[branchIndex].name}
              </Typography>
            </button>
          </aside>

          <section className="flex min-w-0 flex-col">
            <div className="flex h-10 border-b border-[var(--dark-line)] bg-[#141714] max-md:hidden">
              <button
                className={editorTabClass(tab === 'profile')}
                onClick={() => setTab('profile')}
                type="button"
              >
                <span className="inline-block size-[7px] shrink-0 rounded-[2px] bg-[var(--orange)]" />
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  profile.rs
                </Typography>
              </button>
              <button
                className={editorTabClass(tab === 'stack')}
                onClick={() => setTab('stack')}
                type="button"
              >
                <span className="inline-block size-[7px] shrink-0 rounded-[2px] bg-[var(--blue)]" />
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  stack.ts
                </Typography>
              </button>
              <button
                className={editorTabClass(tab === 'lab')}
                onClick={() => setTab('lab')}
                type="button"
              >
                <span className="inline-block size-[7px] shrink-0 rounded-[2px] bg-[var(--violet)]" />
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  allocation.rs
                </Typography>
              </button>
            </div>

            <div
              className="min-h-[450px] flex-1 overflow-auto [scrollbar-color:#639ab6_#101411] [scrollbar-width:thin] max-md:min-h-[300px] max-md:overflow-x-hidden"
              aria-live="polite"
            >
              {tab === 'profile' && (
                <div className="px-6 py-9 font-[var(--font-mono)] text-[clamp(11px,1vw,14px)] leading-[2.1] max-md:overflow-x-hidden max-md:px-3 max-md:py-6">
                  <div className="grid min-w-[620px] grid-cols-[34px_1fr] max-lg:min-w-0">
                    <span className="select-none text-[10px] text-[#51564f]">
                      01
                    </span>
                    <code className="min-w-0 max-lg:[overflow-wrap:anywhere] max-md:whitespace-normal">
                      <span className="text-[#d2a9ff]">struct</span>{' '}
                      <span className="text-[#f1df82]">Engineer</span> {'{'}
                    </code>
                  </div>
                  <div className="grid min-w-[620px] grid-cols-[34px_1fr] max-lg:min-w-0">
                    <span className="select-none text-[10px] text-[#51564f]">
                      02
                    </span>
                    <code className="min-w-0 max-lg:[overflow-wrap:anywhere] max-md:whitespace-normal">
                      &nbsp;&nbsp;name:{' '}
                      <span className="text-[#9be8b8]">
                        &quot;Werberth Lins&quot;
                      </span>
                      ,
                    </code>
                  </div>
                  <div className="grid min-w-[620px] grid-cols-[34px_1fr] max-lg:min-w-0">
                    <span className="select-none text-[10px] text-[#51564f]">
                      03
                    </span>
                    <code className="min-w-0 max-lg:[overflow-wrap:anywhere] max-md:whitespace-normal">
                      &nbsp;&nbsp;role:{' '}
                      <span className="text-[#9be8b8]">
                        &quot;Lead SWE · Web → Systems&quot;
                      </span>
                      ,
                    </code>
                  </div>
                  <div className="grid min-w-[620px] grid-cols-[34px_1fr] max-lg:min-w-0">
                    <span className="select-none text-[10px] text-[#51564f]">
                      04
                    </span>
                    <code className="min-w-0 max-lg:[overflow-wrap:anywhere] max-md:whitespace-normal">
                      &nbsp;&nbsp;mode:{' '}
                      <span className="text-[#ef9a6d]">Mode</span>::
                      <span className="text-[#8dc8ff]">ChaoticGood</span>,
                    </code>
                  </div>
                  <div className="grid min-w-[620px] grid-cols-[34px_1fr] max-lg:min-w-0">
                    <span className="select-none text-[10px] text-[#51564f]">
                      05
                    </span>
                    <code className="min-w-0 max-lg:[overflow-wrap:anywhere] max-md:whitespace-normal">
                      &nbsp;&nbsp;focus: [
                      <span className="text-[#9be8b8]">&quot;Rust&quot;</span>,{' '}
                      <span className="text-[#9be8b8]">
                        &quot;Cloud systems&quot;
                      </span>
                      ,{' '}
                      <span className="text-[#9be8b8]">
                        &quot;Game engines&quot;
                      </span>
                      ],
                    </code>
                  </div>
                  <div className="grid min-w-[620px] grid-cols-[34px_1fr] max-lg:min-w-0">
                    <span className="select-none text-[10px] text-[#51564f]">
                      06
                    </span>
                    <code className="min-w-0 max-lg:[overflow-wrap:anywhere] max-md:whitespace-normal">
                      {'}'}
                    </code>
                  </div>
                  <div className="grid h-5 min-w-[620px] grid-cols-[34px_1fr] max-lg:min-w-0">
                    <span className="select-none text-[10px] text-[#51564f]">
                      07
                    </span>
                  </div>
                  <div className="grid min-w-[620px] grid-cols-[34px_1fr] max-lg:min-w-0">
                    <span className="select-none text-[10px] text-[#51564f]">
                      08
                    </span>
                    <code className="min-w-0 max-lg:[overflow-wrap:anywhere] max-md:whitespace-normal">
                      <span className="italic text-[#777d73]">
                        {'//'} The browser is a systems problem wearing good
                        CSS.
                      </span>
                    </code>
                  </div>
                </div>
              )}

              {tab === 'stack' && (
                <div className="px-[clamp(20px,4vw,54px)] py-[34px]">
                  <Typography
                    as="p"
                    className={cn(captionClass, 'm-0')}
                    variant="codeLabel"
                  >
                    WORKING KNOWLEDGE / PERMANENTLY IN PROGRESS
                  </Typography>
                  {stack.map(([name, value]) => (
                    <div
                      className="my-[26px] grid grid-cols-[110px_1fr_40px] items-center gap-[18px] font-[var(--font-mono)] text-[11px]"
                      key={name}
                    >
                      <Typography
                        as="span"
                        variant="codeLabel"
                      >
                        {name}
                      </Typography>
                      <div className="h-[7px] overflow-hidden bg-[#292d29]">
                        <i
                          className="block h-full bg-[var(--acid)] transition-[width] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <Typography
                        as="small"
                        className="text-[#747a71]"
                        variant="caption"
                      >
                        {value}%
                      </Typography>
                    </div>
                  ))}
                  <Typography
                    as="p"
                    className="m-0 mt-10 border-t border-[var(--dark-line)] pt-4 text-[9px] leading-[1.6] text-[#777d73]"
                    variant="code"
                  >
                    Numbers indicate current comfort, not LinkedIn-grade
                    spiritual enlightenment.
                  </Typography>
                </div>
              )}

              {tab === 'lab' && (
                <div className="px-[clamp(20px,4vw,54px)] py-[34px]">
                  <div className="flex items-end justify-between">
                    <div>
                      <Typography
                        as="p"
                        className={cn(captionClass, 'm-0')}
                        variant="codeLabel"
                      >
                        TINY ALLOCATION LAB
                      </Typography>
                      <Typography
                        as="h3"
                        className="mt-3 text-[30px] font-[520] tracking-[-0.04em]"
                        variant="h3"
                      >
                        {bytes} byte buffer
                      </Typography>
                    </div>
                    <Typography
                      as="span"
                      className="text-[10px] text-[var(--mint)]"
                      variant="codeLabel"
                    >
                      {Math.round(bytes * 0.68)} used
                    </Typography>
                  </div>
                  <div
                    className="my-[30px] grid grid-cols-[repeat(8,minmax(0,1fr))] gap-1"
                    aria-label={`${bytes} byte memory buffer`}
                  >
                    {segments.map((segment) => (
                      <span
                        className={memoryCellClass(segment.active)}
                        data-address={segment.address}
                        key={segment.address}
                        title={segment.address}
                      />
                    ))}
                  </div>
                  <label className="grid grid-cols-[auto_1fr_32px] items-center gap-[14px] font-[var(--font-mono)] text-[9px]">
                    <Typography
                      as="span"
                      variant="codeLabel"
                    >
                      CAPACITY
                    </Typography>
                    <input
                      className="w-full accent-[var(--acid)]"
                      type="range"
                      min="8"
                      max="32"
                      value={bytes}
                      onChange={(event) => setBytes(Number(event.target.value))}
                    />
                    <output className="text-[var(--acid)]">{bytes}B</output>
                  </label>
                  <Typography
                    as="p"
                    className="m-0 mt-10 border-t border-[var(--dark-line)] pt-4 text-[9px] leading-[1.6] text-[#777d73]"
                    variant="code"
                  >
                    Drag the capacity. Hover a byte to inspect its address.
                    Abstractions are nicer when you can see what they abstract.
                  </Typography>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-[18px] border-t border-[var(--dark-line)] px-3 py-2 font-[var(--font-mono)] text-[8px] tracking-[0.06em] text-[#777c73]">
              <span>Ln 8, Col 72</span>
              <span>UTF-8</span>
              <span>Rust</span>
              <span className="inline-flex items-center gap-1">
                <Check
                  aria-hidden="true"
                  className="size-3"
                />{' '}
                type-safe
              </span>
            </div>
          </section>

          <Sidebar
            aria-label="Workbench diagnostics"
            className={cn(
              'relative flex min-w-0 flex-col bg-[#141714] text-[#d7ddd4]',
              !diagnosticsOpen && 'max-lg:hidden',
              'max-md:mt-0 max-md:border-t max-md:border-[var(--dark-line)]',
            )}
          >
            <SidebarContent>
              <DiagnosticsPanel className="h-full border-l max-md:border-l-0" />
            </SidebarContent>
          </Sidebar>
          <SidebarTrigger
            aria-label={
              diagnosticsOpen
                ? 'Close workbench diagnostics'
                : 'Open workbench diagnostics'
            }
            className="absolute right-0 top-1/2 z-[4] hidden h-12 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-md border border-r-0 border-[var(--dark-line)] bg-[#1e221e] p-0 text-[#d7ddd4] shadow-[-8px_0_24px_rgba(0,0,0,0.28)] hover:bg-[#292e29] hover:text-[var(--acid)] max-lg:inline-flex"
          >
            {diagnosticsOpen ? (
              <PanelRightClose
                aria-hidden="true"
                className="size-4"
              />
            ) : (
              <PanelRightOpen
                aria-hidden="true"
                className="size-4"
              />
            )}
          </SidebarTrigger>
          <SidebarRail className="absolute inset-y-0 right-0 hidden w-px cursor-col-resize border-0 bg-transparent max-lg:block" />
        </SidebarProvider>
      </div>

      <div
        className={cn(
          'absolute bottom-9 right-[clamp(20px,5vw,84px)] z-[3] w-[min(370px,calc(100vw-40px))] border border-[#4a5048] bg-[#0c0e0c] text-[#dfe2d9] shadow-[0_22px_70px_rgba(0,0,0,0.48)] [will-change:transform] max-md:hidden',
          isDragging && 'select-none shadow-[0_28px_90px_rgba(0,0,0,0.62)]',
        )}
        style={{
          transform: `translate(${consolePosition.x}px, ${consolePosition.y}px)`,
        }}
      >
        <div
          aria-label="Drag the terminal window. Arrow keys also move it; Home resets its position."
          className={cn(
            'flex cursor-grab select-none touch-none items-center justify-between bg-[#202420] px-3 py-[9px] font-[var(--font-mono)] text-[9px] tracking-[0.05em] active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[var(--acid)] focus-visible:outline-offset-[3px]',
            isDragging && 'cursor-grabbing',
          )}
          onKeyDown={nudgeConsole}
          onMouseDown={beginMouseDrag}
          onPointerCancel={endDrag}
          onPointerDown={beginDrag}
          onPointerMove={continueDrag}
          onPointerUp={endDrag}
          role="button"
          tabIndex={0}
        >
          <Typography
            as="span"
            variant="codeLabel"
          >
            terminal — cargo run
          </Typography>
          <Typography
            as="small"
            className="text-[7px] text-[#6e756a]"
            variant="caption"
          >
            DRAG / ARROWS
          </Typography>
        </div>
        <div
          aria-label="Interactive terminal output"
          className="h-[170px] overflow-y-scroll px-[15px] py-[13px] font-[var(--font-mono)] text-[10px] leading-[1.5] [scrollbar-color:#639ab6_#0d110e] [scrollbar-gutter:stable] [scrollbar-width:thin]"
          ref={terminalBodyRef}
        >
          <p className="m-[3px_0]">
            <span className="text-[var(--acid)]">❯</span> cargo run --release
          </p>
          <p className="m-[3px_0] text-[#6f756c]">Compiling curiosity v0.8.0</p>
          <p className="m-[3px_0] text-[var(--mint)]">
            Finished <b>release</b> in 0.42s
          </p>
          {terminalEntries.map((entry, entryIndex) => (
            <div
              className="mt-2 border-t border-white/[0.06] pt-1.5"
              key={`${entry.command}-${entryIndex}`}
            >
              <p className="m-[3px_0]">
                <span className="text-[var(--acid)]">❯</span> {entry.command}
              </p>
              {entry.output.map((line) => (
                <p
                  className={cn(
                    'm-[3px_0]',
                    entry.tone === 'error'
                      ? 'text-[var(--orange)]'
                      : 'text-[var(--acid)]',
                  )}
                  key={line}
                >
                  {line}
                </p>
              ))}
            </div>
          ))}
          <form
            className="mt-[7px] flex items-center gap-[6px]"
            onSubmit={runTerminalCommand}
          >
            <span
              className="text-[var(--acid)]"
              aria-hidden="true"
            >
              ❯
            </span>
            <input
              aria-label="Terminal command"
              autoComplete="off"
              className="min-w-0 flex-1 border-0 bg-transparent px-0 py-[3px] font-[var(--font-mono)] text-[10px] text-[#dfe2d9] outline-none placeholder:text-[#59615a]"
              onChange={(event) => setTerminalCommand(event.target.value)}
              onKeyDown={handleTerminalKeyDown}
              placeholder="type `help`"
              spellCheck={false}
              value={terminalCommand}
            />
          </form>
        </div>
      </div>

      {paletteOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-[rgba(4,5,4,0.72)] pt-[16vh] backdrop-blur-[8px]"
          role="presentation"
          onMouseDown={() => setPaletteOpen(false)}
        >
          <div
            className="w-[calc(100vw-32px)] max-w-[620px] border border-[#4a5048] bg-[#181b18] p-[10px] text-[#e9ebe4] shadow-[0_32px_120px_rgba(0,0,0,0.65)]"
            role="dialog"
            aria-modal="true"
            aria-label="Quick open"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="grid grid-cols-[30px_1fr_auto] items-center border-b border-[var(--dark-line)] px-[10px] pb-[18px] pt-[13px]">
              <Kbd className="flex size-5 items-center justify-center rounded-none border-[#50564e] bg-transparent px-0 py-0 font-[var(--font-mono)] text-[10px] text-inherit">
                {modifierKey}
              </Kbd>
              <Typography
                as="p"
                className="m-0 text-[15px] text-[#959b91]"
                variant="body"
              >
                Go somewhere useful…
              </Typography>
              <Kbd className="rounded-none border-[#454b43] bg-[#2a2e2a] px-[5px] py-[3px] font-[var(--font-mono)] text-[8px] text-[#a8ada4]">
                ESC
              </Kbd>
            </div>
            <Typography
              as="p"
              className="m-4 mb-2 px-2 text-[8px] tracking-[0.13em] text-[#72786e]"
              variant="codeLabel"
            >
              QUICK OPEN
            </Typography>
            <Link
              className="grid grid-cols-[24px_1fr_auto] items-center gap-3 px-[10px] py-3 font-[var(--font-mono)] text-[10px] hover:bg-[#292e29]"
              href="/blog/memory-layout-for-react-devs"
            >
              <span className="text-[#676e64]">01</span>
              <Typography
                as="strong"
                variant="codeLabel"
              >
                Read: Memory layout for React devs
              </Typography>
              <Kbd className="rounded-none border-[#454b43] bg-[#2a2e2a] px-[5px] py-[3px] font-[var(--font-mono)] text-[8px] text-[#a8ada4]">
                ↵
              </Kbd>
            </Link>
            <a
              className="grid grid-cols-[24px_1fr_auto] items-center gap-3 px-[10px] py-3 font-[var(--font-mono)] text-[10px] hover:bg-[#292e29]"
              href="https://github.com/halkliff"
            >
              <span className="text-[#676e64]">02</span>
              <Typography
                as="strong"
                variant="codeLabel"
              >
                Browse the GitHub workshop
              </Typography>
              <ArrowUpRight
                aria-hidden="true"
                className="size-3 text-[#a8ada4]"
              />
            </a>
            <a
              className="grid grid-cols-[24px_1fr_auto] items-center gap-3 px-[10px] py-3 font-[var(--font-mono)] text-[10px] hover:bg-[#292e29]"
              href="mailto:halkliff@pm.me"
            >
              <span className="text-[#676e64]">03</span>
              <Typography
                as="strong"
                variant="codeLabel"
              >
                Start a conversation
              </Typography>
              <ArrowUpRight
                aria-hidden="true"
                className="size-3 text-[#a8ada4]"
              />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
