import Link from 'next/link';
import Image from 'next/image';
import { cva } from 'class-variance-authority';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import pageStyles from './page.module.css';
import { CleoEgg } from './components/CleoEgg';
import { ContactCta } from './components/ContactCta';
import { LandingControls } from './components/LandingControls';
import { AppearanceControls } from './components/AppearanceControls';
import { Workbench } from './components/Workbench';
import { Button } from './components/ui/button';
import {
  ExperienceRow,
  NoteRow,
  PrincipleCard,
  ProjectCard,
} from './components/site/PortfolioItems';
import { SectionIntro } from './components/site/SectionIntro';
import { SectionKicker } from './components/site/SectionKicker';
import { SocialLinks } from './components/site/SocialLinks';
import { ContentFrame } from './components/site/ContentFrame';
import { Typography } from './components/ui/typography';

const actionButtonVariants = cva(
  'inline-flex min-h-12 w-full items-center justify-between gap-7 px-4 font-[var(--font-mono)] text-[11px] font-[650] uppercase tracking-[0.06em] transition-[transform,background-color,color] duration-150 hover:-translate-y-0.5 min-[761px]:w-auto',
  {
    variants: {
      kind: {
        primary:
          'button-primary bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2b2f28]',
        ghost:
          'button-ghost border border-[var(--line)] hover:bg-[rgba(255,255,255,0.35)]',
        simple: 'button-simple hidden border border-[var(--line)]',
      },
    },
  },
);

const notes = [
  {
    index: '01',
    tag: 'MEMORY',
    title: 'Memory layout for React developers',
    excerpt:
      'A visual bridge from component trees to bytes, alignment, and the cost of pretending memory is abstract.',
    meta: '12 min · Interactive',
    href: '/blog/memory-layout-for-react-devs',
  },
  {
    index: '02',
    tag: 'RUST',
    title: 'The borrow checker is a design reviewer',
    excerpt:
      'What frontend architecture taught me about ownership—and what Rust made impossible to ignore.',
    meta: 'Draft · 8 min',
    href: '#up-next',
    disabled: true,
  },
  {
    index: '03',
    tag: 'ENGINE',
    title: 'Building the renderer before the engine',
    excerpt:
      'Notes from designing a hardware-facing graphics layer without leaking the game world into it.',
    meta: 'Field note · Soon',
    href: '#up-next',
    disabled: true,
  },
];

const experience = [
  {
    period: '2025—2026',
    company: 'Rivian · via Turing',
    role: 'Senior Software Engineer',
    summary:
      'Built typed Next.js and GraphQL tools over distributed AWS systems; designed event-driven workflows with Step Functions, EventBridge, Lambda, DynamoDB, and ECS.',
    mark: 'EV',
  },
  {
    period: '2025',
    company: 'Anthropic · via Turing',
    role: 'Software Engineering Manager',
    summary:
      'Split time between hands-on Rust, Python, and TypeScript tooling and leading RLHF delivery teams; improved training throughput 9% week over week.',
    mark: 'AI',
  },
  {
    period: '2024',
    company: 'Moxie',
    role: 'Lead Software Engineer',
    summary:
      'Led a modern TypeScript, React, Next.js, Python, and GraphQL stack; completed a zero-downtime AWS migration and designed PII protection layers.',
    mark: 'LX',
  },
  {
    period: '2023—2024',
    company: 'Keeta · via Turing',
    role: 'Senior Software Engineer',
    summary:
      'Shipped full-stack Node.js, React, and Next.js products while building low-latency blockchain components in Rust.',
    mark: 'RZ',
  },
  {
    period: '2021—2022',
    company: 'DMHealth',
    role: 'Software Projects Manager',
    summary:
      'Led fintech delivery and architecture across payment integrations, horizontally scalable GCP microservices, Flutter apps, and React dashboards.',
    mark: 'PM',
  },
  {
    period: '2021—2022',
    company: 'Stellar Global',
    role: 'Interim CTO',
    summary:
      'Led an AI-driven employment platform spanning GCP architecture, NestJS microservices, data crawlers, and a React and Next.js PWA.',
    mark: 'CT',
  },
  {
    period: '2021—2022',
    company: 'BNX Bank',
    role: 'Interim CTO',
    summary:
      'Architected distributed payment APIs with asynchronous TypeScript services and Rust components while managing the engineering team.',
    mark: 'CT',
  },
];

