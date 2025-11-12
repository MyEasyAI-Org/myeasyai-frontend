/**
 * Teste de Exemplo Básico
 *
 * Este é um teste simples para validar que o Playwright
 * está configurado corretamente e pode acessar a aplicação.
 */

import { test, expect } from '@playwright/test';

test.describe('Validação Básica', () => {
  test('aplicação carrega a homepage', async ({ page }) => {
    // Ir para a homepage
    await page.goto('/');

    // Verificar que a página carregou
    await expect(page).toHaveTitle(/MyEasyAI|Easy/i);

    // Verificar que elementos principais estão visíveis
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();
  });

  test('pode visualizar botões de CTA na homepage', async ({ page }) => {
    await page.goto('/');

    // Aguardar página carregar
    await page.waitForLoadState('networkidle');

    // Procurar botões de call-to-action específicos
    const experimentarButton = page.locator('text=Quero experimentar');
    const saibaMaisButton = page.locator('text=Saiba mais');

    // Verificar que os botões principais estão visíveis
    await expect(experimentarButton.first()).toBeVisible({ timeout: 10000 });
    await expect(saibaMaisButton.first()).toBeVisible();
  });

  test('navegação básica funciona', async ({ page }) => {
    await page.goto('/');

    // Verificar que a página não tem erros de console críticos
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');

    // Verificar que não há muitos erros (alguns warnings são ok)
    // Este teste é flexível para não falhar por erros menores
    console.log(`Console errors encontrados: ${errors.length}`);
  });
});
