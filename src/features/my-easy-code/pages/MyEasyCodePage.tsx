import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Code2, Loader2, PanelLeft, PanelLeftClose } from 'lucide-react';
import { Chat, type ChatRef } from '../components/chat';
import { Workbench } from '../components/workbench';
import { workbenchStore, filesStore, terminalStore } from '../lib/stores';
import { getWebContainer, checkWebContainerSupport } from '../lib/webcontainer';
import { ActionRunner } from '../lib/runtime';
import type { BoltArtifact } from '../lib/runtime';
import type { ITerminal } from '../types/terminal';

interface MyEasyCodePageProps {
  onBack?: () => void;
}

export function MyEasyCodePage({ onBack }: MyEasyCodePageProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [actionRunner, setActionRunner] = useState<ActionRunner | null>(null);
  const [isRunningActions, setIsRunningActions] = useState(false);
  const terminalRef = useRef<ITerminal | null>(null);
  const chatRef = useRef<ChatRef>(null);
  const initStartedRef = useRef(false);
  const errorRetryCountRef = useRef(0);

  // Initialize WebContainer
  useEffect(() => {
    // Prevent double initialization from React StrictMode
    if (initStartedRef.current) {
      console.log('[MyEasyCode] Init already started, skipping...');
      return;
    }
    initStartedRef.current = true;

    const init = async () => {
      try {
        // Check support first
        const support = checkWebContainerSupport();
        if (!support.supported) {
          throw new Error(support.reason);
        }

        console.log('[MyEasyCode] Initializing WebContainer...');
        const webcontainer = await getWebContainer();

        // Set webcontainer in terminalStore
        terminalStore.setWebContainer(webcontainer);

        // Listen for runtime errors from preview (React errors, etc.)
        webcontainer.on('error', (error: { message: string }) => {
          console.log('[MyEasyCode] Runtime error from preview:', error.message);
          // Only trigger auto-fix for actual code errors, not network errors
          if (
            error.message.includes('TypeError') ||
            error.message.includes('ReferenceError') ||
            error.message.includes('SyntaxError') ||
            error.message.includes('is not a function') ||
            error.message.includes('is not defined') ||
            error.message.includes('Cannot read')
          ) {
            if (terminalRef.current) {
              terminalRef.current.write(`\x1b[31m⚠️ Runtime Error: ${error.message}\x1b[0m\n`);
            }
            // Trigger auto-fix
            if (chatRef.current && errorRetryCountRef.current < 3) {
              chatRef.current.sendErrorFix(error.message, errorRetryCountRef.current);
              errorRetryCountRef.current += 1;
            }
          }
        });

        // Create action runner
        const runner = new ActionRunner({
          webcontainer,
          onFileCreated: (filePath) => {
            console.log('[MyEasyCode] File created:', filePath);
            // Refresh file list
            refreshFiles(webcontainer);
          },
          onShellOutput: (output) => {
            console.log('[MyEasyCode] Shell:', output);
            // Write output to terminal if available
            if (terminalRef.current) {
              terminalRef.current.write(output);
            }
          },
          onServerReady: (url, port) => {
            console.log('[MyEasyCode] Server ready:', url, port);
            workbenchStore.setPreviewUrl(url);
            setIsRunningActions(false);
          },
          onError: (error) => {
            console.error('[MyEasyCode] Action error:', error);
            if (terminalRef.current) {
              terminalRef.current.write(`\x1b[31mError: ${error.message}\x1b[0m\n`);
            }
            setIsRunningActions(false);
          },
          onBuildError: (errorMessage) => {
            console.log('[MyEasyCode] Build error detected, triggering auto-fix');
            if (terminalRef.current) {
              terminalRef.current.write(`\x1b[33m⚠️ Erro detectado! Tentando corrigir automaticamente...\x1b[0m\n`);
            }
            // Trigger auto-fix via Chat component
            if (chatRef.current) {
              chatRef.current.sendErrorFix(errorMessage, errorRetryCountRef.current);
              errorRetryCountRef.current += 1;
            }
          },
        });

        setActionRunner(runner);
        setIsInitializing(false);
        console.log('[MyEasyCode] Ready!');
      } catch (error) {
        console.error('[MyEasyCode] Init error:', error);
        setInitError(
          error instanceof Error
            ? error.message
            : 'Erro ao inicializar ambiente de desenvolvimento'
        );
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  // Folders to ignore when reading files
  const IGNORED_FOLDERS = ['node_modules', '.git', 'dist', 'build', '.cache', '.vite'];

  // Refresh files from WebContainer
  const refreshFiles = async (webcontainer: Awaited<ReturnType<typeof getWebContainer>>) => {
    try {
      console.log('[MyEasyCode] Refreshing files from WebContainer...');

      const readDir = async (path: string = '') => {
        const entries = await webcontainer.fs.readdir(path || '.', {
          withFileTypes: true,
        });

        for (const entry of entries) {
          // Skip ignored folders
          if (IGNORED_FOLDERS.includes(entry.name)) {
            console.log('[MyEasyCode] Skipping ignored folder:', entry.name);
            continue;
          }

          const fullPath = path ? `${path}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            console.log('[MyEasyCode] Adding folder:', fullPath);
            filesStore.setFile(fullPath, { type: 'folder' });
            await readDir(fullPath);
          } else {
            try {
              const content = await webcontainer.fs.readFile(fullPath, 'utf-8');
              console.log('[MyEasyCode] Adding file:', fullPath);
              filesStore.setFile(fullPath, { type: 'file', content });
            } catch (err) {
              console.warn('[MyEasyCode] Could not read file:', fullPath, err);
            }
          }
        }
      };

      await readDir();
      console.log('[MyEasyCode] Files refresh complete');
    } catch (error) {
      console.error('[MyEasyCode] Error refreshing files:', error);
    }
  };

  // Handle artifact from chat
  const handleArtifact = useCallback(
    async (artifact: BoltArtifact) => {
      if (!actionRunner) {
        console.warn('[MyEasyCode] ActionRunner not ready');
        return;
      }

      console.log('[MyEasyCode] Running artifact:', artifact.title);
      console.log('[MyEasyCode] Actions:', artifact.actions.map(a => a.type));
      setIsRunningActions(true);

      // Clear any previous errors when receiving new artifact
      actionRunner.clearErrors();
      // Reset retry count for new user-initiated artifacts (not auto-fixes)
      if (!artifact.title.toLowerCase().includes('fix') && !artifact.title.toLowerCase().includes('correção')) {
        errorRetryCountRef.current = 0;
      }

      // Show terminal and write header
      workbenchStore.toggleTerminal(true);
      if (terminalRef.current) {
        terminalRef.current.write(`\x1b[36m\n▶ Executando: ${artifact.title}\x1b[0m\n`);
      }

      // Check if artifact has a start action (server)
      const hasStartAction = artifact.actions.some(a => a.type === 'start');

      try {
        await actionRunner.runArtifact(artifact);

        // Refresh files after artifact execution
        const webcontainer = await getWebContainer();
        await refreshFiles(webcontainer);

        // If no start action, we're done loading
        // (server-ready event will handle it if there's a start action)
        if (!hasStartAction) {
          console.log('[MyEasyCode] No start action, marking as complete');
          setIsRunningActions(false);
        }
      } catch (error) {
        console.error('[MyEasyCode] Artifact error:', error);
        setIsRunningActions(false);
      }
    },
    [actionRunner]
  );

  // Handle terminal ready
  const handleTerminalReady = useCallback((terminal: ITerminal) => {
    console.log('[MyEasyCode] Terminal ready');
    terminalRef.current = terminal;
    terminalStore.attachTerminal(terminal);
  }, []);

  // Handle terminal resize
  const handleTerminalResize = useCallback((cols: number, rows: number) => {
    terminalStore.onTerminalResize(cols, rows);
  }, []);

  // Loading state
  if (isInitializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Code2 className="h-16 w-16 text-purple-500" />
            <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 animate-spin text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-200">MyEasyCode</h2>
          <p className="text-gray-400">Iniciando ambiente de desenvolvimento...</p>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (initError) {
    const isCrossOriginError = initError.includes('crossOriginIsolated') || initError.includes('SharedArrayBuffer');

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-lg rounded-lg bg-red-900/20 p-6 text-center">
          <Code2 className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-200">
            Erro ao inicializar
          </h2>
          <p className="mb-4 text-gray-400">{initError}</p>

          {isCrossOriginError && (
            <div className="mb-4 rounded-lg bg-yellow-900/20 p-4 text-left text-sm">
              <p className="mb-2 font-semibold text-yellow-400">
                Este recurso requer configuração especial do servidor:
              </p>
              <ul className="list-disc pl-5 text-yellow-300/80">
                <li>Cross-Origin-Embedder-Policy: credentialless</li>
                <li>Cross-Origin-Opener-Policy: same-origin</li>
              </ul>
              <p className="mt-2 text-yellow-300/70">
                Reinicie o servidor de desenvolvimento após atualizar as configurações.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Tentar novamente
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="rounded-lg border border-gray-600 px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                Voltar ao Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-purple-500" />
            <span className="font-semibold text-gray-200">MyEasyCode</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`rounded-lg p-2 ${
              showChat
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            title={showChat ? 'Ocultar chat' : 'Mostrar chat'}
          >
            {showChat ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel */}
        {showChat && (
          <div className="w-96 flex-shrink-0 border-r border-gray-700">
            <Chat ref={chatRef} onArtifactReceived={handleArtifact} className="h-full" />
          </div>
        )}

        {/* Workbench */}
        <div className="flex-1">
          <Workbench
            className="h-full"
            isLoading={isRunningActions}
            onTerminalReady={handleTerminalReady}
            onTerminalResize={handleTerminalResize}
          />
        </div>
      </div>
    </div>
  );
}

export default MyEasyCodePage;