const projects = [
  {
    number: 'QUEST_01',
    status: 'CURRENT',
    title: 'ToyEngine',
    subtitle: 'The game engine I wanted to understand.',
    description:
      'A work-in-progress Rust engine with a renderer, ECS, editor ambitions, and an unreasonable tolerance for borrow-checker battles.',
    tags: ['RUST', 'GRAPHICS', 'ENGINE ARCHITECTURE'],
    href: 'https://github.com/halkliff/toy-engine',
  },
  {
    number: 'QUEST_02',
    status: 'AWARD',
    title: 'Fabric Living',
    subtitle: 'Earth data, housing, and a NASA weekend.',
    description:
      'Our 2019 Space Apps project mapped low-income housing growth and explored recycled textile membranes as lower-cost building material.',
    tags: ['NASA SPACE APPS', 'GLOBAL NOMINEE', 'DATA'],
    href: 'https://2019.spaceappschallenge.org/challenges/living-our-world/smash-your-sdgs/teams/uai-asan/',
  },
  {
    number: 'QUEST_03',
    status: 'ARCHIVE',
    title: 'EmaProject',
    subtitle: 'An early bot-building time capsule.',
    description:
      'A multilingual Python Telegram assistant with inline mode, database-backed users, releases, and the charming archaeology of an older codebase.',
    tags: ['PYTHON', 'TELEGRAM', 'OPEN SOURCE'],
    href: 'https://github.com/halkliff/EmaProject',
  },
];

const principles = [
  {
    number: 'I',
    title: 'Make it legible.',
    description:
      'Complexity is allowed. Confusion is a bug. The interface should teach you how it works before documentation has to.',
  },
  {
    number: 'II',
    title: 'Measure the boundary.',
    description:
      'Systems become interesting where abstractions meet: UI and API, application and infrastructure, design intent and implementation cost.',
  },
  {
    number: 'III',
    title: 'Leave evidence.',
    description:
      'Tests, types, docs, and small commits. Future maintainers deserve an explanation, not an archaeological dig.',
  },
];

