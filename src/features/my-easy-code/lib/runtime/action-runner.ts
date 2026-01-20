/**
 * Action runner for executing bolt actions in WebContainer
 */

import type { WebContainer } from '@webcontainer/api';
import type { BoltAction, BoltArtifact } from './message-parser';
import { createScopedLogger } from '../../utils/logger';
import { WORK_DIR } from '../../utils/constants';

const logger = createScopedLogger('ActionRunner');

export interface ActionRunnerOptions {
  webcontainer: WebContainer;
  onFileCreated?: (filePath: string) => void;
  onShellOutput?: (output: string) => void;
  onServerReady?: (url: string, port: number) => void;
  onError?: (error: Error) => void;
  onBuildError?: (errorMessage: string) => void;
}

// Error patterns to detect in terminal output
const ERROR_PATTERNS = [
  /error TS\d+:/i,                    // TypeScript errors
  /SyntaxError:/i,                     // Syntax errors
  /ReferenceError:/i,                  // Reference errors (like "Cannot access before initialization")
  /TypeError:/i,                       // Type errors
  /Cannot find module/i,               // Module not found
  /Failed to resolve import/i,         // Import resolution errors
  /ENOENT.*no such file/i,            // File not found
  /Unexpected token/i,                 // Parse errors
  /Cannot access .* before initialization/i, // Hoisting errors
  /is not defined/i,                   // Undefined variables
  /Cannot read propert/i,              // Property access errors
  /Module parse failed/i,              // Webpack/Vite parse errors
  /error:/i,                           // Generic error label
];

export class ActionRunner {
  private webcontainer: WebContainer;
  private onFileCreated?: (filePath: string) => void;
  private onShellOutput?: (output: string) => void;
  private onServerReady?: (url: string, port: number) => void;
  private onError?: (error: Error) => void;
  private onBuildError?: (errorMessage: string) => void;
  private serverUrl?: string;
  private errorBuffer: string[] = [];
  private lastErrorTime = 0;

  constructor(options: ActionRunnerOptions) {
    this.webcontainer = options.webcontainer;
    this.onFileCreated = options.onFileCreated;
    this.onShellOutput = options.onShellOutput;
    this.onServerReady = options.onServerReady;
    this.onError = options.onError;
    this.onBuildError = options.onBuildError;

    // Listen for server-ready events
    this.webcontainer.on('server-ready', (port: number, url: string) => {
      logger.info('Server ready on port', port, 'at', url);
      this.serverUrl = url;
      this.onServerReady?.(url, port);
    });
  }

  /**
   * Check if output contains an error pattern
   */
  private detectError(output: string): boolean {
    return ERROR_PATTERNS.some(pattern => pattern.test(output));
  }

  /**
   * Process shell output for error detection
   */
  private processOutputForErrors(output: string): void {
    if (this.detectError(output)) {
      // Store error in buffer
      this.errorBuffer.push(output);
      this.lastErrorTime = Date.now();
      console.log('[ActionRunner] Error detected in output:', output.substring(0, 200));
    }
  }

  /**
   * Flush error buffer and notify if there are errors
   */
  flushErrorBuffer(): string | null {
    if (this.errorBuffer.length === 0) return null;

    const errorMessage = this.errorBuffer.join('\n');
    this.errorBuffer = [];
    return errorMessage;
  }

  /**
   * Check if there are pending errors
   */
  hasErrors(): boolean {
    return this.errorBuffer.length > 0;
  }

  /**
   * Clear error buffer
   */
  clearErrors(): void {
    this.errorBuffer = [];
  }

