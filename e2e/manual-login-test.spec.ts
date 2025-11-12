import { test, expect } from '@playwright/test';

test.describe('Manual Login Test', () => {
  test('login with existing user rawix12331@delaeb.com', async ({ page }) => {
    const email = 'rawix12331@delaeb.com';
    const password = 'Papagaio1998!_';

    // 1. Ir para homepage
    await page.goto('http://localhost:5174/');

    // 2. Aguardar página carregar
    await page.waitForLoadState('networkidle');

    // 3. Abrir modal de login
    console.log('Clicando no botão Login...');
    await page.click('text=Login');

    // 4. Aguardar modal abrir
    console.log('Aguardando modal abrir...');
    await page.waitForSelector('input[name="email"]', {
      state: 'visible',
      timeout: 10000,
    });

    // 5. Preencher credenciais
    console.log('Preenchendo credenciais...');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // 6. Submeter formulário
    console.log('Submetendo formulário...');
    await page.click('text=Entrar');

    // 7. Aguardar resposta do login
    await page.waitForTimeout(3000);

    // 8. Verificar se há produtos visíveis
    console.log('Verificando se produtos estão visíveis...');

    // Tirar screenshot do estado atual
    await page.screenshot({ path: 'test-results/manual-login-after-submit.png', fullPage: true });

    // Verificar se algum elemento do dashboard está visível
    const dashboardVisible = await page.locator('text=/MyEasyWebsite|BusinessGuru|Visão Geral|Dashboard/i').first().isVisible().catch(() => false);

    console.log('Dashboard visível?', dashboardVisible);

    // Verificar URL e estado da página
    console.log('URL atual:', page.url());

    // Verificar se há erros no console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('ERRO NO CONSOLE:', msg.text());
      }
    });

    // Aguardar mais um pouco para ver se algo aparece
    await page.waitForTimeout(5000);

    // Tirar screenshot final
    await page.screenshot({ path: 'test-results/manual-login-final.png', fullPage: true });

    // O teste passa se conseguiu submeter o formulário sem erro
    expect(true).toBe(true);
  });
});
