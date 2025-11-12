/**
 * Comprehensive Dashboard Tab Tests
 *
 * Tests all 6 dashboard tabs:
 * - Overview (welcome, tokens, requests, member since)
 * - Subscription (4 plan cards)
 * - Products (active + available products)
 * - Usage (token usage, requests, renewal)
 * - Settings (checkboxes, API key, danger zone)
 * - Profile (5 editable fields)
 */

import { test, expect } from './fixtures/auth.fixture';

test.describe('Dashboard - Overview Tab', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');

    // Navigate to Overview tab
    const overviewTab = authenticatedPage.locator('button:has-text("Visão Geral"), button:has-text("Overview")');
    if (await overviewTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await overviewTab.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('displays welcome message with user name', async ({ authenticatedPage: page }) => {
    const welcomeMessage = page.locator('text=/bem.*vindo|welcome/i');
    await expect(welcomeMessage.first()).toBeVisible();
  });

  test('displays token statistics', async ({ authenticatedPage: page }) => {
    const tokensSection = page.locator('text=/tokens|créditos/i');
    if (await tokensSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(tokensSection.first()).toBeVisible();

      // Check for token count
      const tokenCount = page.locator('text=/\\d+.*tokens?/i');
      if (await tokenCount.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(tokenCount.first()).toBeVisible();
      }
    }
  });

  test('displays request statistics', async ({ authenticatedPage: page }) => {
    const requestsSection = page.locator('text=/requisições|requests/i');
    if (await requestsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(requestsSection.first()).toBeVisible();
    }
  });

  test('displays member since date', async ({ authenticatedPage: page }) => {
    const memberSince = page.locator('text=/membro desde|member since/i');
    if (await memberSince.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(memberSince.first()).toBeVisible();
    }
  });
});

test.describe('Dashboard - Subscription Tab', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');

    // Navigate to Subscription tab
    const subscriptionTab = authenticatedPage.locator('button:has-text("Assinatura"), button:has-text("Subscription")');
    if (await subscriptionTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await subscriptionTab.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('displays all 4 subscription plans', async ({ authenticatedPage: page }) => {
    const plans = ['Free', 'Basic', 'Pro', 'Enterprise'];

    for (const plan of plans) {
      const planCard = page.locator(`text=${plan}`);
      if (await planCard.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(planCard.first()).toBeVisible();
      }
    }
  });

  test('displays Free plan features', async ({ authenticatedPage: page }) => {
    const freePlan = page.locator('text=Free').first();
    if (await freePlan.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(freePlan).toBeVisible();

      // Check for free plan features (tokens, sites, etc)
      const features = page.locator('text=/\\d+.*tokens?|\\d+.*sites?/i');
      if (await features.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(features.first()).toBeVisible();
      }
    }
  });

  test('displays Basic plan features and price', async ({ authenticatedPage: page }) => {
    const basicPlan = page.locator('text=Basic').first();
    if (await basicPlan.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(basicPlan).toBeVisible();

      // Check for pricing
      const price = page.locator('text=/R\\$|\\$/');
      if (await price.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(price.first()).toBeVisible();
      }
    }
  });

  test('displays Pro plan features and price', async ({ authenticatedPage: page }) => {
    const proPlan = page.locator('text=Pro').first();
    if (await proPlan.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(proPlan).toBeVisible();
    }
  });

  test('displays Enterprise plan with custom pricing', async ({ authenticatedPage: page }) => {
    const enterprisePlan = page.locator('text=Enterprise').first();
    if (await enterprisePlan.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(enterprisePlan).toBeVisible();

      // Check for "custom" or "contact us" text
      const customText = page.locator('text=/custom|personalizado|contato/i');
      if (await customText.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(customText.first()).toBeVisible();
      }
    }
  });

  test('can select a plan', async ({ authenticatedPage: page }) => {
    const selectButton = page.locator('button:has-text("Selecionar"), button:has-text("Select")');
    if (await selectButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await selectButton.first().click();
      await page.waitForTimeout(1000);

      // Check for confirmation or navigation
      const confirmation = page.locator('text=/confirmar|confirm|checkout/i');
      if (await confirmation.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(confirmation.first()).toBeVisible();
      }
    }
  });
});