  /**
   * Run all actions from an artifact
   */
  async runArtifact(artifact: BoltArtifact): Promise<void> {
    console.log('[ActionRunner] Running artifact:', artifact.title);
    console.log('[ActionRunner] Actions count:', artifact.actions.length);
    console.log('[ActionRunner] Actions:', JSON.stringify(artifact.actions.map((a) => ({
      type: a.type,
      ...(a.type === 'file' ? { filePath: a.filePath, contentLength: a.content.length } : {}),
      ...(a.type === 'shell' || a.type === 'start' ? { command: a.command } : {}),
    })), null, 2));

    // Separate file actions from shell/start actions
    const fileActions = artifact.actions.filter(a => a.type === 'file');
    const shellActions = artifact.actions.filter(a => a.type === 'shell' || a.type === 'start');

    console.log('[ActionRunner] File actions:', fileActions.length);
    console.log('[ActionRunner] Shell/Start actions:', shellActions.length);

    this.onShellOutput?.(`\x1b[35m📦 Processando ${artifact.actions.length} ações (${fileActions.length} arquivos)...\x1b[0m\n`);

    // First, create ALL files
    for (let i = 0; i < fileActions.length; i++) {
      const action = fileActions[i];
      if (action.type === 'file') {
        const actionDesc = `file: ${action.filePath}`;
        console.log(`[ActionRunner] Creating file ${i + 1}/${fileActions.length}:`, actionDesc);
        this.onShellOutput?.(`\x1b[90m[${i + 1}/${fileActions.length}] ${actionDesc}\x1b[0m\n`);

        await this.runFileAction(action.filePath, action.content);
      }
    }

    // List files to verify they were created
    console.log('[ActionRunner] Verifying files were created...');
    try {
      const rootFiles = await this.webcontainer.fs.readdir('.', { withFileTypes: true });
      console.log('[ActionRunner] Root directory contents:', rootFiles.map(f => f.name));

      // Check for src directory
      const hasSrc = rootFiles.some(f => f.name === 'src' && f.isDirectory());
      if (hasSrc) {
        const srcFiles = await this.webcontainer.fs.readdir('src', { withFileTypes: true });
        console.log('[ActionRunner] src/ contents:', srcFiles.map(f => f.name));
      } else {
        console.warn('[ActionRunner] WARNING: src/ directory not found!');
      }
    } catch (err) {
      console.error('[ActionRunner] Error listing files:', err);
    }

    this.onShellOutput?.(`\x1b[32m✅ ${fileActions.length} arquivos criados!\x1b[0m\n`);

    // Then, run shell/start commands
    for (let i = 0; i < shellActions.length; i++) {
      const action = shellActions[i];
      if (action.type === 'shell' || action.type === 'start') {
        const actionDesc = `${action.type}: ${action.command}`;
        console.log(`[ActionRunner] Running command ${i + 1}/${shellActions.length}:`, actionDesc);
        this.onShellOutput?.(`\x1b[90m[cmd ${i + 1}/${shellActions.length}] ${actionDesc}\x1b[0m\n`);

        if (action.type === 'shell') {
          await this.runShellAction(action.command);
        } else {
          await this.runStartAction(action.command);
        }
      }
    }

    console.log('[ActionRunner] Artifact completed:', artifact.title);
    this.onShellOutput?.(`\x1b[32m✅ Projeto concluído!\x1b[0m\n`);
  }

  /**
   * Run a single action
   */
  async runAction(action: BoltAction): Promise<void> {
    try {
      switch (action.type) {
        case 'file':
          await this.runFileAction(action.filePath, action.content);
          break;
        case 'shell':
          await this.runShellAction(action.command);
          break;
        case 'start':
          await this.runStartAction(action.command);
          break;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Action failed:', err);
      this.onError?.(err);
    }
  }

  /**
   * Create or update a file
   */
  private async runFileAction(filePath: string, content: string): Promise<void> {
    console.log('[ActionRunner] Creating file:', filePath, 'content length:', content.length);

    // Normalize path (remove leading slash if present, add WORK_DIR)
    const normalizedPath = filePath.startsWith('/')
      ? filePath.slice(1)
      : filePath;

    console.log('[ActionRunner] Normalized path:', normalizedPath);

    // Create directories if needed
    const parts = normalizedPath.split('/');
    if (parts.length > 1) {
      const dirPath = parts.slice(0, -1).join('/');
      console.log('[ActionRunner] Creating directories:', dirPath);
      await this.createDirectories(dirPath);
    }

    // Write file
    console.log('[ActionRunner] Writing file to WebContainer...');
    await this.webcontainer.fs.writeFile(normalizedPath, content);
    console.log('[ActionRunner] File written successfully:', normalizedPath);

    this.onFileCreated?.(normalizedPath);
  }

  /**
   * Create directories recursively
   */
  private async createDirectories(dirPath: string): Promise<void> {
    const parts = dirPath.split('/');
    let currentPath = '';

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      try {
        await this.webcontainer.fs.mkdir(currentPath);
      } catch {
        // Directory might already exist, ignore error
      }
    }
  }

