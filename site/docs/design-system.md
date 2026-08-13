# Halkliff design system

This document is the implementation contract for the portfolio, field notes,
and interactive article components. It records the decisions that survived the
visual review process; it is not a catalogue of every class currently in the
codebase.

## Voice and content

- Write in first person. Werberth and Halk are the same person; `Halk` is the
  normal form of the nickname.
- The introduction is `Hi, I'm Werberth. You can call me Halk.`
- Describe the work as full-stack systems engineering: interfaces, APIs,
  backend, cloud, distributed and high-throughput systems, Rust, graphics, and
  engine architecture. Do not reduce the experience to frontend work.
- Prefer clear language with a playful technical edge. Complexity is welcome;
  confusion is not.
- Use `Software Engineer` in reader-facing copy. Abbreviations such as `SWE`
  belong only in compact technical labels where space is genuinely constrained.
- Social links and contact routes must be easy to find in both fancy and simple
  layouts.

## Tailwind and CSS ownership

- Tailwind utilities are the default implementation language.
- `app/globals.css` owns only reset/base behavior, fonts, theme/design tokens,
  color-scheme integration, and truly document-global behavior.
- Component-specific CSS belongs beside the component and is reserved for
  behavior that is materially clearer in CSS than Tailwind (for example,
  authored prose descendants or complex generated-code selectors).
- Prefer named Tailwind utilities. Use arbitrary values only for an externally
  defined token, a measured geometric requirement, or a layout rule that the
  Tailwind scale cannot express faithfully.
- Spacing follows Tailwind's standard 4px scale. There is no additional rule
  requiring all spacing to be a multiple of 16px.
- Do not move local component rules into global CSS merely to shorten a
  `className`.

## Color and theming

- Follow the device color preference by default and allow an explicit system,
  light, or dark override through the shared appearance control.
- The primary accent is the grey-blue family centered around `rgb(99 154 182)`.
  Do not reintroduce vivid yellow as the site accent.
- Foundational surfaces, borders, text, focus rings, and semantic colors use
  shared theme tokens. Avoid scattering raw palette values through components.
- Light and dark themes must be designed and contrast-checked independently;
  dark mode is not a simple inversion.
- Static code and editable notebook source use the same syntax surface:
  Catppuccin Latte `#eff1f5` in light mode and Catppuccin Mocha `#1e1e2e` in
  dark mode. Syntax token colors use the matching Shiki theme.
- The workbench may retain a deliberate terminal/IDE palette where those colors
  describe the simulated environment rather than the general site chrome.

## Shape, borders, and elevation

- The core visual language is rectilinear. Cards, article tools, code blocks,
  notebooks, alerts, diagrams, panels, navigation surfaces, and content frames
  have square corners.
- Rounded shapes are intentional exceptions: tactile segmented-control buttons,
  key caps, status dots, avatars, profile masks, and semantic controls whose
  shape communicates interaction.
- Containers use quiet one-pixel borders from theme tokens.
- Ordinary cards use only subtle elevation (`shadow-sm`, approximately
  elevation 1-2). Heavy shadows are reserved for true overlays such as dialogs,
  floating consoles, command palettes, and toasts.
- Avoid decorative gradients or glass effects that compete with the content.

## Typography

- All authored visible text composes the shared `Typography` primitive. Purely
  structural glyphs and generated machine data do not need wrappers.
- Preserve semantic elements through the polymorphic `as` API. A visual variant
  must not force an incorrect heading level.
- Interface typography uses Geist Sans; technical labels, metadata, keyboard
  hints, commands, addresses, code labels, and metrics use Geist Mono or Fira
  Code Nerd Font where the content is source code.
- Field-note prose uses explicit editorial serif variants rather than local
  font-family overrides. The shared variants cover article display titles,
  heading levels, lead/deck text, prose body, blockquotes/pull quotes, captions,
  bylines/meta, inline code, and code labels.
- Reading text keeps a comfortable line length and generous line height. The
  table of contents must never reduce or shift the centered article column.
- Small technical labels remain legible: compact does not mean invisible.

## Components and reuse

- Use owned shadcn/ui primitives as the foundation when an appropriate primitive
  exists. Customize their source to this design system rather than rebuilding
  the interaction ad hoc.
- Shared behavior must have one implementation. This includes appearance and
  layout selectors, button groups, buttons, cards, alerts, keyboard hints,
  blog back navigation, article headings/deep links, table of contents,
  previous/next navigation, static code blocks, and notebook surfaces.
- Use Lucide for symbolic interface icons. Use the proper brand icon for X,
  GitHub, LinkedIn, and other branded destinations.
- Interactive elements expose the correct pointer, focus, keyboard, disabled,
  and accessible-name behavior.