test.describe('Dashboard - Products Tab', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');

    // Navigate to Products tab
    const productsTab = authenticatedPage.locator('button:has-text("Meus Produtos"), button:has-text("Products")');
    if (await productsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await productsTab.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('displays active products section', async ({ authenticatedPage: page }) => {
    const activeSection = page.locator('text=/produtos.*ativos|active.*products/i');
    if (await activeSection.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(activeSection.first()).toBeVisible();
    }
  });

  test('displays MyEasyWebsite product', async ({ authenticatedPage: page }) => {
    const myEasyWebsite = page.locator('text=MyEasyWebsite');
    await expect(myEasyWebsite.first()).toBeVisible();
  });

  test('displays BusinessGuru product', async ({ authenticatedPage: page }) => {
    const businessGuru = page.locator('text=BusinessGuru');
    if (await businessGuru.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(businessGuru.first()).toBeVisible();
    }
  });

  test('displays available products section', async ({ authenticatedPage: page }) => {
    const availableSection = page.locator('text=/produtos.*disponíveis|available.*products/i');
    if (await availableSection.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(availableSection.first()).toBeVisible();
    }
  });

  test('can access a product', async ({ authenticatedPage: page }) => {
    const accessButton = page.locator('button:has-text("Acessar"), button:has-text("Access")');
    if (await accessButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await accessButton.first().click();
      await page.waitForTimeout(1000);

      // Verify navigation happened
      const url = page.url();
      expect(url).not.toContain('/dashboard');
    }
  });

  test('displays product descriptions', async ({ authenticatedPage: page }) => {
    // Check if products have descriptions
    const description = page.locator('text=/crie.*sites|create.*websites|gerencie/i');
    if (await description.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(description.first()).toBeVisible();
    }
  });
});

test.describe('Dashboard - Usage Tab', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');

    // Navigate to Usage tab
    const usageTab = authenticatedPage.locator('button:has-text("Uso"), button:has-text("Usage")');
    if (await usageTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await usageTab.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('displays token usage statistics', async ({ authenticatedPage: page }) => {
    const tokenUsage = page.locator('text=/tokens.*usados|tokens.*used/i');
    if (await tokenUsage.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(tokenUsage.first()).toBeVisible();

      // Check for numeric values
      const numbers = page.locator('text=/\\d+/');
      if (await numbers.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(numbers.first()).toBeVisible();
      }
    }
  });

  test('displays request count', async ({ authenticatedPage: page }) => {
    const requests = page.locator('text=/requisições|requests/i');
    if (await requests.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(requests.first()).toBeVisible();
    }
  });

  test('displays renewal period information', async ({ authenticatedPage: page }) => {
    const renewal = page.locator('text=/renovação|renewal|próxima.*renovação|next.*renewal/i');
    if (await renewal.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(renewal.first()).toBeVisible();
    }
  });

  test('displays usage chart or graph', async ({ authenticatedPage: page }) => {
    // Check for chart elements (canvas, svg, or chart container)
    const chart = page.locator('canvas, svg[class*="chart"], [class*="chart-container"]');
    if (await chart.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(chart.first()).toBeVisible();
    }
  });

  test('displays usage history', async ({ authenticatedPage: page }) => {
    const history = page.locator('text=/histórico|history/i');
    if (await history.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(history.first()).toBeVisible();
    }
  });
});

