import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { memo, useEffect, useRef } from 'react';
import type { ITerminal } from '../../types/terminal';

interface TerminalProps {
  className?: string;
  onTerminalReady?: (terminal: ITerminal) => void;
  onTerminalResize?: (cols: number, rows: number) => void;
}

export const Terminal = memo(({ className = '', onTerminalReady, onTerminalResize }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const xterm = new XTerm({
      cursorBlink: true,
      convertEol: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        cursorAccent: '#1e1e1e',
        selectionBackground: '#264f78',
        black: '#1e1e1e',
        red: '#f44747',
        green: '#6a9955',
        yellow: '#dcdcaa',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#4ec9b0',
        white: '#d4d4d4',
        brightBlack: '#808080',
        brightRed: '#f44747',
        brightGreen: '#6a9955',
        brightYellow: '#dcdcaa',
        brightBlue: '#569cd6',
        brightMagenta: '#c586c0',
        brightCyan: '#4ec9b0',
        brightWhite: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    xterm.open(terminalRef.current);

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Delay fit() to ensure terminal is fully rendered
    const fitTimeout = setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('Terminal fit error:', e);
      }
    }, 100);

    // Create terminal interface
    const terminalInterface: ITerminal = {
      cols: xterm.cols,
      rows: xterm.rows,
      reset: () => xterm.reset(),
      write: (data: string) => xterm.write(data),
      onData: (callback: (data: string) => void) => {
        xterm.onData(callback);
      },
      input: (data: string) => xterm.write(data),
    };

    onTerminalReady?.(terminalInterface);

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current && xtermRef.current) {
        try {
          fitAddonRef.current.fit();
          onTerminalResize?.(xtermRef.current.cols, xtermRef.current.rows);
        } catch (e) {
          console.warn('Terminal resize error:', e);
        }
      }
    });

    resizeObserver.observe(terminalRef.current);

    return () => {
      clearTimeout(fitTimeout);
      resizeObserver.disconnect();
      xterm.dispose();
    };
  }, [onTerminalReady, onTerminalResize]);

  return (
    <div
      ref={terminalRef}
      className={`h-full w-full bg-[#1e1e1e] ${className}`}
      style={{ padding: '8px' }}
    />
  );
});

Terminal.displayName = 'Terminal';

export default Terminal;
