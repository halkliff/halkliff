'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CircleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Typography } from '@/app/components/ui/typography';
import { cn } from '@/lib/utils';
import { CodeNotebookControls } from './CodeNotebookControls';
import { CodeNotebookEditor } from './CodeNotebookEditor';
import { CodeNotebookOutput } from './CodeNotebookOutput';
import { DEFAULT_RUNTIME_LOADERS } from './runtime-loaders';
import {
  NOTEBOOK_LANGUAGE_LABELS,
  NOTEBOOK_RUNTIME_LABELS,
  RuntimeUnavailableError,
  type NotebookLanguage,
  type NotebookStatus,
  type RuntimeAdapter,
  type RuntimeLoader,
} from './types';

export type { NotebookStatus } from './types';

export interface CodeNotebookProps {
  initialSource: string;
  language: NotebookLanguage;
  runtimeLoader?: RuntimeLoader;
  title?: string;
  description?: ReactNode;
  className?: string;
  showLineNumbers?: boolean;
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The runtime returned an unknown error.';
}

function statusLabel(status: NotebookStatus, hasLoader: boolean) {
  if (status === 'loading') return 'loading runtime';
  if (status === 'running') return 'running';
  if (status === 'ready') return 'ready to run';
  if (status === 'complete') return 'complete';
  if (status === 'stopped') return 'stopped';
  if (status === 'unavailable' || !hasLoader) return 'no WASM runtime';
  if (status === 'error') return 'runtime error';
  return 'ready to run';
}

async function copySource(source: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(source);
    return;
  }

  const helper = document.createElement('textarea');
  helper.value = source;
  helper.setAttribute('readonly', 'true');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand('copy');
  helper.remove();

  if (!copied) {
    throw new Error('Copy is not available in this browser.');
  }
}

