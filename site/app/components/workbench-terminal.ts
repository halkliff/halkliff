export type TerminalSession = { commits: number; treats: number };

export type TerminalResult = {
  output: string[];
  tone?: 'normal' | 'error';
  clear?: boolean;
  session: TerminalSession;
};

const commands: Record<string, readonly string[]> = {
  help: [
    'Portfolio sandbox. Commands here are pretend. The dog is real.',
    'whoami · quest · stack · coffee · water · sleep · cleo',
    'git status · git commit · treat · review · cargo build · clear',
    '↑ / ↓ recalls commands. Try help --all if you hate surprises.',
  ],
  'help --all': [
    'Also try: ls · pwd · cat README.md · sudo · sudo whoami',
    'cargo test · cargo run · rustc --explain E0502 · npm install confidence',
    'quaternion · python · fortune · roast · favicon · eslint · ping · exit · rm -rf /',
    'Management loop: git commit → treat → review. Repeat at your own risk.',
  ],
  whoami: [
    'Werberth Lins / Halk. Software engineer. Digital Chaos Manager.',
    'Could have used a game engine. Decided to become its entire engineering department.',
    'Writes Rust without coffee, then acts like the borrow checker is the unreasonable one.',
    'Built a terminal inside his portfolio. You are now participating in the problem.',
    'For the performance review nobody requested: roast.',
  ],
  roast: [
    'Built interactive memory diagrams. Forgot the favicon.',
    'Gave the dog a job title, a portrait, and a compensation policy. Then enlarged the portrait. Management won.',
    'Upgraded every dependency. Discovered that latest is not a compatibility strategy.',
    'Asked an AI to remove the AI writing, then supervised the jokes. Honestly, fair.',
    'Will spend six hours removing an abstraction and twelve explaining why it had to go.',
  ],
  favicon: ['16 pixels. The final boss of a systems engineering portfolio.', 'It is here now. Please let him have this.'],
  eslint: ['context.getFilename is not a function.', 'Werberth has several words for this. None pass the corporate tone checker.'],
  quest: [
    'Main quest: build ToyEngine. Renderer, ECS, editor. A normal, relaxing hobby.',
    'Side quest: explain why the triangles look like that.',
    'Final boss: finishing a side project before inventing another subsystem.',
    'Loot: github.com/halkliff/toy-engine',
  ],
  stack: [
    'TypeScript / React / Next.js / Python / AWS / Rust',
    'Dependencies: water, sleep, one small dog with executive privileges.',
  ],
  coffee: ['coffee: command not found.', 'This developer runs on water. Yes, the bugs are fully organic.'],
  water: ['Hydration restored.', 'Still cannot derive a quaternion from vibes.'],
  sleep: ['8 hours requested. Brain scheduled a renderer rewrite at 02:00.', 'Request denied. Go to bed, Werberth.'],
  cleo: [
    'Cleo / Chief Emotional Support Officer / root access',
    'learning_rate: excessive. Threat model: her own shadow.',
    'Policy: no commit, no treat. Try git commit, then treat.',
    'Photo: click Chief Emotional Support Officer above the workbench.',
  ],
  'cargo build': [
    'Compiling toy-engine (imaginary build)...',
    'error[E0502]: cannot borrow weekend as mutable; employer still holds a reference.',
    'help: try sleep. Do not add another lifetime parameter to your calendar.',
  ],
  'cargo test': ['running 3 imaginary tests', 'hydration ... ok', 'dog_is_in_charge ... ok', 'scope_is_under_control ... FAILED'],
  'cargo run': ['Launching imaginary renderer...', 'Triangle detected. Orientation: legally a suggestion.', 'Try quaternion.'],
  quaternion: ['Four numbers. Three dimensions. Zero confidence.', 'The triangle is upside down because you multiplied in the other order. Probably.'],
  'rustc --explain e0502': ['You want to change something while someone else is still looking at it.', 'Rust says no. React calls it a Tuesday.'],
  'npm install confidence': ['404: confidence not found.', 'Installing impostor-syndrome instead. 847 transitive dependencies.'],
  python: ['>>> import antigravity', 'Before the game loops, there were matrices.', 'The matrices also refused to explain themselves.'],
  sudo: ['Permission denied. Cleo is in the sudoers file. You are in the treat dispensers file.'],
  'sudo whoami': ['root: Cleo', 'Werberth has been granted temporary keyboard privileges.'],
  ls: ['toy-engine/   field-notes/   definitely-final-v7/   treats.lock', 'Try cat README.md.'],
  pwd: ['/home/halk/one-small-side-project'],
  'cat readme.md': ['Digital Chaos Manager. Game Engine "Architect".', 'No caffeine. Suspicious triangles. A Shih-Tzu with veto power.', 'For the long version: github.com/halkliff'],
  fortune: ['You will fix the bug.', 'The fix will require deleting the abstraction you were proudest of.'],
  ping: ['pong. No network request made. Even this portfolio respects your latency budget.'],
  exit: ['You can close the tab. Werberth cannot close the scope.'],
  'rm -rf /': ['Nice try. This is a pretend terminal.', 'Cleo has backed up the treats. Your dignity was not included.'],
};

/** Resolve fictional commands without executing code or accessing the host. */
export function runWorkbenchCommand(
  input: string,
  session: TerminalSession,
  branch: string,
): TerminalResult {
  const command = input.trim().replace(/\s+/g, ' ').toLowerCase();
  if (command === 'clear') return { output: [], clear: true, session };
  if (command === 'git status') {
    return { session, output: [
      `On imaginary branch ${branch}`,
      `Commits: ${session.commits}. Treats delivered: ${session.treats}.`,
      `${session.commits - session.treats} treat credits pending. Management is watching.`,
    ] };
  }
  if (command === 'git commit') {
    return { session: { ...session, commits: session.commits + 1 }, output: [
      `[${branch}] fix: convince triangle to face forward`,
      'Imaginary commit accepted. One treat credit earned. Try treat.',
    ] };
  }
  if (command === 'treat') {
    if (session.treats >= session.commits) {
      return { session, tone: 'error', output: ['Treat denied. No commit, no treat.', 'Management suggests git commit. Management does not accept excuses.'] };
    }
    const treats = session.treats + 1;
    return { session: { ...session, treats }, output: [
      'Treat delivered. Tail interrupts CPU.',
      treats === 1 ? 'Cleo has approved your continued employment. Try review.'
        : treats === 2 ? 'Second treat accepted. You are now Senior Treat Engineer.'
          : 'Achievement unlocked: Staff Treat Engineer. Still reports to a Shih-Tzu.',
    ] };
  }
  if (command === 'review') {
    return { session, output: session.treats === 0
      ? ['Performance review: no treats on record.', 'Promotion blocked by upper management. Upper management is 30cm tall.']
      : [`Treats delivered: ${session.treats}. Code quality: not sniffed.`,
        session.treats >= 3 ? 'Rating: exceeds treat expectations. Equity package: one tennis ball.'
          : 'Rating: adequate human. Promotion requires 3 treats.'] };
  }
  const output = Object.hasOwn(commands, command) ? commands[command] : undefined;
  return output
    ? { session, output: [...output] }
    : { session, tone: 'error', output: [`${input.trim()}: command not found. Try help.`, 'Inventing your own tooling is how Werberth got into this mess.'] };
}
