import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração de Testes E2E para MyEasyAI
 *
 * Este arquivo define como os testes End-to-End serão executados.
 * Baseado no guia completo em GUIA_TESTES_E2E.md
 */

export default defineConfig({
  // Pasta onde ficam os testes E2E
  testDir: './e2e',

  // Timeout de cada teste (30 segundos)
  timeout: 30000,

  // Tempo máximo para esperar por assertions
  expect: {
    timeout: 10000,
  },

  // Rodar testes em paralelo (mais rápido)
  fullyParallel: true,

  // Não permitir .only no CI (evita commit acidental de testes focados)
  forbidOnly: !!process.env.CI,

  // Retry em caso de falha
  // - CI: 2 tentativas (para lidar com instabilidades de rede/infra)
  // - Local: 0 tentativas (para feedback rápido durante desenvolvimento)
  retries: process.env.CI ? 2 : 0,

  // Quantos testes rodar ao mesmo tempo
  // - CI: 1 worker (para economizar recursos)
  // - Local: 2 workers (para evitar sobrecarga)
  workers: process.env.CI ? 1 : 2,

  // Formato dos relatórios
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],  // Relatório HTML visual
    ['list'],                                          // Lista no terminal
    ['json', { outputFile: 'test-results/results.json' }],  // JSON para CI/CD
  ],

  // Configurações padrão para todos os testes
  use: {
    // URL base da aplicação (não precisa repetir em cada teste)
    baseURL: 'http://localhost:5173',

    // Gravar trace (filmagem detalhada) apenas na primeira retry
    // Isso ajuda a debugar falhas sem sobrecarregar o sistema
    trace: 'on-first-retry',

    // Tirar screenshot apenas quando o teste falhar
    screenshot: 'only-on-failure',

    // Gravar vídeo apenas quando o teste falhar
    video: 'retain-on-failure',

    // Timeout para navegação
    navigationTimeout: 15000,

    // Timeout para actions (click, fill, etc)
    actionTimeout: 10000,
  },

  // Projetos = diferentes navegadores/dispositivos para testar
  projects: [
    // Desktop - Chrome (mais usado globalmente)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Usa o Google Chrome instalado no sistema (não o headless shell)
        // Isso permite ver a janela do navegador no modo UI e debug
        channel: 'chrome',
      },
    },

    // Desktop - Firefox
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Desktop - Safari/WebKit
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile - Chrome (Android)
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Usa o Google Chrome instalado no sistema
        channel: 'chrome',
      },
    },

    // Mobile - Safari (iOS)
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // Tablet - iPad
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  // Servidor de desenvolvimento
  // Playwright inicia automaticamente o Vite antes dos testes
  webServer: {
    command: 'npm run dev -- --mode test',  // Usar modo 'test' do Vite (carrega .env.test)
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,  // Reutilizar servidor local se já estiver rodando
    timeout: 120000,  // 2 minutos para o servidor iniciar
    stdout: 'ignore',  // Não mostrar logs do servidor no terminal
    stderr: 'pipe',    // Mostrar apenas erros
  },
});
