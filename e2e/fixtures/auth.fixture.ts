/**
 * Fixtures de Autenticação
 *
 * Fixtures são funções reutilizáveis que preparam o estado
 * necessário para os testes. Neste arquivo, criamos fixtures
 * para login/signup automático, evitando repetição de código.
 */

import { test as base, type Page } from '@playwright/test';
import { generateTestUser, fillForm } from '../utils/test-helpers';

/**
 * Interface para dados de usuário autenticado
 */
interface AuthenticatedUser {
  email: string;
  password: string;
  fullName: string;
  preferredName: string;
}

/**
 * Extensão do test base com fixtures customizadas
 */
type AuthFixtures = {
  authenticatedPage: Page;
  testUser: AuthenticatedUser;
};

/**
 * Cria um usuário de teste e faz login automaticamente
 * Se usar credenciais de produção, tenta fazer login direto ao invés de criar novo usuário
 */
async function createAndLoginUser(page: Page): Promise<AuthenticatedUser> {
  const user = generateTestUser();
  const useProductionUser = process.env.USE_PRODUCTION_USER === 'true';

  // If using production user, try to login directly first
  if (useProductionUser) {
    console.log('🔵 [FIXTURE] Usando credenciais de produção - tentando login direto...');
    try {
      await loginUser(page, user.email, user.password);
      console.log('✅ [FIXTURE] Login direto com credenciais de produção bem-sucedido');
      return user;
    } catch (error) {
      console.log('⚠️  [FIXTURE] Login direto falhou, usuário pode não existir ainda');
      // If login fails, continue to signup flow below
    }
  }

  // 1. Ir para homepage
  await page.goto('/');

  // 2. Abrir modal de cadastro
  await page.click('text=Quero experimentar');

  // 3. Aguardar modal abrir
  await page.waitForSelector('[name="fullName"]', {
    state: 'visible',
    timeout: 10000,
  });

  // 4. Preencher formulário de cadastro
  await fillForm(page, {
    fullName: user.fullName,
    preferredName: user.preferredName,
    email: user.email,
    password: user.password,
    confirmPassword: user.password,
  });

  // 5. Setup dialog handler to capture signup alert
  page.once('dialog', async (dialog) => {
    console.log('Signup dialog:', dialog.message());
    await dialog.accept();
  });

  // 6. Submeter formulário
  await page.click('text=Criar conta');

  // 7. Aguardar processamento do cadastro e possível redirecionamento
  // Se o Supabase tem email confirmation desabilitado, o usuário será autenticado automaticamente
  // Se tem habilitado, precisaremos fazer login manual depois
  console.log('[DEBUG] Aguardando após signup...');
  await page.waitForTimeout(3000);

  // 8. Verificar estado após signup
  // Pode estar em 3 estados:
  // a) Dashboard já visível (auto-login sem onboarding)
  // b) Onboarding modal visível (auto-login MAS precisa completar onboarding)
  // c) Ainda na homepage (precisa fazer login manual)

  // First, try to wait for onboarding modal to appear (give it up to 8 seconds)
  console.log('[DEBUG] Procurando modal de onboarding...');
  const onboardingVisible = await page
    .locator('dialog, [role="dialog"]')
    .filter({ hasText: /Complete seu perfil|Etapa.*de.*4|Dados Pessoais/i })
    .isVisible({ timeout: 8000 })
    .catch(() => {
      console.log('[DEBUG] Modal de onboarding não encontrado após 8s');
      return false;
    });

  console.log(`[DEBUG] Onboarding modal visível: ${onboardingVisible}`);

  if (onboardingVisible) {
    // Usuário está logado mas no onboarding - completar onboarding
    console.log('🔵 [ONBOARDING] Iniciando preenchimento do onboarding...');

    // Aguardar modal estar completamente carregado
    await page.waitForTimeout(1000);

    // Etapa 1: Dados Pessoais (já preenchidos no signup, apenas clicar em Próximo)
    console.log('🔵 [ONBOARDING] Etapa 1: Dados Pessoais');
    const step1NextButton = page.locator('button:has-text("Próximo")').first();
    await step1NextButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✓ Botão Próximo encontrado na etapa 1');
    await step1NextButton.click();
    console.log('  ✓ Botão Próximo clicado na etapa 1');
    await page.waitForTimeout(1500);

    // Etapa 2: Contato
    console.log('🔵 [ONBOARDING] Etapa 2: Contato');
    const mobileField = page.locator('input[type="tel"]').first();
    await mobileField.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✓ Campo telefone encontrado na etapa 2');
    // Fill with Brazilian format (11 digits) since Brazil is default country
    await mobileField.fill('11987654321');
    console.log('  ✓ Campo telefone preenchido na etapa 2');
    await page.waitForTimeout(1000); // Wait for validation to complete

    const step2NextButton = page.locator('button:has-text("Próximo")').first();
    await step2NextButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✓ Botão Próximo encontrado na etapa 2');
    await step2NextButton.click();
    console.log('  ✓ Botão Próximo clicado na etapa 2');
    await page.waitForTimeout(1500);

    // Etapa 3: Localização
    console.log('🔵 [ONBOARDING] Etapa 3: Localização');

    // Fill all required address fields for Brazil
    // CEP
    const cepInput = page.locator('label:has-text("CEP")').locator('input').first();
    await cepInput.waitFor({ state: 'visible', timeout: 5000 });
    await cepInput.fill('01310-100');
    console.log('  ✓ CEP preenchido');

    // Rua (Street)
    const streetInput = page.locator('label:has-text("Rua")').locator('input').first();
    await streetInput.waitFor({ state: 'visible', timeout: 5000 });
    await streetInput.fill('Avenida Paulista');
    console.log('  ✓ Rua preenchida');

    // Número (Number)
    const numberInput = page.locator('label:has-text("Número")').locator('input').first();
    await numberInput.waitFor({ state: 'visible', timeout: 5000 });
    await numberInput.fill('1000');
    console.log('  ✓ Número preenchido');

    // Bairro (Neighborhood)
    const neighborhoodInput = page.locator('label:has-text("Bairro")').locator('input').first();
    await neighborhoodInput.waitFor({ state: 'visible', timeout: 5000 });
    await neighborhoodInput.fill('Bela Vista');
    console.log('  ✓ Bairro preenchido');

    // Cidade (City)
    const cityInput = page.locator('label:has-text("Cidade")').locator('input').first();
    await cityInput.waitFor({ state: 'visible', timeout: 5000 });
    await cityInput.fill('São Paulo');
    console.log('  ✓ Cidade preenchida');

    // Estado (State)
    const stateInput = page.locator('label:has-text("Estado")').locator('input').first();
    await stateInput.waitFor({ state: 'visible', timeout: 5000 });
    await stateInput.fill('SP');
    console.log('  ✓ Estado preenchido');

    await page.waitForTimeout(1000); // Wait for validation

    const step3NextButton = page.locator('button:has-text("Próximo")').first();
    await step3NextButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✓ Botão Próximo encontrado na etapa 3');
    await step3NextButton.click();
    console.log('  ✓ Botão Próximo clicado na etapa 3');
    await page.waitForTimeout(1500);

    // Etapa 4: Preferências (clicar em Finalizar)
    console.log('🔵 [ONBOARDING] Etapa 4: Preferências');
    const finishButton = page.locator('button:has-text("Finalizar")').first();
    await finishButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✓ Botão Finalizar encontrado na etapa 4');
    await finishButton.click();
    console.log('  ✓ Botão Finalizar clicado na etapa 4');
    await page.waitForTimeout(3000); // Wait for save and navigation

    // Verificar que o dashboard está visível agora
    console.log('🔵 [ONBOARDING] Aguardando dashboard aparecer...');
    await page.waitForSelector('text=/MyEasyWebsite|Visão Geral|Dashboard/i', {
      state: 'visible',
      timeout: 15000,
    });
    console.log('✅ [ONBOARDING] Dashboard visível! Onboarding completo.');
  } else {
    // If no onboarding modal, check if we need to login or if already on dashboard
    const loginButtonVisible = await page
      .locator('text=Login')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    const dashboardVisible = await page
      .locator('text=MyEasyWebsite')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    console.log(`[DEBUG] Sem onboarding modal - dashboard=${dashboardVisible}, login=${loginButtonVisible}`);

    if (loginButtonVisible && !dashboardVisible) {
      // Não está logado, fazer login manual
      console.log('Email confirmation required, logging in manually...');
      await loginUser(page, user.email, user.password);
    }
    // else: já está no dashboard, não fazer nada
  }

  return user;
}