- Platform-specific shortcut labels are derived by the shared `Kbd` logic.

## Responsive layout

- Center major content frames on large 4K and ultrawide screens. Do not stretch
  editorial or portfolio content merely because more viewport width exists.
- Full-bleed section backgrounds may span the viewport, but meaningful homepage
  and blog-index content is capped at a centered `1600px` frame. Space beyond
  that frame becomes symmetrical outer gutter; it must never be inserted between
  related elements inside the composition.
- At `1600px` and wider, do not force a section to fill `100svh` when its content
  is shorter. Let the section use its authored vertical rhythm so tall 16:9 and
  ultrawide displays reveal the next section instead of creating an empty middle.
- Below `1600px`, `100svh` remains valid for immersive homepage sections when the
  content fits without clipping; mobile-specific exceptions may still use natural
  height. Treat `1600px` as the deliberate hand-off between viewport-led and
  content-led composition.
- Wide editorial section introductions should use the full frame width. Stack
  the supporting paragraph below the heading when a split-column arrangement
  would create a large unused region above or beside it.
- Use Tailwind's standard breakpoints by default. Keep custom 760px, 1080px, or
  1600px transitions only where visual evidence shows a composition needs that
  exact hand-off.
- Wide layouts use their available space deliberately: headings and supporting
  copy can expand, but text line length remains bounded.
- Medium layouts may pair `Find me online` with `Current trajectory`; social
  links form two columns when that uses the available whitespace better.
- Mobile layouts stack deliberately. The profile photo appears above the main
  greeting and snaps to the right when room permits. The current trajectory
  remains present rather than disappearing.
- Hidden desktop sidebars become an inline collapsible sidebar or an appropriate
  mobile surface; content is not silently removed.
- Avoid accidental component-level horizontal scrolling. A code/data visual may
  scroll internally only when the data cannot remain legible after reflow.

## Portfolio behavior

- Fancy/simple layout selection appears in the footer and in the first-visit
  prompt, not as permanent top-bar clutter.
- The first-visit layout prompt uses the shared toast and shared segmented
  control. Dismissal and preference changes must not create state-update loops.
- The theme selector is available in the hero, blog chrome, and footer through
  the same appearance component and variants.
- Cleo's detail is click-driven. Desktop may use an anchored floating card;
  mobile uses an alert-dialog card with the photo above the copy. Opening or
  closing it must not change the scroll position.
- The workbench command palette, draggable console, tabs, diagnostics sidebar,
  and terminal retain working keyboard/pointer behavior across breakpoints.

## Field notes

- Field notes live under `/blog`; route-group and filesystem ordering metadata
  must not leak into public URLs.
- The article header, body, sticky chrome, and footer share the same outer
  gutter. The main prose column stays centered independently of the left
  `On this page` rail.
- `On this page`, back navigation, deep-link headings, alerts, previous/next
  navigation, static code blocks, and interactive notebooks are reusable blog
  components.
- The top and bottom back actions share one route-aware implementation. Direct
  article visits fall back to the field-notes index.
- Previous/next navigation renders only real published destinations. Draft or
  upcoming notes use an obvious disabled state.
- Article reading time is derived from content during prerendering, not typed by
  hand. Reading progress remains legible and unobtrusive.
- GitHub-style article alerts support note/info, tip, important, warning/caution,
  and danger variants with aligned icons and compact content spacing.

## Code and interactive articles

- Static code is highlighted during the server/static build with Shiki.
- Editable notebooks highlight on the client and lazily load only the selected
  language runtime. Pages without a notebook do not pay for notebook runtimes.
- Runtime execution remains isolated from the page context, bounded, cancellable,
  and terminated on timeout. Never fake an unsupported browser runtime with a
  server execution path.
- Runtime and language versions are stated explicitly without implying a Node
  runtime when QuickJS is used.
- Static snippets and notebook editors share Catppuccin surfaces, token colors,
  Fira Code Nerd Font, optional line numbers, card treatment, and spacing.
- Notebook stdout and stderr use tabs and fill the available output surface.
- Article-specific interactive diagrams use the application tokens, remain
  inside the article width, adapt on mobile, and expose sufficient contrast in
  both themes.

## Verification

- Check light, dark, and system themes at mobile, medium, desktop, 4K, and an
  ultrawide-sized viewport.
- Verify no unexpected horizontal overflow, hidden essential content, illegible
  hover state, or theme-specific contrast regression.
- Run scoped lint and TypeScript checks while editing, then the production build
  and regression suite before handoff.
- Layout snapshots protect known composition. Review snapshot diffs; never
  regenerate them solely to make a failing test green.
- Preserve unrelated work in a dirty tree and keep commits narrowly scoped.
