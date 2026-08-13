# Halkliff portfolio & field notes

The personal site for Werberth “Halk” Lins: a highly interactive portfolio and
technical writing space about web systems, distributed infrastructure, Rust,
and game-engine architecture.

## Stack

- Next.js App Router with the standard Vercel build pipeline
- Tailwind CSS v4 with shadcn/ui-style primitives under `app/components/ui`
- `next-themes` for system-aware light/dark mode with explicit overrides
- Git-versioned MDX content with interactive React components
- Incremental Static Regeneration for published field notes

## Quick start

```bash
pnpm install
pnpm dev
```

The production checks are:

```bash
pnpm check
```

`pnpm check` runs linting, the focused component and runtime test suites, and a
production build. The tests cover stateful or computational behavior: the
memory visualizer model and UI, shared appearance and keyboard logic, reading
progress, and the browser-local code notebook component, protocol, workers,
timeouts, cancellation, and language adapters. Presentational smoke tests and
layout snapshots are intentionally omitted.

## Writing an interactive post

Each post owns its MDX, metadata, and article-specific interactive components in
its numbered route-group directory under `app/(blog)/blog/(entries)/`. The
current example is
`app/(blog)/blog/(entries)/(01_memory-layout-for-react-devs)/memory-layout-for-react-devs/`.
It is an explicitly labeled, AI-written test post used to demonstrate the
portfolio workbench's interactive MDX, local notebook runtimes, reusable
article components, and custom technical visualizations. It is not presented
as part of the human-written editorial catalog.
Its `page.tsx` exports the `post` constant used by the article, field-note index,
and sitemap, while its reading time is still derived from the MDX source at
build time. The route uses `revalidate = 300`, so Vercel can serve a static page
while regenerating it incrementally after an update. The numeric route group is
omitted from the public URL, which remains `/blog/memory-layout-for-react-devs`.
To add another note, create a `(02_your-slug)/your-slug/page.tsx` entry and
export its `post` constant; `pnpm prepare:blog` discovers the entry and
generates the typed manifest automatically. The `predev` and `prebuild` hooks
run that preparation for you.

## Components and UI primitives

Shared portfolio patterns live in `app/components/site/`: section labels and
intros, social-link destinations, portfolio rows/cards, and controlled
segmented controls. Route-specific MDX widgets stay beside the post that owns
them. The small primitives under `app/components/ui/` follow shadcn/ui's
composition model while the larger workbench and article widgets keep their
custom styling and interaction model.

## Search indexing and canonical URLs

The App Router exposes `app/robots.ts` and `app/sitemap.ts`, and each public
route publishes canonical, Open Graph, Twitter, and structured-data metadata.
The canonical production origin is `https://halkliff.dev`; set
`NEXT_PUBLIC_SITE_URL=https://halkliff.dev` in Vercel. The review mirror should
not be used as the canonical origin, and the code uses the same domain as its
local-build fallback.

## Deploying on Vercel

Import this repository into Vercel and set the project root directory to
`site/`. The checked-in `vercel.json` makes the standard Next.js framework,
`pnpm install` install, and `pnpm build` command explicit; no database or paid
add-on is required for the portfolio or MDX content.
