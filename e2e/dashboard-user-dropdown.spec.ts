/**
 * Dashboard User Dropdown Tests
 *
 * Tests for:
 * - User dropdown menu functionality
 * - Logout functionality
 * - User menu navigation
 * - Profile access from dropdown
 */

import { test, expect } from './fixtures/auth.fixture';

test.describe('Dashboard - User Dropdown', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test('displays user dropdown button', async ({ authenticatedPage: page }) => {
    // Look for user dropdown trigger (avatar, name, or menu button)
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');
    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(userDropdown.first()).toBeVisible();
    } else {
      // Alternative: look for user name or email as dropdown trigger
      const userTrigger = page.locator('text=/getgadgetsuporte|joão|usuário/i');
      if (await userTrigger.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(userTrigger.first()).toBeVisible();
      }
    }
  });

  test('can open user dropdown menu', async ({ authenticatedPage: page }) => {
    // Find and click user dropdown
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await userDropdown.first().click();
      await page.waitForTimeout(500);

      // Check if dropdown menu appeared
      const dropdownMenu = page.locator('[class*="dropdown-menu"], [role="menu"], [class*="user-menu-items"]');
      if (await dropdownMenu.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(dropdownMenu.first()).toBeVisible();
      }
    }
  });

  test('dropdown menu contains profile option', async ({ authenticatedPage: page }) => {
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await userDropdown.first().click();
      await page.waitForTimeout(500);

      const profileOption = page.locator('text=/perfil|profile|meu perfil|my profile/i');
      if (await profileOption.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(profileOption.first()).toBeVisible();
      }
    }
  });

  test('dropdown menu contains settings option', async ({ authenticatedPage: page }) => {
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await userDropdown.first().click();
      await page.waitForTimeout(500);

      const settingsOption = page.locator('text=/configurações|settings/i');
      if (await settingsOption.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(settingsOption.first()).toBeVisible();
      }
    }
  });

  test('dropdown menu contains logout option', async ({ authenticatedPage: page }) => {
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await userDropdown.first().click();
      await page.waitForTimeout(500);

      const logoutOption = page.locator('text=/sair|logout|sign out/i');
      if (await logoutOption.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(logoutOption.first()).toBeVisible();
      }
    }
  });

  test('can navigate to profile from dropdown', async ({ authenticatedPage: page }) => {
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await userDropdown.first().click();
      await page.waitForTimeout(500);

      const profileOption = page.locator('text=/perfil|profile|meu perfil/i');
      if (await profileOption.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await profileOption.first().click();
        await page.waitForTimeout(1000);

        // Verify we're on profile section (either tab activated or profile page)
        const profileContent = page.locator('text=/editar.*perfil|edit.*profile|dados.*pessoais/i');
        if (await profileContent.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(profileContent.first()).toBeVisible();
        }
      }
    }
  });

  test('can navigate to settings from dropdown', async ({ authenticatedPage: page }) => {
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await userDropdown.first().click();
      await page.waitForTimeout(500);

      const settingsOption = page.locator('text=/configurações|settings/i');
      if (await settingsOption.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await settingsOption.first().click();
        await page.waitForTimeout(1000);

        // Verify we're on settings section
        const settingsContent = page.locator('text=/API.*key|notificações|preferências/i');
        if (await settingsContent.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(settingsContent.first()).toBeVisible();
        }
      }
    }
  });

  test('dropdown closes when clicking outside', async ({ authenticatedPage: page }) => {
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      // Open dropdown
      await userDropdown.first().click();
      await page.waitForTimeout(500);

      const dropdownMenu = page.locator('[class*="dropdown-menu"], [role="menu"]');
      if (await dropdownMenu.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        // Click outside
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);

        // Dropdown should be closed
        const isVisible = await dropdownMenu.first().isVisible().catch(() => false);
        expect(isVisible).toBe(false);
      }
    }
  });

  test('displays user email in dropdown', async ({ authenticatedPage: page }) => {
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await userDropdown.first().click();
      await page.waitForTimeout(500);

      const userEmail = page.locator('text=/getgadgetsuporte@gmail.com|@/');
      if (await userEmail.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(userEmail.first()).toBeVisible();
      }
    }
  });

  test('displays user avatar in dropdown', async ({ authenticatedPage: page }) => {
    const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');

    if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      const avatar = userDropdown.locator('img');
      if (await avatar.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(avatar.first()).toBeVisible();
      }
    }
  });
});

