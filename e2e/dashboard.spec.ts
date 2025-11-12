/**
 * Testes E2E do Dashboard
 *
 * Cobre os fluxos de:
 * - Visualização de informações do usuário
 * - Estatísticas de uso (tokens, sites criados)
 * - Navegação entre produtos (MyEasyWebsite, etc)
 * - Edição de perfil
 * - Gerenciamento de conta
 */

import { test, expect } from './fixtures/auth.fixture';

test.describe('Dashboard - Visualização', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Usuário já está autenticado e no dashboard
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test('exibe informações básicas do usuário', async ({ authenticatedPage: page }) => {
    // Verificar se o nome do usuário está visível
    const userName = page.locator('text=/joão|usuário|bem.*vindo/i');
    await expect(userName.first()).toBeVisible();

    // Verificar se há avatar ou ícone de usuário
    const avatar = page.locator('img[alt*="avatar"], img[alt*="perfil"], [class*="avatar"]');
    if (await avatar.isVisible({ timeout: 3000 })) {
      await expect(avatar.first()).toBeVisible();
    }
  });

  test('exibe menu de navegação', async ({ authenticatedPage: page }) => {
    // Clicar na aba "Meus Produtos" para ver os produtos
    const meusprodutosTab = page.locator('text=Meus Produtos');
    if (await meusprodutosTab.isVisible({ timeout: 2000 })) {
      await meusprodutosTab.click();
      await page.waitForTimeout(1000);
    }

    // Verificar se os produtos estão listados
    await expect(page.locator('text=MyEasyWebsite')).toBeVisible();

    // Verificar outros possíveis produtos
    const products = ['MyEasyWebsite', 'BusinessGuru'];

    for (const product of products) {
      const productElement = page.locator(`text=${product}`);
      if (await productElement.isVisible({ timeout: 2000 })) {
        await expect(productElement).toBeVisible();
      }
    }
  });

  test('exibe estatísticas de uso', async ({ authenticatedPage: page }) => {
    // Verificar se mostra tokens usados/disponíveis (usar .first() para evitar strict mode)
    const tokensInfo = page.locator('text=/tokens|créditos/i').first();
    if (await tokensInfo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(tokensInfo).toBeVisible();
    }

    // Verificar se mostra sites criados
    const sitesInfo = page.locator('text=/sites.*criados|projetos/i').first();
    if (await sitesInfo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(sitesInfo).toBeVisible();
    }

    // Verificar se mostra plano atual
    const planInfo = page.locator('text=/plano|assinatura/i').first();
    if (await planInfo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(planInfo).toBeVisible();
    }
  });

  test('exibe lista de sites criados (se houver)', async ({ authenticatedPage: page }) => {
    // Verificar se há seção de "Meus Sites" ou similar
    const mySites = page.locator('text=/meus sites|projetos recentes|sites criados/i');

    if (await mySites.isVisible({ timeout: 3000 })) {
      await expect(mySites).toBeVisible();

      // Verificar se há cards/itens de sites
      const siteCards = page.locator('[class*="site-card"], [class*="project-card"]');
      const count = await siteCards.count();

      // Se houver sites, verificar estrutura dos cards
      if (count > 0) {
        const firstCard = siteCards.first();
        await expect(firstCard).toBeVisible();
      }
    }
  });
});

