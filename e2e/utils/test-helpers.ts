/**
 * Funções auxiliares para testes E2E
 *
 * Este arquivo contém funções reutilizáveis que facilitam
 * a escrita de testes limpos e manuteníveis.
 */

import type { Page } from '@playwright/test';

/**
 * Gera um email único para testes
 * Usa timestamp para garantir que não haverá conflitos
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `teste-${timestamp}-${random}@myeasyai.test`;
}

/**
 * Gera dados de usuário para cadastro
 * Se USE_PRODUCTION_USER=true, usa credenciais de produção
 * Caso contrário, gera usuário único para testes
 */
export function generateTestUser() {
  const useProductionUser = process.env.USE_PRODUCTION_USER === 'true';

  if (useProductionUser) {
    return {
      fullName: 'GetGadget Suporte',
      preferredName: 'GetGadget',
      email: 'getgadgetsuporte@gmail.com',
      password: 'Papagaio1998!_',
    };
  }

  return {
    fullName: 'João Silva Santos',
    preferredName: 'João',
    email: generateTestEmail(),
    password: 'SenhaSegura123!',
  };
}

/**
 * Aguarda e aceita/rejeita dialogs (alert, confirm, prompt)
 * Útil para lidar com modais nativos do navegador
 */
export async function setupDialogHandler(
  page: Page,
  action: 'accept' | 'dismiss' = 'accept',
  expectedMessage?: string
): Promise<string[]> {
  const messages: string[] = [];

  page.on('dialog', async (dialog) => {
    const message = dialog.message();
    messages.push(message);

    if (expectedMessage) {
      console.log(`Dialog message: ${message}`);
    }

    if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });

  return messages;
}

/**
 * Aguarda o desaparecimento de loading/spinner
 */
export async function waitForLoadingToDisappear(page: Page, timeout = 10000) {
  await page.waitForSelector('.loading, .spinner, [data-loading="true"]', {
    state: 'hidden',
    timeout,
  }).catch(() => {
    // Ignora erro se loading não existir
  });
}

/**
 * Limpa o estado do navegador
 * Útil no beforeEach para garantir testes isolados
 */
export async function cleanBrowserState(page: Page) {
  // Limpar localStorage
  await page.evaluate(() => {
    localStorage.clear();
  });

  // Limpar sessionStorage
  await page.evaluate(() => {
    sessionStorage.clear();
  });

  // Limpar cookies
  await page.context().clearCookies();
}

/**
 * Aguarda que a URL contenha um determinado padrão
 */
export async function waitForUrl(
  page: Page,
  pattern: string | RegExp,
  timeout = 10000
) {
  await page.waitForURL(pattern, { timeout });
}

/**
 * Preenche um formulário com dados
 */
export async function fillForm(
  page: Page,
  formData: Record<string, string>
) {
  for (const [name, value] of Object.entries(formData)) {
    await page.fill(`[name="${name}"]`, value);
  }
}

/**
 * Aguarda e verifica se um toast/notificação aparece
 */
export async function expectToast(
  page: Page,
  message: string | RegExp,
  timeout = 5000
) {
  const toast = page.locator('.sonner-toast, .toast, [role="alert"]');
  await toast.waitFor({ state: 'visible', timeout });

  if (typeof message === 'string') {
    await toast.getByText(message, { exact: false });
  } else {
    const text = await toast.textContent();
    if (!text || !message.test(text)) {
      throw new Error(`Toast message "${text}" does not match pattern ${message}`);
    }
  }
}

/**
 * Tira screenshot com nome descritivo
 */
export async function takeScreenshot(
  page: Page,
  name: string
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Aguarda que o network fique idle
 * Útil após ações que fazem chamadas à API
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}
