export interface ITerminal {
  readonly cols?: number;
  readonly rows?: number;
  reset: () => void;
  write: (data: string) => void;
  onData: (callback: (data: string) => void) => void;
  input: (data: string) => void;
}