  /**
   * Run a shell command
   */
  private async runShellAction(command: string): Promise<void> {
    console.log('[ActionRunner] Running shell command:', command);
    this.onShellOutput?.(`\x1b[33m$ ${command}\x1b[0m\n`);

    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    console.log('[ActionRunner] Spawning:', cmd, args);

    try {
      const process = await this.webcontainer.spawn(cmd, args);
      console.log('[ActionRunner] Process spawned');

      // Stream output without waiting for close (some streams don't close properly)
      process.output.pipeTo(
        new WritableStream({
          write: (chunk) => {
            console.log('[ActionRunner] Shell output chunk:', chunk.substring(0, 100));
            this.onShellOutput?.(chunk);
            // Check for errors in output
            this.processOutputForErrors(chunk);
          },
        })
      ).catch((err) => {
        console.log('[ActionRunner] Output stream ended:', err?.message || 'completed');
      });

      // Wait for process to complete
      console.log('[ActionRunner] Waiting for process exit...');
      const exitCode = await process.exit;
      console.log('[ActionRunner] Process exited with code:', exitCode);

      if (exitCode !== 0) {
        const errorMsg = `Command failed with exit code ${exitCode}: ${command}`;
        this.onShellOutput?.(`\x1b[31m${errorMsg}\x1b[0m\n`);
        throw new Error(errorMsg);
      }

      // Check if there were any errors even with exit code 0
      // Sometimes npm install succeeds but has warnings that are actually errors
      if (this.hasErrors()) {
        const errors = this.flushErrorBuffer();
        if (errors) {
          console.log('[ActionRunner] Errors detected during command execution');
          this.onBuildError?.(errors);
        }
      }

      this.onShellOutput?.(`\x1b[32m✓ ${command} completed\x1b[0m\n`);
    } catch (error) {
      console.error('[ActionRunner] Shell error:', error);
      throw error;
    }
  }

  /**
   * Run a start command (server)
   */
  private async runStartAction(command: string): Promise<void> {
    console.log('[ActionRunner] Starting server:', command);
    this.onShellOutput?.(`\x1b[36m$ ${command} (starting server...)\x1b[0m\n`);

    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    console.log('[ActionRunner] Spawning server:', cmd, args);

    try {
      const process = await this.webcontainer.spawn(cmd, args);
      console.log('[ActionRunner] Server process spawned');

      // Track if we've seen errors but server might still start
      let errorTimeout: ReturnType<typeof setTimeout> | null = null;

      // Stream output (don't wait for completion, server runs indefinitely)
      process.output.pipeTo(
        new WritableStream({
          write: (chunk) => {
            console.log('[ActionRunner] Server output:', chunk.substring(0, 100));
            this.onShellOutput?.(chunk);
            // Check for errors in output
            this.processOutputForErrors(chunk);

            // If we detect errors, wait a bit then notify
            // This allows time for the full error message to be captured
            if (this.hasErrors()) {
              if (errorTimeout) clearTimeout(errorTimeout);
              errorTimeout = setTimeout(() => {
                const errors = this.flushErrorBuffer();
                if (errors) {
                  console.log('[ActionRunner] Build errors detected during dev server startup');
                  this.onBuildError?.(errors);
                }
              }, 2000); // Wait 2 seconds to collect full error output
            }
          },
        })
      );

      // Give the server a moment to start and emit server-ready
      console.log('[ActionRunner] Server started, waiting for server-ready event...');
    } catch (error) {
      console.error('[ActionRunner] Server start error:', error);
      throw error;
    }
  }

  /**
   * Get the current server URL
   */
  getServerUrl(): string | undefined {
    return this.serverUrl;
  }
}