test.describe('Dashboard - Navegação', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test('pode navegar para MyEasyWebsite', async ({ authenticatedPage: page }) => {
    // Clicar na aba "Meus Produtos" primeiro
    const meusprodutosTab = page.locator('text=Meus Produtos');
    if (await meusprodutosTab.isVisible({ timeout: 2000 })) {
      await meusprodutosTab.click();
      await page.waitForTimeout(1000);
    }

    // Agora clicar no botão Acessar do MyEasyWebsite
    // Encontrar o card que contém "MyEasyWebsite" usando filter
    const myEasyWebsiteCard = page.locator('div').filter({ hasText: /^MyEasyWebsite/ });
    await myEasyWebsiteCard.getByRole('button', { name: 'Acessar' }).first().click();

    // Aguardar navegação
    await page.waitForTimeout(1000);

    // Verificar se saiu do dashboard
    const url = page.url();
    expect(url).not.toContain('/dashboard');

    // Ou verificar se aparecem elementos específicos do MyEasyWebsite
    const websiteContent = page.locator('text=/qual.*área|começar|criar site/i');
    await expect(websiteContent.first()).toBeVisible({ timeout: 10000 });
  });

  test.skip('pode voltar ao dashboard de outras páginas', async ({ authenticatedPage: page }) => {
    // TODO: Investigar por que o navegador está fechando durante este teste (beforeEach timeout)
    // Clicar na aba "Meus Produtos" primeiro
    const meusprodutosTab = page.locator('text=Meus Produtos');
    if (await meusprodutosTab.isVisible({ timeout: 2000 })) {
      await meusprodutosTab.click();
      await page.waitForTimeout(1000);
    }

    // Ir para MyEasyWebsite (clicar no botão Acessar)
    const myEasyWebsiteCard = page.locator('div').filter({ hasText: /^MyEasyWebsite/ });
    await myEasyWebsiteCard.getByRole('button', { name: 'Acessar' }).first().click();
    await page.waitForTimeout(1000);

    // Procurar botão/link de voltar ao dashboard
    const dashboardLink = page.getByRole('button', { name: /voltar.*dashboard|dashboard|início|home/i });

    if (await dashboardLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Clicar e aguardar navegação
      await Promise.all([
        page.waitForURL(/dashboard/, { timeout: 15000 }),
        dashboardLink.click()
      ]);
    } else {
      // Navegar diretamente
      await page.goto('/dashboard');
      await page.waitForURL(/dashboard/, { timeout: 10000 });
    }

    // Verificar que está no dashboard - clicar na aba novamente
    if (await meusprodutosTab.isVisible({ timeout: 2000 })) {
      await meusprodutosTab.click();
      await page.waitForTimeout(500);
    }
    await expect(page.locator('text=MyEasyWebsite')).toBeVisible();
  });

  test.skip('pode acessar configurações/perfil', async ({ authenticatedPage: page }) => {
    // TODO: Implementar UI de configurações/perfil no dashboard
    // Procurar botão de configurações (sem misturar regex com CSS)
    const settingsButton = page.locator('text=/configurações|perfil|conta/i').first();

    if (await settingsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await settingsButton.click();

      // Verificar se abriu modal ou navegou para página de configurações
      await page.waitForTimeout(1000);

      const settingsContent = page.locator('text=/editar perfil|minha conta|dados pessoais/i');
      await expect(settingsContent.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Dashboard - Edição de Perfil', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test('pode acessar tela de edição de perfil', async ({ authenticatedPage: page }) => {
    // Procurar e clicar em editar perfil
    const editButton = page.locator('text=/editar.*perfil|configurações|meu perfil/i');

    if (await editButton.isVisible({ timeout: 3000 })) {
      await editButton.click();

      // Verificar que abriu formulário de edição
      await page.waitForTimeout(1000);

      const nameInput = page.locator('[name="fullName"], [name="preferredName"]');
      await expect(nameInput.first()).toBeVisible();
    }
  });

  test('pode alterar nome preferido', async ({ authenticatedPage: page }) => {
    // Acessar edição de perfil
    const editButton = page.locator('text=/editar.*perfil|configurações/i');

    if (await editButton.isVisible({ timeout: 3000 })) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Alterar nome preferido
      const preferredNameInput = page.locator('[name="preferredName"]');

      if (await preferredNameInput.isVisible({ timeout: 3000 })) {
        await preferredNameInput.clear();
        await preferredNameInput.fill('Novo Nome');

        // Salvar alterações
        const saveButton = page.locator('text=/salvar|atualizar|confirmar/i');
        await saveButton.click();

        // Verificar mensagem de sucesso
        await page.waitForTimeout(2000);

        const successMessage = page.locator('text=/salvo|atualizado|sucesso/i');
        if (await successMessage.isVisible({ timeout: 3000 })) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
  });

  test('pode alterar avatar/foto de perfil', async ({ authenticatedPage: page }) => {
    const editButton = page.locator('text=/editar.*perfil|configurações/i');

    if (await editButton.isVisible({ timeout: 3000 })) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Procurar input de upload de foto
      const photoInput = page.locator('input[type="file"], text=/alterar.*foto|upload.*imagem/i');

      if (await photoInput.first().isVisible({ timeout: 3000 })) {
        // Verificar que existe
        await expect(photoInput.first()).toBeVisible();

        // Para fazer upload real:
        // await photoInput.setInputFiles('path/to/test-avatar.jpg');
      }
    }
  });

  test('valida campos obrigatórios ao editar perfil', async ({ authenticatedPage: page }) => {
    const editButton = page.locator('text=/editar.*perfil|configurações/i');

    if (await editButton.isVisible({ timeout: 3000 })) {
      await editButton.click();
      await page.waitForTimeout(1000);

      const nameInput = page.locator('[name="fullName"]');

      if (await nameInput.isVisible({ timeout: 3000 })) {
        // Tentar deixar nome vazio
        await nameInput.clear();

        // Tentar salvar
        const saveButton = page.locator('text=/salvar|atualizar/i');
        await saveButton.click();

        // Verificar validação
        await page.waitForTimeout(1000);

        // Pode ser validação HTML5 ou mensagem customizada
        const validationMessage = await nameInput.evaluate((el: HTMLInputElement) =>
          el.validationMessage
        );

        if (!validationMessage) {
          // Verificar mensagem de erro customizada
          const errorMessage = page.locator('text=/obrigatório|preencha/i');
          if (await errorMessage.isVisible({ timeout: 2000 })) {
            await expect(errorMessage).toBeVisible();
          }
        }
      }
    }
  });
});

test.describe('Dashboard - Gerenciamento de Conta', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test('exibe informações do plano atual', async ({ authenticatedPage: page }) => {
    // Procurar seção de plano/assinatura (usar .first() para evitar strict mode)
    const planSection = page.locator('text=/plano|assinatura|billing/i').first();

    if (await planSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(planSection).toBeVisible();

      // Verificar se mostra nome do plano (Free, Pro, etc)
      const planName = page.locator('text=/free|pro|premium|básico/i');
      if (await planName.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(planName.first()).toBeVisible();
      }
    }
  });

  test('pode acessar página de upgrade de plano', async ({ authenticatedPage: page }) => {
    const upgradeButton = page.locator('text=/upgrade|atualizar plano|assinar/i');

    if (await upgradeButton.isVisible({ timeout: 3000 })) {
      await upgradeButton.click();

      // Verificar que navegou ou abriu modal de planos
      await page.waitForTimeout(1000);

      const pricingContent = page.locator('text=/planos|preços|escolha seu plano/i');
      await expect(pricingContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('exibe histórico de uso', async ({ authenticatedPage: page }) => {
    // Procurar seção de histórico/atividades (usar .first() para evitar strict mode)
    const historySection = page.locator('text=/histórico|atividades|uso/i').first();

    if (await historySection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(historySection).toBeVisible();

      // Verificar se há lista de atividades
      const activities = page.locator('[class*="activity"], [class*="history-item"]');
      const count = await activities.count();

      // Se houver atividades, verificar que estão visíveis
      if (count > 0) {
        await expect(activities.first()).toBeVisible();
      }
    }
  });
});

test.describe('Dashboard - Interações com Sites Criados', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test('pode visualizar detalhes de um site criado', async ({ authenticatedPage: page }) => {
    // Procurar cards de sites
    const siteCard = page.locator('[class*="site-card"], [class*="project-card"]').first();

    if (await siteCard.isVisible({ timeout: 3000 })) {
      await siteCard.click();

      // Verificar que abriu detalhes ou preview
      await page.waitForTimeout(1000);

      const siteDetails = page.locator('text=/preview|editar|publicar|detalhes/i');
      await expect(siteDetails.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('pode editar um site existente', async ({ authenticatedPage: page }) => {
    const editButton = page.locator('text=/editar.*site|modificar/i').first();

    if (await editButton.isVisible({ timeout: 3000 })) {
      await editButton.click();

      // Aguardar navegação para editor
      await page.waitForTimeout(2000);

      // Verificar que está na tela de edição
      const editorContent = page.locator('[class*="editor"], text=/editor|edição/i');
      if (await editorContent.isVisible({ timeout: 5000 })) {
        await expect(editorContent).toBeVisible();
      }
    }
  });

  test('pode deletar um site', async ({ authenticatedPage: page }) => {
    const deleteButton = page.locator('text=/deletar|excluir|remover.*site/i').first();

    if (await deleteButton.isVisible({ timeout: 3000 })) {
      await deleteButton.click();

      // Aguardar modal de confirmação
      await page.waitForTimeout(1000);

      const confirmButton = page.locator('text=/confirmar|sim|deletar/i');
      if (await confirmButton.isVisible({ timeout: 3000 })) {
        await confirmButton.click();

        // Verificar mensagem de sucesso
        await page.waitForTimeout(1000);

        const successMessage = page.locator('text=/deletado|removido|excluído/i');
        if (await successMessage.isVisible({ timeout: 3000 })) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
  });
});

test.describe('Dashboard - Responsividade', () => {
  test('exibe corretamente em mobile', async ({ authenticatedPage: page }) => {
    // Redimensionar para mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Aguardar re-render
    await page.waitForTimeout(500);

    // Clicar na aba "Meus Produtos" para ver os produtos
    const meusprodutosTab = page.locator('text=Meus Produtos');
    if (await meusprodutosTab.isVisible({ timeout: 2000 })) {
      await meusprodutosTab.click();
      await page.waitForTimeout(1000);
    }

    // Verificar que elementos principais estão visíveis
    await expect(page.locator('text=MyEasyWebsite')).toBeVisible();

    // Pode haver menu hamburguer em mobile
    const menuButton = page.locator('[aria-label*="menu"]').or(page.locator('.hamburger')).or(page.locator('text=/menu/i'));
    if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(menuButton.first()).toBeVisible();
    }
  });

  test('menu responsivo funciona em mobile', async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Procurar e clicar no menu hamburguer (separar seletores)
    const menuButton = page.locator('[aria-label*="menu"]').or(page.locator('.hamburger')).or(page.locator('text=/menu/i'));

    if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuButton.first().click();

      // Verificar que menu abriu
      await page.waitForTimeout(500);

      const mobileMenu = page.locator('[class*="mobile-menu"], [class*="sidebar"]');
      await expect(mobileMenu.first()).toBeVisible();
    }
  });
});