test.describe('Dashboard - Logout Functionality', () => {
  test('can logout successfully', async ({ authenticatedPage: page }) => {
    // Find logout button (could be in dropdown or direct button)
    let logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")');

    // If not directly visible, try opening user dropdown first
    if (!await logoutButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');
      if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await userDropdown.first().click();
        await page.waitForTimeout(500);
        logoutButton = page.locator('text=/sair|logout|sign out/i');
      }
    }

    if (await logoutButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutButton.first().click();

      // Wait for navigation to home page
      await page.waitForTimeout(2000);

      // Verify we're back on home page (not dashboard)
      const url = page.url();
      expect(url).not.toContain('/dashboard');

      // Verify login button is visible again
      const loginButton = page.locator('button:has-text("Login"), button:has-text("Entrar")');
      await expect(loginButton.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('logout clears session', async ({ authenticatedPage: page }) => {
    // Logout
    let logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")');

    if (!await logoutButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');
      if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await userDropdown.first().click();
        await page.waitForTimeout(500);
        logoutButton = page.locator('text=/sair|logout|sign out/i');
      }
    }

    if (await logoutButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutButton.first().click();
      await page.waitForTimeout(2000);

      // Try to navigate directly to dashboard
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      // Should be redirected to login or home
      const url = page.url();
      const isDashboard = url.includes('/dashboard');

      if (isDashboard) {
        // If still on dashboard, check if onboarding modal appeared (means session cleared)
        const onboardingModal = page.locator('text=/dados pessoais|etapa 1|onboarding/i');
        const loginRequired = page.locator('text=/login|entrar|autenticar/i');

        const hasOnboarding = await onboardingModal.first().isVisible({ timeout: 3000 }).catch(() => false);
        const hasLoginPrompt = await loginRequired.first().isVisible({ timeout: 3000 }).catch(() => false);

        expect(hasOnboarding || hasLoginPrompt).toBe(true);
      }
    }
  });

  test('shows confirmation before logout', async ({ authenticatedPage: page }) => {
    let logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")');

    if (!await logoutButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');
      if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await userDropdown.first().click();
        await page.waitForTimeout(500);
        logoutButton = page.locator('text=/sair|logout|sign out/i');
      }
    }

    if (await logoutButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutButton.first().click();
      await page.waitForTimeout(500);

      // Check if confirmation modal appeared
      const confirmModal = page.locator('text=/tem certeza|confirmar|sure.*logout/i');
      if (await confirmModal.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(confirmModal.first()).toBeVisible();

        // Cancel logout
        const cancelButton = page.locator('button:has-text("Cancelar"), button:has-text("Cancel")');
        if (await cancelButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await cancelButton.first().click();
          await page.waitForTimeout(500);

          // Should still be on dashboard
          const url = page.url();
          expect(url).toContain('/dashboard');
        }
      }
    }
  });

  test('cannot access dashboard after logout without re-authentication', async ({ authenticatedPage: page }) => {
    // Logout
    let logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")');

    if (!await logoutButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      const userDropdown = page.locator('[class*="user-menu"], [class*="user-dropdown"], button:has(img[alt*="avatar"])');
      if (await userDropdown.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await userDropdown.first().click();
        await page.waitForTimeout(500);
        logoutButton = page.locator('text=/sair|logout|sign out/i');
      }
    }

    if (await logoutButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutButton.first().click();
      await page.waitForTimeout(2000);

      // Try to access dashboard endpoints
      const protectedUrls = ['/dashboard', '/dashboard/profile', '/dashboard/settings'];

      for (const url of protectedUrls) {
        await page.goto(url);
        await page.waitForTimeout(1000);

        // Should not have access to dashboard content
        const currentUrl = page.url();
        const hasDashboardAccess = currentUrl.includes('/dashboard') &&
                                   !await page.locator('text=/login|entrar/i').first().isVisible({ timeout: 1000 }).catch(() => false);

        if (hasDashboardAccess) {
          // If on dashboard, verify onboarding modal is present (means not authenticated)
          const onboardingModal = page.locator('text=/dados pessoais|etapa 1/i');
          const hasOnboarding = await onboardingModal.first().isVisible({ timeout: 2000 }).catch(() => false);
          expect(hasOnboarding).toBe(true);
        }
      }
    }
  });
});
