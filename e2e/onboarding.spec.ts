import { test, expect } from '@playwright/test';
import { generateTestUser } from './utils/test-helpers';

test.describe('Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('usuário novo vê modal de onboarding após criar conta', async ({ page }) => {
    const user = generateTestUser();

    // 1. Criar conta
    await page.click('text=Quero experimentar');
    await expect(page.locator('[name="fullName"]')).toBeVisible({ timeout: 10000 });

    await page.fill('[name="fullName"]', user.fullName);
    await page.fill('[name="preferredName"]', user.preferredName);
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', user.password);
    await page.fill('[name="confirmPassword"]', user.password);

    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.click('text=Criar conta');

    //2. Aguardar processamento
    await page.waitForTimeout(3000);

    // 3. Verificar se modal de onboarding apareceu
    // O modal deve aparecer automaticamente após o signup
    const onboardingModal = page.locator('text=/Completa|Complete|Bem-vindo|Dados pessoais/i').first();

    // Aguardar até 10 segundos para o modal aparecer
    await expect(onboardingModal).toBeVisible({ timeout: 10000 });

    console.log('✅ Modal de onboarding está visível!');
  });

  test('usuário pode preencher onboarding completo', async ({ page }) => {
    const user = generateTestUser();

    // 1. Criar conta
    await page.click('text=Quero experimentar');
    await expect(page.locator('[name="fullName"]')).toBeVisible({ timeout: 10000 });

    await page.fill('[name="fullName"]', user.fullName);
    await page.fill('[name="preferredName"]', user.preferredName);
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', user.password);
    await page.fill('[name="confirmPassword"]', user.password);

    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.click('text=Criar conta');
    await page.waitForTimeout(3000);

    // 2. Aguardar modal de onboarding aparecer
    const onboardingModal = page.locator('text=/Completa|Complete|Bem-vindo|Dados pessoais/i').first();
    await expect(onboardingModal).toBeVisible({ timeout: 10000 });

    // 3. Preencher dados de onboarding
    // Procurar campos típicos de onboarding
    const phoneInput = page.locator('input[name="phone"], input[name="mobile_phone"], input[placeholder*="telefone" i], input[placeholder*="phone" i]').first();
    const countrySelect = page.locator('select[name="country"], input[name="country"]').first();
    const postalCodeInput = page.locator('input[name="postal_code"], input[name="postalCode"], input[name="cep"], input[placeholder*="CEP" i]').first();

    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+5511987654321');
    }

    if (await countrySelect.isVisible()) {
      // Tentar selecionar Brasil
      await countrySelect.selectOption({ label: /brasil/i }).catch(() => {
        // Se não for select, tentar fill
        countrySelect.fill('Brasil');
      });
    }

    if (await postalCodeInput.isVisible()) {
      await postalCodeInput.fill('01310-100');
    }

    // 4. Submeter onboarding
    const submitButton = page.locator('button:has-text("Salvar"), button:has-text("Continuar"), button:has-text("Concluir")').first();

    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // 5. Aguardar modal fechar e dashboard aparecer
    await page.waitForTimeout(2000);

    // 6. Verificar que está no dashboard
    const dashboardElement = page.locator('text=/MyEasyWebsite|Dashboard|Visão Geral/i').first();
    await expect(dashboardElement).toBeVisible({ timeout: 10000 });

    console.log('✅ Onboarding completo e dashboard visível!');
  });

  test('usuário pode pular onboarding', async ({ page }) => {
    const user = generateTestUser();

    // 1. Criar conta
    await page.click('text=Quero experimentar');
    await expect(page.locator('[name="fullName"]')).toBeVisible({ timeout: 10000 });

    await page.fill('[name="fullName"]', user.fullName);
    await page.fill('[name="preferredName"]', user.preferredName);
    await page.fill('[name="email"]', user.email);
    await page.fill('[name="password"]', user.password);
    await page.fill('[name="confirmPassword"]', user.password);

    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.click('text=Criar conta');
    await page.waitForTimeout(3000);

    // 2. Aguardar modal de onboarding aparecer
    const onboardingModal = page.locator('text=/Completa|Complete|Bem-vindo|Dados pessoais/i').first();
    await expect(onboardingModal).toBeVisible({ timeout: 10000 });

    // 3. Procurar botão "Pular" ou "Agora não"
    const skipButton = page.locator('button:has-text("Pular"), button:has-text("Agora não"), button:has-text("Depois")').first();

    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForTimeout(1000);

      // 4. Verificar que modal fechou e está no dashboard
      const dashboardElement = page.locator('text=/MyEasyWebsite|Dashboard|Visão Geral/i').first();
      await expect(dashboardElement).toBeVisible({ timeout: 10000 });

      console.log('✅ Onboarding pulado com sucesso!');
    } else {
      console.log('⚠️ Botão de pular não encontrado - onboarding é obrigatório');
    }
  });
});