export default function Home() {
  return (
    <main>
      <section
        aria-labelledby="hero-title"
        className={cn(
          'hero relative mx-auto grid w-full max-w-[1600px] grid-cols-[90px_minmax(0,1fr)_320px] overflow-hidden px-[clamp(20px,4vw,64px)] pb-25 pt-[clamp(70px,9vw,132px)] lg:min-h-0 lg:grid-cols-[80px_minmax(0,1080px)_360px] lg:gap-x-10 lg:px-0 lg:pb-28 lg:pt-32 max-lg:grid-cols-[60px_minmax(0,1fr)] max-md:block max-md:px-5 max-md:pb-22.5 max-md:pt-19',
          pageStyles.hero,
        )}
      >
        <ContentFrame className="pointer-events-none absolute inset-x-0 top-6 z-6 flex justify-end px-[clamp(20px,4vw,64px)] lg:max-w-[1600px] max-md:top-4 max-md:px-5">
          <AppearanceControls
            className="pointer-events-auto"
            labelClassName="max-md:hidden"
            placement="header"
          />
        </ContentFrame>
        <div
          aria-hidden="true"
          className="hero-grid-label relative pt-2 font-(--font-mono) text-[9px] tracking-[0.12em] [writing-mode:vertical-rl] max-md:hidden"
        >
          00. ABOUT
        </div>
        <div className="hero-copy relative z-1 col-start-2 row-start-1 max-w-220 lg:max-w-[1080px] max-md:max-w-none">
          <figure className="absolute -right-72 top-3 z-2 m-0 h-82 w-62 overflow-hidden border border-[color-mix(in_srgb,var(--acid)_55%,var(--line))] bg-(--paper) [clip-path:polygon(7%_0,100%_4%,94%_92%,18%_100%,0_74%)] after:pointer-events-none after:absolute after:inset-2.5 after:border after:border-[rgba(255,255,255,0.42)] lg:right-[-300px] lg:h-92 lg:w-70 max-lg:right-0 max-lg:top-7 max-lg:h-64 max-lg:w-52 max-md:relative max-md:right-auto max-md:top-auto [@media(min-width:500px)_and_(max-width:760px)]:-mb-12 max-[500px]:mb-8 max-md:ml-auto max-md:h-70 max-md:w-[62%] max-md:max-w-60">
            <Image
              className="block size-full object-cover [object-position:50%_34%]"
              alt="A photography depicting Werberth, the author of this website, in a casual pose with a blurred background. The image is cropped to focus on the upper body and face, highlighting a friendly and approachable demeanor."
              fill
              priority
              sizes="(max-width: 760px) 62vw, 250px"
              src="/profile-photo.webp"
            />
          </figure>
          <Typography
            as="p"
            className="mb-6 text-[11px] font-semibold tracking-[0.14em] before:mr-2.5 before:inline-block before:size-[7px] before:bg-[var(--ink)] before:content-['']"
            variant="codeLabel"
          >
            LEAD SWE · WEB → SYSTEMS
          </Typography>
          <Typography
            as="h1"
            className="m-0 max-w-[1020px] text-[clamp(56px,7.5vw,118px)] font-[570] leading-[0.86] tracking-[-0.075em] lg:max-w-lg max-lg:pr-[210px] max-md:pr-0 max-md:text-[clamp(48px,15vw,72px)] max-md:leading-[0.91]"
            id="hero-title"
            variant="h1"
          >
            Hi, I&apos;m Werberth.
            <span className="mt-3.5 block font-[480] italic leading-[inherit] text-[var(--acid)] max-md:mt-0">
              You can call me <em className="italic">Halk.</em>
            </span>
          </Typography>
          <Typography
            as="p"
            className="mt-10 max-md: text-[clamp(22px,2.4vw,34px)] font-[550] leading-[1.15] tracking-[-0.04em] lg:max-w-[860px] lg:text-[38px] max-lg:max-w-[calc(100%-210px)] max-md:max-w-none"
            variant="lead"
          >
            I build web systems, from interface to infrastructure.
          </Typography>
          <Typography
            as="p"
            className="hero-intro mt-5 max-w-[650px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] tracking-[-0.025em] lg:max-w-[820px] lg:text-[24px] max-lg:max-w-[calc(100%-210px)] max-md:mt-8 max-md:max-w-none max-md:text-base"
            variant="body"
          >
            I&apos;ve spent 10 years across the whole stack: high-craft UIs,
            APIs, cloud infrastructure, distributed workflows, and
            high-throughput systems. Lately, I&apos;ve been going deeper into
            Rust, graphics, and engine architecture.
          </Typography>
          <div className="mt-10 flex flex-wrap gap-3 max-lg:clear-both max-md:flex-col max-md:items-stretch">
            <Button
              asChild
              variant="unstyled"
              className={actionButtonVariants({ kind: 'primary' })}
            >
              <Link href="/blog/memory-layout-for-react-devs">
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  Read the field notes
                </Typography>{' '}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4"
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="unstyled"
              className={actionButtonVariants({ kind: 'ghost' })}
            >
              <a href="#workbench">
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  Inspect the machine
                </Typography>{' '}
                <ArrowDown
                  aria-hidden="true"
                  className="size-4"
                />
              </a>
            </Button>
            <Button
              asChild
              variant="unstyled"
              className={actionButtonVariants({ kind: 'simple' })}
            >
              <a href="#experience">
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  View my experience
                </Typography>{' '}
                <ArrowDown
                  aria-hidden="true"
                  className="size-4"
                />
              </a>
            </Button>
          </div>
          <div className="social-bio mt-14 max-w-190 border-t border-(--line) pt-3.5">
            <div className="max-w-175 text-[13px] leading-[1.55]">
              <Typography
                as="p"
                className="m-0 [&>b]:mx-1.25 [&>b]:font-normal [&>b]:text-[#8b8e85] dark:[&>b]:text-[#687278]"
                variant="body"
              >
                <span className="mr-2 inline-block whitespace-nowrap border border-[var(--line)] px-1.5 py-1 font-[var(--font-mono)] text-[7px] tracking-[0.1em]">
                  THE SHORT VERSION
                </span>
                Software Engineer <b>•</b> Game Engine enthusiast <b>•</b> Chief
                Evangelist for barely sane developers that like building crazy
                stuff.
              </Typography>
              <Typography
                as="div"
                className="mt-3 text-[12px] tracking-[0.025em] text-[var(--muted)] max-md:text-[14px] max-md:leading-[1.5]"
                variant="code"
              >
                No coffee. This operation runs on water, strict sleep, and our{' '}
                <CleoEgg />.
              </Typography>
            </div>
          </div>
        </div>
        <div className="hero-lower-band contents max-lg:col-start-2 max-lg:row-start-2 max-lg:grid max-lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] max-lg:items-start max-lg:gap-8 max-md:block">
          <div
            aria-label="Find Werberth online"
            className="social-dock relative z-1 col-start-2 row-start-2 mt-8 max-w-190 max-lg:col-auto max-lg:row-auto max-lg:mt-10 max-lg:max-w-none"
          >
            <Typography
              as="span"
              className="social-dock-label mb-3 block text-[10px] tracking-[0.12em] text-[#777a72] max-md:text-[11px]"
              variant="codeLabel"
            >
              FIND ME ONLINE
            </Typography>
            <SocialLinks mediumCompact />
          </div>
          <aside
            aria-label="Current focus"
            className="hero-manifest relative z-[1] col-start-3 row-span-2 row-start-1 mb-5 w-full self-end border-l border-[var(--line)] pl-6 max-lg:col-auto max-lg:row-auto max-lg:mt-10 max-lg:max-w-none max-lg:self-start max-md:border-l-0 max-md:border-t max-md:pl-0 max-md:pt-6"
          >
            <Typography
              as="p"
              className="mb-4 text-[9px] tracking-[0.13em]"
              variant="codeLabel"
            >
              CURRENT TRAJECTORY
            </Typography>
            <Typography
              as="div"
              className="mb-7 flex items-center text-[9px]"
              variant="codeLabel"
            >
              <span>WEB</span>
              <i className="mx-1.5 h-px w-5 bg-[var(--ink)] opacity-[0.36]" />
              <span>CLOUD</span>
              <i className="mx-1.5 h-px w-5 bg-[var(--ink)] opacity-[0.36]" />
              <span>RUST</span>
              <i className="mx-1.5 h-px w-5 bg-[var(--ink)] opacity-[0.36]" />
              <span>SYSTEMS</span>
            </Typography>
            <dl className="m-0">
              <div className="grid grid-cols-[86px_1fr] gap-2 border-t border-[var(--line)] py-3">
                <Typography
                  as="dt"
                  className="text-[9px] tracking-[0.08em] text-[var(--muted)]"
                  variant="codeLabel"
                >
                  STATUS
                </Typography>
                <Typography
                  as="dd"
                  className="m-0 text-xs"
                  variant="body"
                >
                  Compiling a tiny engine
                </Typography>
              </div>
              <div className="grid grid-cols-[86px_1fr] gap-2 border-t border-[var(--line)] py-3">
                <Typography
                  as="dt"
                  className="text-[9px] tracking-[0.08em] text-muted"
                  variant="codeLabel"
                >
                  LOCATION
                </Typography>
                <Typography
                  as="dd"
                  className="m-0 text-xs"
                  variant="body"
                >
                  Brazil · UTC−03
                </Typography>
              </div>
              <div className="grid grid-cols-[86px_1fr] gap-2 border-t border-(--line) py-3">
                <Typography
                  as="dt"
                  className="text-[9px] tracking-[0.08em] text-muted"
                  variant="codeLabel"
                >
                  PRINCIPLE
                </Typography>
                <Typography
                  as="dd"
                  className="m-0 text-xs"
                  variant="body"
                >
                  Clarity over cleverness
                </Typography>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section
        className="workbench-section relative bg-[#101210] px-[clamp(12px,3.5vw,56px)] pb-[clamp(76px,9vw,132px)] pt-6 text-[#ecede7] max-md:px-3"
        id="workbench"
      >
        <SectionKicker
          className="text-[#8f9489]"
          left="01. THE WORKBENCH"
          right="INTERACTIVE / TRY THE CONTROLS"
        />
        <Workbench />
      </section>

      <section
        className="experience-section bg-(--surface-muted) px-[clamp(20px,6vw,92px)] pb-[clamp(82px,10vw,150px)] pt-7"
        id="experience"
      >
        <ContentFrame>
          <SectionKicker
            className="max-w-none text-[#71746c]"
            left="02. SELECTED EXPERIENCE"
            right="FIELD EXPERIENCE / WEB TO DISTRIBUTED SYSTEMS"
          />
          <SectionIntro
            className="experience-heading"
            description="From typed interfaces to event-driven cloud systems, technical leadership, AI operations, fintech, and memory-safe infrastructure."
            eyebrow="THE WORK, NOT THE BUZZWORDS"
            title="Products that had to work in the real world."
            variant="experience"
          />
          <div className="experience-list border-t border-(--ink)">
            {experience.map((item) => (
              <ExperienceRow
                key={`${item.company}-${item.period}`}
                item={item}
              />
            ))}
          </div>
          <aside className="research-track mt-8 border border-[color-mix(in_srgb,var(--acid)_48%,var(--line))] bg-[color-mix(in_srgb,var(--acid)_12%,transparent)] p-[clamp(24px,3vw,38px)]">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-muted">
              <Typography
                as="span"
                className="text-[9px] leading-[1.35] tracking-[0.07em]"
                variant="codeLabel"
              >
                PARALLEL TRACK / 2019—2024
              </Typography>
              <Typography
                as="small"
                className="text-[9px] leading-[1.35] tracking-[0.07em] text-inherit"
                variant="caption"
              >
                CExIA · Deep Learning Brazil
              </Typography>
            </div>
            <div className="mt-6 min-w-0">
              <Typography
                as="h3"
                className="mb-3.5 mt-0 text-[clamp(24px,3vw,38px)] font-[560] tracking-[-0.045em]"
                variant="h3"
              >
                Artificial Intelligence Research Student
              </Typography>
              <Typography
                as="p"
                className="m-0 max-md: text-[13px] leading-[1.7] text-muted lg:max-w-[1100px] lg:text-[15px]"
                variant="body"
              >
                I conducted academic research focused on AI and deep-learning
                methodologies alongside my Software Engineering studies at the
                Federal University of Goiás.
              </Typography>
            </div>
          </aside>
        </ContentFrame>
      </section>

      <section
        className="projects-section bg-[#111311] px-[clamp(20px,6vw,92px)] pb-[clamp(82px,10vw,150px)] pt-7 text-[#edeee8]"
        id="projects"
      >
        <ContentFrame>
          <SectionKicker
            className="max-w-none text-[#777d73]"
            left="03. QUEST LOG"
            right="SELECTED FROM GITHUB / NO FETCH QUESTS"
          />
          <SectionIntro
            className="projects-heading"
            description="Experiments, production lessons, and one game engine slowly converting curiosity into architecture."
            eyebrow="MY FIELD INVENTORY"
            title="Crazy stuff, with commit history."
            variant="projects"
          />
          <div className="project-grid grid grid-cols-3 max-md:block">
            {projects.map((project) => (
              <ProjectCard
                key={project.title}
                project={project}
              />
            ))}
          </div>
        </ContentFrame>
      </section>

      <section
        className="writing-section px-[clamp(20px,6vw,92px)] py-[clamp(82px,10vw,150px)]"
        id="writing"
      >
        <ContentFrame>
          <SectionIntro
            className="writing-heading"
            description="Deep dives for curious builders. Plain-language entry points, rigorous endings, and interactive diagrams in between."
            eyebrow="FIELD NOTES"
            title="Writing from the layer beneath."
            variant="writing"
          />
          <div
            className="notes-list border-t border-(--ink)"
            id="up-next"
          >
            {notes.map((note) => (
              <NoteRow
                key={note.index}
                note={note}
              />
            ))}
          </div>
        </ContentFrame>
      </section>

      <section
        className="principles-section bg-(--acid) px-[clamp(20px,6vw,92px)] pb-[clamp(82px,10vw,150px)] pt-8 text-(--accent-contrast)"
        id="lab"
      >
        <ContentFrame>
          <SectionKicker
            className="max-w-none text-[rgba(23,25,22,0.58)]"
            left="04. OPERATING PRINCIPLES"
            right="STRICT MODE: ON"
          />
          <div className="principles-grid mt-20 grid grid-cols-3 max-md:mt-12 max-md:block">
            {principles.map((principle) => (
              <PrincipleCard
                key={principle.number}
                principle={principle}
              />
            ))}
          </div>
        </ContentFrame>
      </section>

      <footer className="bg-(--dark-bg) px-[clamp(20px,6vw,92px)] pb-[30px] pt-[clamp(80px,10vw,140px)] text-[var(--dark-fg)]">
        <ContentFrame>
          <div className="border-b border-[var(--dark-line)] pb-[72px]">
            <Typography
              as="p"
              className="mb-4 text-[10px] uppercase tracking-[0.08em] text-[#969b91]"
              variant="codeLabel"
            >
              Have a difficult interface or an oddly specific system?
            </Typography>
            <ContactCta />
          </div>
          <div className="grid grid-cols-2 py-[54px] pb-[76px] max-md:block">
            <div className="border-l-0 px-0 max-md:border-t max-md:border-[var(--dark-line)] max-md:py-6">
              <Typography
                as="span"
                className="mb-3 block text-[8px] tracking-[0.11em] text-[#777d73]"
                variant="codeLabel"
              >
                SYSTEM STATUS
              </Typography>
              <Typography
                as="strong"
                className="block text-[10px] font-[480]"
                variant="codeLabel"
              >
                Water + 8.0 hrs of sleep (Strict). No coffee.
              </Typography>
            </div>
            <div className="border-l border-[var(--dark-line)] px-[26px] max-md:border-l-0 max-md:border-t max-md:px-0 max-md:py-6">
              <Typography
                as="span"
                className="mb-3 block text-[8px] tracking-[0.11em] text-[#777d73]"
                variant="codeLabel"
              >
                QUALITY GATES
              </Typography>
              <Typography
                as="strong"
                className="block text-[10px] font-[480]"
                variant="codeLabel"
              >
                #![deny(missing_docs)] · CI PASSING
              </Typography>
            </div>
          </div>
          <div className="mb-[26px] grid grid-cols-2 gap-9 border-y border-[var(--dark-line)] py-6 max-md:block">
            <div className="flex items-center gap-5 max-md:justify-between max-md:py-2.5">
              <Typography
                as="span"
                className="text-[8px] tracking-[0.11em] text-[#777d73]"
                variant="codeLabel"
              >
                LAYOUT
              </Typography>
              <LandingControls />
            </div>
            <div className="flex items-center gap-5 max-md:py-2.5">
              <AppearanceControls
                className="w-full justify-between"
                placement="footer"
              />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center border-t border-[var(--dark-line)] pt-6 text-[#767b72] max-md:block">
            <Typography
              as="span"
              className="text-[8px] leading-normal tracking-[0.08em]"
              variant="codeLabel"
            >
              © 2026 WERBERTH LINS
            </Typography>
            <div className="flex gap-6 max-md:my-2.5">
              <a
                className="inline-flex items-center gap-1"
                href="https://github.com/halkliff"
              >
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  GITHUB
                </Typography>{' '}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-2.5"
                />
              </a>
              <a
                className="inline-flex items-center gap-1"
                href="https://linkedin.com/in/werberth-lins"
              >
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  LINKEDIN
                </Typography>{' '}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-2.5"
                />
              </a>
              <a
                className="inline-flex items-center gap-1"
                href="https://x.com/halkliff"
              >
                <Typography
                  as="span"
                  variant="codeLabel"
                >
                  X
                </Typography>{' '}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-2.5"
                />
              </a>
            </div>
            <Typography
              as="span"
              className="justify-self-end text-[8px] leading-normal tracking-[0.08em] max-md:justify-self-auto"
              title="Some old codes still work."
              variant="codeLabel"
            >
              CHAOTIC GOOD / BUILD 02
            </Typography>
          </div>
        </ContentFrame>
      </footer>
    </main>
  );
}