/**
 * Faz login com credenciais existentes
 */
async function loginUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // 1. Ir para homepage
  await page.goto('/');

  // 2. Abrir modal de login
  await page.click('text=Login');

  // 3. Aguardar modal abrir
  await page.waitForSelector('input[name="email"]', {
    state: 'visible',
    timeout: 10000,
  });

  // 4. Preencher credenciais
  await fillForm(page, {
    email,
    password,
  });

  // 5. Submeter formulário
  await page.click('text=Entrar');

  // 6. Aguardar que o dashboard apareça (a aplicação usa state, não muda a URL)
  // Aguardar que elementos do dashboard estejam visíveis
  await page.waitForSelector('text=/MyEasyWebsite|Visão Geral|Assinatura/i', {
    state: 'visible',
    timeout: 15000,
  });
}

/**
 * Fixture: testUser
 * Fornece dados de um usuário de teste gerado
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Fornece dados de usuário para o teste
   */
  testUser: async ({}, use) => {
    const user = generateTestUser();
    await use(user);
  },

  /**
   * Fornece uma página já autenticada
   * Cria um novo usuário e faz login automaticamente
   */
  authenticatedPage: async ({ page }, use) => {
    // Criar novo usuário e garantir que está autenticado e no dashboard
    // A função createAndLoginUser já lida com todos os casos:
    // - Auto-login após signup
    // - Completar onboarding se necessário
    // - Login manual se confirmação de email é requerida
    const user = await createAndLoginUser(page);

    // Aguardar um momento adicional para garantir que dashboard carregou
    await page.waitForTimeout(2000);

    console.log(`✅ [FIXTURE] Usuário ${user.email} autenticado e pronto para uso`);

    // Fornecer a página autenticada para o teste
    await use(page);

    // Cleanup: fazer logout após o teste
    const logoutButton = page.locator('text=/sair|logout/i');
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click().catch(() => {
        // Ignora erro se logout falhar
        console.log('⚠️  [FIXTURE] Não foi possível fazer logout');
      });
    }
  },
});

export { expect } from '@playwright/test';
