import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { atom, type WritableAtom } from 'nanostores';
import type { ITerminal } from '../../types/terminal';

export class TerminalStore {
  #webcontainer: WebContainer | null = null;
  #terminals: Array<{ terminal: ITerminal; process: WebContainerProcess }> = [];

  showTerminal: WritableAtom<boolean> = atom(true);

  setWebContainer(webcontainer: WebContainer) {
    this.#webcontainer = webcontainer;
  }

  toggleTerminal(value?: boolean) {
    this.showTerminal.set(value !== undefined ? value : !this.showTerminal.get());
  }

  async attachTerminal(terminal: ITerminal) {
    if (!this.#webcontainer) {
      terminal.write('\x1b[33mWebContainer not initialized yet. Please wait...\x1b[0m\n');
      return;
    }

    try {
      const shellProcess = await this.#webcontainer.spawn('jsh', {
        terminal: {
          cols: terminal.cols ?? 80,
          rows: terminal.rows ?? 24,
        },
      });

      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          },
        })
      );

      const input = shellProcess.input.getWriter();

      terminal.onData((data: string) => {
        input.write(data);
      });

      this.#terminals.push({ terminal, process: shellProcess });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      terminal.write(`\x1b[31mFailed to spawn shell: ${errorMessage}\x1b[0m\n`);
    }
  }

  onTerminalResize(cols: number, rows: number) {
    for (const { process } of this.#terminals) {
      process.resize({ cols, rows });
    }
  }

  async detachTerminal(terminal: ITerminal) {
    const terminalIndex = this.#terminals.findIndex((t) => t.terminal === terminal);

    if (terminalIndex !== -1) {
      const { process } = this.#terminals[terminalIndex];

      try {
        process.kill();
      } catch (error) {
        console.warn('Failed to kill terminal process:', error);
      }
      this.#terminals.splice(terminalIndex, 1);
    }
  }
}