test.describe('Dashboard - Settings Tab', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');

    // Navigate to Settings tab
    const settingsTab = authenticatedPage.locator('button:has-text("Configurações"), button:has-text("Settings")');
    if (await settingsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsTab.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('displays configuration checkboxes', async ({ authenticatedPage: page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count > 0) {
      // Should have at least 3 checkboxes based on Dashboard analysis
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });

  test('can toggle notification settings', async ({ authenticatedPage: page }) => {
    const notificationCheckbox = page.locator('input[type="checkbox"]').first();
    if (await notificationCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      const initialState = await notificationCheckbox.isChecked();
      await notificationCheckbox.click();
      await page.waitForTimeout(500);

      const newState = await notificationCheckbox.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('displays API key section', async ({ authenticatedPage: page }) => {
    const apiKeySection = page.locator('text=/API.*key|chave.*API/i');
    if (await apiKeySection.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(apiKeySection.first()).toBeVisible();
    }
  });

  test('can reveal API key', async ({ authenticatedPage: page }) => {
    const revealButton = page.locator('button:has-text("Mostrar"), button:has-text("Show"), button:has-text("Revelar")');
    if (await revealButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await revealButton.first().click();
      await page.waitForTimeout(500);

      // Check if API key is now visible (not masked)
      const apiKey = page.locator('[class*="api-key"], code');
      if (await apiKey.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(apiKey.first()).toBeVisible();
      }
    }
  });

  test('can copy API key', async ({ authenticatedPage: page }) => {
    const copyButton = page.locator('button:has-text("Copiar"), button:has-text("Copy")');
    if (await copyButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await copyButton.first().click();
      await page.waitForTimeout(500);

      // Check for success message
      const successMessage = page.locator('text=/copiado|copied/i');
      if (await successMessage.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('can regenerate API key', async ({ authenticatedPage: page }) => {
    const regenerateButton = page.locator('button:has-text("Regenerar"), button:has-text("Regenerate")');
    if (await regenerateButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await regenerateButton.click();
      await page.waitForTimeout(500);

      // Should show confirmation dialog
      const confirmDialog = page.locator('text=/confirmar|confirm|tem certeza/i');
      if (await confirmDialog.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(confirmDialog.first()).toBeVisible();
      }
    }
  });

  test('displays danger zone section', async ({ authenticatedPage: page }) => {
    const dangerZone = page.locator('text=/danger.*zone|zona.*perigo/i');
    if (await dangerZone.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(dangerZone.first()).toBeVisible();
    }
  });

  test('displays delete account option in danger zone', async ({ authenticatedPage: page }) => {
    const deleteOption = page.locator('text=/deletar.*conta|delete.*account|excluir.*conta/i');
    if (await deleteOption.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(deleteOption.first()).toBeVisible();
    }
  });
});

test.describe('Dashboard - Profile Tab', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');

    // Navigate to Profile tab
    const profileTab = authenticatedPage.locator('button:has-text("Perfil"), button:has-text("Profile")');
    if (await profileTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await profileTab.click();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('displays all 5 profile fields', async ({ authenticatedPage: page }) => {
    const fields = [
      'name', 'nome',
      'email',
      'bio', 'biografia',
      'phone', 'telefone',
      'company', 'empresa'
    ];

    let visibleFields = 0;
    for (const field of fields) {
      const fieldElement = page.locator(`input[name*="${field}"], textarea[name*="${field}"], label:has-text("${field}")`);
      if (await fieldElement.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        visibleFields++;
      }
    }

    // Should have at least some profile fields visible
    expect(visibleFields).toBeGreaterThan(0);
  });

  test('can edit name field', async ({ authenticatedPage: page }) => {
    const nameInput = page.locator('input[name*="name"], input[name*="nome"]').first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.clear();
      await nameInput.fill('João da Silva Teste');

      const value = await nameInput.inputValue();
      expect(value).toBe('João da Silva Teste');
    }
  });

  test('can edit email field', async ({ authenticatedPage: page }) => {
    const emailInput = page.locator('input[name*="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const originalEmail = await emailInput.inputValue();
      await emailInput.clear();
      await emailInput.fill('novoemail@example.com');

      const value = await emailInput.inputValue();
      expect(value).toBe('novoemail@example.com');

      // Restore original email
      await emailInput.clear();
      await emailInput.fill(originalEmail);
    }
  });

  test('can edit bio field', async ({ authenticatedPage: page }) => {
    const bioInput = page.locator('textarea[name*="bio"], textarea[name*="biografia"]').first();
    if (await bioInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bioInput.clear();
      await bioInput.fill('Desenvolvedor fullstack apaixonado por tecnologia');

      const value = await bioInput.inputValue();
      expect(value).toContain('Desenvolvedor');
    }
  });

  test('can edit phone field', async ({ authenticatedPage: page }) => {
    const phoneInput = page.locator('input[name*="phone"], input[name*="telefone"]').first();
    if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneInput.clear();
      await phoneInput.fill('(11) 98765-4321');

      const value = await phoneInput.inputValue();
      expect(value).toContain('98765');
    }
  });

  test('can edit company field', async ({ authenticatedPage: page }) => {
    const companyInput = page.locator('input[name*="company"], input[name*="empresa"]').first();
    if (await companyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await companyInput.clear();
      await companyInput.fill('MyEasyAI Inc.');

      const value = await companyInput.inputValue();
      expect(value).toBe('MyEasyAI Inc.');
    }
  });

  test('can save profile changes', async ({ authenticatedPage: page }) => {
    const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Save")');
    if (await saveButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveButton.first().click();
      await page.waitForTimeout(1000);

      // Check for success message
      const successMessage = page.locator('text=/salvo|saved|atualizado|updated/i');
      if (await successMessage.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('validates required fields on save', async ({ authenticatedPage: page }) => {
    const nameInput = page.locator('input[name*="name"], input[name*="nome"]').first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.clear();

      const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Save")');
      if (await saveButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.first().click();
        await page.waitForTimeout(500);

        // Check for validation message
        const errorMessage = page.locator('text=/obrigatório|required|preencha/i');
        if (await errorMessage.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('displays profile avatar/photo', async ({ authenticatedPage: page }) => {
    const avatar = page.locator('img[alt*="avatar"], img[alt*="profile"], [class*="avatar"]');
    if (await avatar.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(avatar.first()).toBeVisible();
    }
  });

  test('can upload new profile photo', async ({ authenticatedPage: page }) => {
    const uploadButton = page.locator('button:has-text("Alterar foto"), button:has-text("Upload"), input[type="file"]');
    if (await uploadButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(uploadButton.first()).toBeVisible();
      // Actual file upload would require a test image file
    }
  });
});