export function CodeNotebook({
  initialSource,
  language,
  runtimeLoader,
  title = 'Interactive code notebook',
  description,
  className,
  showLineNumbers = true,
}: CodeNotebookProps) {
  const [source, setSource] = useState(initialSource);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [status, setStatus] = useState<NotebookStatus>('idle');
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<RuntimeAdapter | null>(null);
  const preparationRef = useRef<Promise<boolean> | null>(null);
  const preparationControllerRef = useRef<AbortController | null>(null);
  const runControllerRef = useRef<AbortController | null>(null);
  const loader = runtimeLoader ?? DEFAULT_RUNTIME_LOADERS[language];

  const isBusy = status === 'loading' || status === 'running';

  const prepareRuntime = useCallback(async () => {
    if (preparationRef.current) return preparationRef.current;

    const controller = new AbortController();
    preparationControllerRef.current = controller;
    setStatus('loading');

    const preparation = (async () => {
      try {
        let adapter = adapterRef.current;
        if (!adapter) {
          if (!loader) throw new RuntimeUnavailableError(language);
          adapter = await loader({ signal: controller.signal });
          if (controller.signal.aborted) {
            await adapter.dispose?.();
            return false;
          }
          adapterRef.current = adapter;
        }

        const result = await adapter.prepare({ signal: controller.signal });
        if (controller.signal.aborted) return false;
        if (!result.available) {
          setStderr(result.message ?? 'This local runtime is unavailable.');
          setStatus('unavailable');
          return false;
        }

        setStatus('ready');
        return true;
      } catch (error) {
        if (controller.signal.aborted) return false;
        setStderr(errorMessage(error));
        setStatus(
          error instanceof RuntimeUnavailableError ? 'unavailable' : 'error',
        );
        return false;
      } finally {
        if (preparationControllerRef.current === controller) {
          preparationControllerRef.current = null;
        }
      }
    })();

    preparationRef.current = preparation;
    void preparation.finally(() => {
      if (preparationRef.current === preparation) preparationRef.current = null;
    });
    return preparation;
  }, [language, loader]);

  const stop = useCallback(() => {
    preparationControllerRef.current?.abort();
    preparationControllerRef.current = null;
    runControllerRef.current?.abort();
    runControllerRef.current = null;

    const adapter = adapterRef.current;
    if (adapter?.stop) void adapter.stop();

    setStatus('stopped');
  }, []);

  const run = useCallback(async () => {
    if (isBusy) {
      return;
    }

    const prepared = await prepareRuntime();
    if (!prepared || !adapterRef.current) return;

    const controller = new AbortController();
    runControllerRef.current = controller;
    setStdout('');
    setStderr('');

    try {
      setStatus('running');
      const result = await adapterRef.current.run(source, {
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      const nextStdout = result.stdout ?? '';
      const nextStderr = result.stderr ?? '';
      const failed =
        nextStderr.length > 0 ||
        (result.exitCode !== undefined && result.exitCode !== 0);

      setStdout(nextStdout);
      setStderr(nextStderr);
      setStatus(failed ? 'error' : 'complete');
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const message = errorMessage(error);
      setStderr(message);
      setStatus(
        error instanceof RuntimeUnavailableError ? 'unavailable' : 'error',
      );
    } finally {
      if (runControllerRef.current === controller) {
        runControllerRef.current = null;
      }
    }
  }, [isBusy, prepareRuntime, source]);

  const reset = useCallback(async () => {
    stop();
    setSource(initialSource);
    setStdout('');
    setStderr('');
    setCopied(false);

    try {
      await adapterRef.current?.reset?.();
      setStatus('idle');
      void prepareRuntime();
    } catch (error) {
      setStderr(errorMessage(error));
      setStatus('error');
    }
  }, [initialSource, prepareRuntime, stop]);

  const copy = useCallback(async () => {
    try {
      await copySource(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch (error) {
      setStderr(errorMessage(error));
      setStatus('error');
    }
  }, [source]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') {
      void prepareRuntime();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void prepareRuntime();
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [prepareRuntime]);

  useEffect(
    () => () => {
      preparationControllerRef.current?.abort();
      runControllerRef.current?.abort();
      void adapterRef.current?.dispose?.();
      adapterRef.current = null;
    },
    [loader],
  );

  function onNotebookKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void run();
    } else if (event.key === 'Escape' && isBusy) {
      event.preventDefault();
      stop();
    }
  }

  return (
    <Card
      ref={rootRef}
      aria-label={title}
      className={cn(
        'code-notebook min-w-0 max-w-full gap-0 rounded-none py-0 shadow-sm',
        className,
      )}
      data-code-notebook="true"
      data-language={language}
      data-runtime-state={status}
      onKeyDown={onNotebookKeyDown}
      role="region"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-4 py-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Typography
              as="h3"
              className="text-base"
              variant="large"
            >
              {title}
            </Typography>
            <Badge
              className="rounded-none border-[color-mix(in_srgb,var(--acid)_65%,var(--border))] bg-[var(--acid)] px-2 py-0.5 text-[var(--accent-contrast)]"
              data-notebook-language={language}
              variant="outline"
            >
              <Typography
                as="span"
                className="text-[10px] uppercase tracking-[0.12em]"
                variant="codeLabel"
              >
                {NOTEBOOK_LANGUAGE_LABELS[language]}
              </Typography>
            </Badge>
          </div>
          {description ? (
            <Typography
              className="max-w-[1600px]"
              variant="muted"
            >
              {description}
            </Typography>
          ) : null}
          <Typography
            className="mt-2 block max-w-full text-[10px]"
            variant="codeLabel"
          >
            {NOTEBOOK_RUNTIME_LABELS[language]}
          </Typography>
        </div>
        <Badge
          aria-live="polite"
          className="rounded-none border-border bg-muted/30 px-2 py-1 text-muted-foreground"
          data-notebook-status={status}
          variant="outline"
        >
          <span
            aria-hidden="true"
            className={cn(
              'size-2 rounded-full bg-muted-foreground',
              isBusy && 'animate-pulse bg-info',
              status === 'ready' && 'bg-success',
              status === 'error' && 'bg-destructive',
              status === 'unavailable' && 'bg-muted-foreground',
            )}
          />
          <Typography
            as="span"
            className="text-[10px] uppercase tracking-[0.1em]"
            variant="codeLabel"
          >
            {statusLabel(status, Boolean(loader))}
          </Typography>
        </Badge>
      </header>

      <CodeNotebookEditor
        ariaLabel={`${NOTEBOOK_LANGUAGE_LABELS[language]} source`}
        language={language}
        onChange={setSource}
        showLineNumbers={showLineNumbers}
        value={source}
      />
      <CodeNotebookControls
        copied={copied}
        onCopy={() => void copy()}
        onReset={() => void reset()}
        onRun={() => void run()}
        onStop={stop}
        status={status}
      />
      {status === 'unavailable' ? (
        <Alert
          className="rounded-none border-x-0 border-b-0 bg-muted/50 px-4 py-3"
          data-runtime-fallback="no-wasm"
          variant="note"
        >
          <CircleAlert aria-hidden="true" />
          <AlertDescription>
            <Typography
              className="text-sm"
              variant="muted"
            >
              This notebook is editable and copyable, but this build does not
              bundle a WASM runtime for {NOTEBOOK_LANGUAGE_LABELS[language]}{' '}
              yet.
            </Typography>
          </AlertDescription>
        </Alert>
      ) : null}
      <CodeNotebookOutput
        stderr={stderr}
        stdout={stdout}
      />
      <div
        className="sr-only"
        aria-live="polite"
      >
        {statusLabel(status, Boolean(loader))}
      </div>
    </Card>
  );
}
