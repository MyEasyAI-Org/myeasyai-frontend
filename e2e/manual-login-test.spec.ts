/**
 * Teste Manual de Login
 * Login com credenciais específicas: getgadgetsuporte@gmail.com
 */

import { test, expect } from '@playwright/test';

test.describe('Teste Manual de Login - getgadgetsuporte@gmail.com', () => {
  test('fazer login completo e navegar pelo sistema', async ({ page }) => {
    const email = 'getgadgetsuporte@gmail.com';
    const password = 'Papagaio1998!_';

    console.log('🔵 [1/6] Navegando para a página inicial...');
    await page.goto('/');

    console.log('🔵 [2/6] Clicando no botão Login...');
    await page.click('text=Login');

    console.log('🔵 [3/6] Aguardando modal de login aparecer...');
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });

    console.log('🔵 [4/6] Preenchendo credenciais...');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    console.log('🔵 [5/6] Clicando no botão Entrar...');
    await page.click('text=Entrar');

    console.log('🔵 [6/6] Aguardando resposta do login...');
    await page.waitForTimeout(5000);

    // Verificar se há erro
    const errorLocator = page.locator('text=/erro|inválid|incorrect|credenciais/i');
    const hasError = await errorLocator.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorLocator.textContent();
      console.log('❌ ERRO DE LOGIN:', errorText);
      throw new Error(`Login falhou: ${errorText}`);
    }

    // Verificar se apareceu dashboard ou onboarding
    console.log('✅ Login bem-sucedido! Verificando próxima tela...');
    
    const onboardingModal = page.locator('[data-testid="onboarding-modal"], text=/dados pessoais|etapa 1|onboarding/i');
    const dashboardContent = page.locator('text=/dashboard|bem-vindo|meus sites/i');
    
    const isOnboarding = await onboardingModal.isVisible().catch(() => false);
    const isDashboard = await dashboardContent.isVisible().catch(() => false);

    if (isOnboarding) {
      console.log('🔵 Modal de onboarding detectado - usuário precisa completar onboarding');
    } else if (isDashboard) {
      console.log('✅ Dashboard visível - usuário já completou onboarding');
    } else {
      console.log('⚠️  Estado desconhecido - verificar manualmente');
    }

    // Tirar screenshot final
    await page.screenshot({ path: 'test-results/manual-login-final.png', fullPage: true });
    console.log('📸 Screenshot salvo em: test-results/manual-login-final.png');

    // Manter aberto para visualização
    console.log('⏸️  Mantendo navegador aberto por 10 segundos...');
    await page.waitForTimeout(10000);
    
    console.log('✅ Teste concluído com sucesso!');
  });
});
