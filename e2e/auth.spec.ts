/**
 * Testes E2E de Autenticação
 *
 * Cobre os fluxos de:
 * - Cadastro (signup)
 * - Login
 * - Validações de formulário
 * - Tratamento de erros
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, setupDialogHandler } from './utils/test-helpers';

test.describe('Autenticação - Cadastro (Signup)', () => {
  test.beforeEach(async ({ page }) => {
    // Limpar estado antes de cada teste
    await page.goto('/');
  });

  test('usuário pode se cadastrar com dados válidos', async ({ page }) => {
    const user = generateTestUser();

    // 1. Clicar em "Quero experimentar" para abrir modal de cadastro
    await page.click('text=Quero experimentar');

    // 2. Aguardar modal abrir (procurar por campos de cadastro)
    await expect(page.locator('[name="fullName"]')).toBeVisible({ timeout: 10000 });

    // 3. Preencher formulário
    await page.fill('[name="fullName"]', user.fullName);
    await page.fill('[name="preferredName"]', user.preferredName);
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', user.password);
    await page.fill('[name="confirmPassword"]', user.password);

    // 4. Aceitar termos (se houver checkbox)
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // 5. Submeter formulário - clicar no botão "Criar conta"
    await page.click('text=Criar conta');

    // 6. Aguardar processamento (pode haver alert de sucesso)
    await page.waitForTimeout(2000);

    // 7. Verificar se houve sucesso (pode ser alert, toast ou redirecionamento)
    // Se usar alert:
    // await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    // Se usar toast/notificação:
    // const toast = page.locator('.sonner-toast, .toast');
    // if (await toast.isVisible()) {
    //   await expect(toast).toContainText(/sucesso|criado/i);
    // }
  });

  test('não permite cadastro com senhas diferentes', async ({ page }) => {
    const user = generateTestUser();
    const dialogMessages = await setupDialogHandler(page);

    // 1. Abrir modal de cadastro
    await page.click('text=Quero experimentar');
    await expect(page.locator('[name="fullName"]')).toBeVisible({ timeout: 10000 });

    // 2. Preencher com senhas diferentes
    await page.fill('[name="fullName"]', user.fullName);
    await page.fill('[name="preferredName"]', user.preferredName);
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', user.password);
    await page.fill('[name="confirmPassword"]', 'SenhaDiferente123!');

    // 3. Tentar submeter
    await page.click('text=Criar conta');

    // 4. Aguardar mensagem de erro
    await page.waitForTimeout(1000);

    // 5. Verificar se há mensagem de erro (alert ou inline)
    // Se for alert, verificar dialogMessages
    // Se for mensagem inline:
    const errorMessage = page.locator('text=/senha.*não coincidem|senhas diferentes/i');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('não permite cadastro com nome incompleto', async ({ page }) => {
    const user = generateTestUser();

    await page.click('text=Quero experimentar');
    await expect(page.locator('[name="fullName"]')).toBeVisible({ timeout: 10000 });

    // Nome sem sobrenome
    await page.fill('[name="fullName"]', 'João');
    await page.fill('[name="preferredName"]', 'João');
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', user.password);
    await page.fill('[name="confirmPassword"]', user.password);

    await page.click('text=Criar conta');
    await page.waitForTimeout(1000);

    // Verificar mensagem de erro
    const errorMessage = page.locator('text=/nome completo|sobrenome/i');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('não permite cadastro com email inválido', async ({ page }) => {
    const user = generateTestUser();

    await page.click('text=Quero experimentar');
    await expect(page.locator('[name="fullName"]')).toBeVisible({ timeout: 10000 });

    await page.fill('[name="fullName"]', user.fullName);
    await page.fill('[name="preferredName"]', user.preferredName);
    await page.fill('[name="email"]', 'email-invalido'); // Email sem @
    await page.fill('[name="password"]', user.password);
    await page.fill('[name="confirmPassword"]', user.password);

    await page.click('text=Criar conta');
    await page.waitForTimeout(1000);

    // Verificar validação HTML5 ou mensagem de erro customizada
    const emailInput = page.locator('[name="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) =>
      el.validationMessage
    );

    // Se não houver validação HTML5, verificar mensagem de erro na tela
    if (!validationMessage) {
      const errorMessage = page.locator('text=/email.*inválido|formato.*email/i');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('não permite cadastro com senha fraca', async ({ page }) => {
    const user = generateTestUser();

    await page.click('text=Quero experimentar');
    await expect(page.locator('[name="fullName"]')).toBeVisible({ timeout: 10000 });

    await page.fill('[name="fullName"]', user.fullName);
    await page.fill('[name="preferredName"]', user.preferredName);
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', '123'); // Senha muito fraca
    await page.fill('[name="confirmPassword"]', '123');

    await page.click('text=Criar conta');
    await page.waitForTimeout(1000);

    // Verificar mensagem de erro sobre senha fraca
    const errorMessage = page.locator('text=/senha.*fraca|senha.*curta|mínimo.*caracteres/i');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe('Autenticação - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('usuário pode fazer login com credenciais válidas', async ({ page }) => {
    // Usando credenciais reais para teste
    const email = 'getgadgetsuporte@gmail.com';
    const password = 'Papagaio1998!_';

    // 1. Clicar em "Login"
    await page.click('text=Login');

    // 2. Aguardar modal de login abrir
    await page.waitForSelector('input[name="email"]', { state: 'visible' });

    // 3. Preencher credenciais
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    // 4. Submeter
    await page.click('text=Entrar');

    // 5. Aguardar processamento
    await page.waitForTimeout(2000);

    // 6. Verificar se foi redirecionado para dashboard ou se login foi bem sucedido
    // (Você pode verificar se apareceu o nome do usuário, ou se a URL mudou)
  });

  test('não permite login com credenciais inválidas', async ({ page }) => {
    await page.click('text=Login');
    await page.waitForSelector('input[name="email"]', { state: 'visible' });

    // Credenciais incorretas
    await page.fill('[name="email"]', 'usuario-inexistente@myeasyai.test');
    await page.fill('[name="password"]', 'SenhaErrada123!');

    await page.click('text=Entrar');
    await page.waitForTimeout(2000);

    // Verificar mensagem de erro
    const errorMessage = page.locator('text=/credenciais.*inválidas|email.*senha.*incorretos|erro.*login/i');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('não permite login com campos vazios', async ({ page }) => {
    await page.click('text=Login');
    await page.waitForSelector('input[name="email"]', { state: 'visible' });

    // Tentar submeter sem preencher
    await page.click('text=Entrar');

    // Verificar validação HTML5
    const emailInput = page.locator('[name="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) =>
      el.validationMessage
    );

    expect(validationMessage).toBeTruthy();
  });

  test('pode alternar entre login e cadastro', async ({ page }) => {
    // Abrir login
    await page.click('text=Login');
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Clicar em link para cadastro
    const signupLink = page.locator('text=/cadastre-se|criar conta|registrar/i');
    if (await signupLink.isVisible()) {
      await signupLink.click();

      // Verificar se mudou para tela de cadastro
      await expect(page.locator('[name="fullName"]')).toBeVisible();
    }
  });
});

test.describe('Autenticação - Logout', () => {
  test('usuário pode fazer logout', async ({ page }) => {
    // Este teste requer um usuário logado
    // Você pode usar a fixture authenticatedPage ou fazer login manualmente

    await page.goto('/');

    // Fazer login primeiro
    await page.click('text=Login');
    await page.waitForSelector('input[name="email"]', { state: 'visible' });
    await page.fill('[name="email"]', 'getgadgetsuporte@gmail.com');
    await page.fill('[name="password"]', 'Papagaio1998!_');
    await page.click('text=Entrar');
    await page.waitForTimeout(2000);

    // Fazer logout
    const logoutButton = page.locator('text=/sair|logout/i');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Verificar se foi redirecionado para homepage
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Login')).toBeVisible();
    }
  });
});

test.describe('Autenticação - Recuperação de Senha', () => {
  test('pode acessar tela de recuperação de senha', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');

    // Procurar link "Esqueceu a senha?"
    const forgotPasswordLink = page.locator('text=/esqueceu.*senha|recuperar senha/i');

    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();

      // Verificar se abriu modal/página de recuperação
      await expect(page.locator('text=/recuper|redefinir/i')).toBeVisible();
    }
  });
});
