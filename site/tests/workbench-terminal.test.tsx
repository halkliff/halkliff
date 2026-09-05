import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Workbench } from '@/app/components/Workbench';
import { runWorkbenchCommand } from '@/app/components/workbench-terminal';

describe('workbench terminal', () => {
  it('requires a commit for each treat and promotes after three deliveries', () => {
    let session = { commits: 0, treats: 0 };
    expect(runWorkbenchCommand('treat', session, 'main').tone).toBe('error');
    for (let i = 0; i < 3; i++) {
      session = runWorkbenchCommand('git commit', session, 'main').session;
      session = runWorkbenchCommand('treat', session, 'main').session;
    }
    expect(session).toEqual({ commits: 3, treats: 3 });
    expect(runWorkbenchCommand('review', session, 'main').output.join(' ')).toContain('exceeds treat expectations');
    expect(runWorkbenchCommand('treat', session, 'main').tone).toBe('error');
    expect(runWorkbenchCommand('clear', session, 'main').session).toEqual(session);
  });

  it('normalizes commands, uses the selected branch, and treats shell syntax as text', () => {
    const session = { commits: 0, treats: 0 };
    expect(runWorkbenchCommand('  GIT   STATUS  ', session, 'fix/reality').output[0]).toContain('fix/reality');
    expect(runWorkbenchCommand('whoami; git commit', session, 'main').tone).toBe('error');
    expect(session.commits).toBe(0);
    expect(runWorkbenchCommand('constructor', session, 'main').tone).toBe('error');
  });

  it('runs commands through the form, restores history drafts, and clears output', () => {
    render(<Workbench quickOpenNotes={[]} />);
    const input = screen.getByRole('textbox', { name: 'Terminal command' }) as HTMLInputElement;
    const output = screen.getByLabelText('Interactive terminal output');
    function run(command: string) {
      fireEvent.change(input, { target: { value: command } });
      fireEvent.submit(input.closest('form')!);
    }
    run('git commit');
    run('treat');
    expect(within(output).getByText('Treat delivered. Tail interrupts CPU.')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'unfinished' } });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('treat');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('git commit');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('unfinished');
    run('clear');
    expect(within(output).queryByText('Treat delivered. Tail interrupts CPU.')).toBeNull();
    run('git status');
    expect(within(output).getByText('Commits: 1. Treats delivered: 1.')).toBeTruthy();
  });
});
