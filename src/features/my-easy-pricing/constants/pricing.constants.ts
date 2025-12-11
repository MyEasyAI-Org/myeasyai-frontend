// =============================================================================
// PRICING_LABELS - Todos os textos da UI centralizados para i18n
// REGRA: NUNCA hardcodar textos diretamente nos componentes
// =============================================================================

export const PRICING_LABELS = {
  // -------------------------------------------------------------------------
  // Header e Navegacao
  // -------------------------------------------------------------------------
  header: {
    title: 'MyEasyPricing',
    subtitle: 'Calculadora de Precificação',
    backToDashboard: 'Voltar ao Dashboard',
  },

  // -------------------------------------------------------------------------
  // Lojas
  // -------------------------------------------------------------------------
  stores: {
    title: 'Selecionar Loja',
    newStore: 'Nova Loja',
    editStore: 'Editar Loja',
    deleteStore: 'Excluir Loja',
    placeholder: 'Selecione uma loja...',
    noStores: 'Nenhuma loja criada ainda.',
    createFirst: 'Crie sua primeira loja para comecar.',
    createFirstButton: 'Criar Nova Loja',
    modal: {
      titleCreate: 'Nova Loja',
      titleEdit: 'Editar Loja',
      nameLabel: 'Nome da loja/tabela de precos',
      namePlaceholder: 'Ex: Minha Loja Principal',
      descriptionLabel: 'Descricao (opcional)',
      descriptionPlaceholder: 'Descreva o proposito desta tabela de precos...',
      allocationMethodLabel: 'Método de rateio de custos',
      allocationMethods: {
        equal: 'Igual',
        weighted: 'Por peso',
        revenue_based: 'Por receita',
      },
      cancel: 'Cancelar',
      save: 'Salvar',
      create: 'Criar Loja',
      saving: 'Salvando...',
    },
  },

  // -------------------------------------------------------------------------
  // Produtos
  // -------------------------------------------------------------------------
  products: {
    title: 'Selecionar Produto',
    newProduct: 'Novo Produto',
    editProduct: 'Editar Produto',
    deleteProduct: 'Excluir Produto',
    placeholder: 'Selecione um produto...',
    noProducts: 'Nenhum produto cadastrado.',
    createFirst: 'Adicione seu primeiro produto para ver os calculos.',
    createFirstButton: '+ Criar Primeiro Produto',
    modal: {
      titleCreate: 'Novo Produto',
      titleEdit: 'Editar Produto',
      nameLabel: 'Nome do produto',
      namePlaceholder: 'Ex: Camiseta Basica',
      descriptionLabel: 'Descricao (opcional)',
      directCostLabel: 'Custo direto por unidade',
      directCostPlaceholder: 'R$ 0,00',
      unitTypeLabel: 'Tipo de unidade',
      unitTypes: {
        unit: 'Unidade',
        hour: 'Hora',
        kg: 'Quilograma',
        meter: 'Metro',
        service: 'Servico',
      },
      marginLabel: 'Margem desejada (%)',
      marginPlaceholder: '30',
      positioningLabel: 'Posicionamento',
      positionings: {
        premium: 'Premium',
        intermediate: 'Intermediario',
        economy: 'Economico',
      },
      marketPriceLabel: 'Preco de mercado (referencia)',
      marketPricePlaceholder: 'R$ 0,00 (opcional)',
      weightLabel: 'Peso para rateio',
      weightPlaceholder: '1',
      monthlyEstimateLabel: 'Estimativa de vendas/mes',
      monthlyEstimatePlaceholder: '100',
      cancel: 'Cancelar',
      create: 'Criar Produto',
      save: 'Salvar',
      saving: 'Salvando...',
    },
  },

  // -------------------------------------------------------------------------
  // Abas Principais
  // -------------------------------------------------------------------------
  mainTabs: {
    store: 'Loja',
    product: 'Produto',
    costs: 'Custos',
  },

  // -------------------------------------------------------------------------
  // Abas de Configuracao (sub-abas)
  // -------------------------------------------------------------------------
  tabs: {
    indirectCosts: 'Custos Indiretos',
    hiddenCosts: 'Custos Ocultos',
    taxes: 'Impostos e Taxas',
    product: 'Produto',
  },

  // -------------------------------------------------------------------------
  // Formularios Gerais
  // -------------------------------------------------------------------------
  forms: {
    name: 'Nome',
    description: 'Descricao',
    value: 'Valor',
    percentage: 'Percentual',
    frequency: 'Frequencia',
    frequencies: {
      monthly: 'Mensal',
      yearly: 'Anual',
      one_time: 'Unico',
    },
    amortization: 'Diluir em (meses)',
    amortizationPlaceholder: '12',
    addCost: '+ Adicionar custo',
    addTax: '+ Adicionar taxa',
    remove: 'Remover',
    save: 'Salvar',
    cancel: 'Cancelar',
    monthlyTotal: 'Total mensal',
    taxTotal: 'Total de taxas',
  },

  // -------------------------------------------------------------------------
  // Custos Indiretos - Sugestoes
  // -------------------------------------------------------------------------
  indirectCosts: {
    title: 'Custos Indiretos',
    subtitle: 'Gastos fixos independentes do numero de vendas',
    suggestions: {
      rent: 'Aluguel',
      utilities: 'Energia/Agua',
      salaries: 'Salarios',
      marketing: 'Marketing',
      tools: 'Ferramentas/Software',
      accountant: 'Contador',
    },
    addCustom: 'Outro custo',
  },

  // -------------------------------------------------------------------------
  // Custos Ocultos - Sugestoes e Campos Auxiliares
  // -------------------------------------------------------------------------
  hiddenCosts: {
    title: 'Custos Ocultos',
    subtitle: 'Despesas reais que voce geralmente esquece de contabilizar',
    suggestions: {
      vehicle_depreciation: 'Veiculo',
      food: 'Alimentacao',
      work_clothes: 'Roupas',
      packaging: 'Materiais',
      electricity_home: 'Energia Home',
      internet_personal: 'Internet/Tel',
      unpaid_time: 'Tempo',
      equipment_depreciation: 'Equipamentos',
    },
    addCustom: 'Outro custo',
    auxiliary: {
      vehicle: {
        title: 'Depreciacao de Veiculo',
        description: 'Toda vez que voce usa seu veiculo para trabalhar, ele perde valor e gera custos.',
        kmMonthly: 'Km medio mensal para trabalho',
        vehicleType: 'Tipo de veiculo',
        vehicleTypes: {
          car: 'Carro',
          motorcycle: 'Moto',
        },
        workPercentage: '% uso para trabalho',
        costPerKm: 'Custo por km (R$)',
        calculatedValue: 'Valor calculado',
        useCustomValue: 'Usar valor personalizado',
      },
      food: {
        title: 'Alimentacao na rua',
        description: 'Se voce trabalha fora, gasta com alimentacao extra.',
        dailyExpense: 'Gasto medio por dia',
        daysPerMonth: 'Dias por mes trabalhando fora',
      },
      electricity: {
        title: 'Energia Eletrica (home office)',
        description: 'Trabalhar em casa gera custos extras na conta de energia.',
        hoursPerDay: 'Horas por dia trabalhando em casa',
        daysPerMonth: 'Dias por mes trabalhando em casa',
        costPerHour: 'Custo por hora (R$)',
        hasAc: 'Usa ar-condicionado?',
      },
      unpaidTime: {
        title: 'Tempo nao remunerado',
        description: 'Seu tempo tem valor, mesmo quando nao esta produzindo diretamente.',
        hoursPerWeek: 'Horas semanais em atividades nao remuneradas',
        hourlyRate: 'Valor/hora desejado',
        weeksPerMonth: 'Semanas por mes',
      },
      equipment: {
        title: 'Depreciacao de Equipamentos',
        description: 'Equipamentos usados no trabalho desgastam e precisam ser substituidos.',
        equipmentValue: 'Valor do equipamento',
        usefulLifeMonths: 'Vida util (meses)',
      },
    },
  },

  // -------------------------------------------------------------------------
  // Impostos e Taxas
  // -------------------------------------------------------------------------
  taxes: {
    title: 'Impostos e Taxas',
    subtitle: 'Taxas que incidem sobre cada venda',
    regimeLabel: 'Regime tributario',
    regimes: {
      simples: 'Simples Nacional',
      mei: 'MEI',
      lucro_presumido: 'Lucro Presumido',
      lucro_real: 'Lucro Real',
    },
    suggestions: {
      card_fee: 'Taxa de Cartao',
      marketplace_fee: 'Marketplace',
      commission: 'Comissao',
    },
    addCustom: 'Outra taxa',
  },

  // -------------------------------------------------------------------------
  // Sliders de Ajuste
  // -------------------------------------------------------------------------
  sliders: {
    title: 'Ajuste de Preco',
    marginLabel: 'Margem de Lucro Bruta',
    priceLabel: 'Preco Final',
    costLabel: 'Custo Total',
    profitLabel: 'Lucro por Unidade',
    netMarginLabel: 'Margem Liquida',
    applyButton: 'Aplicar',
    discardButton: 'Descartar',
  },

  // -------------------------------------------------------------------------
  // Tabela
  // -------------------------------------------------------------------------
  table: {
    title: 'Tabela de Precos',
    columns: {
      product: 'Produto',
      directCost: 'C. Direto',
      indirectCost: 'C. Indireto',
      hiddenCost: 'C. Oculto',
      taxes: 'Taxas',
      totalCost: 'C. Total',
      price: 'Preco',
      grossMargin: 'Margem Bruta',
      netMargin: 'Margem Liquida',
      profit: 'Lucro',
      breakEven: 'Ponto Equil.',
      marketComparison: 'vs Mercado',
    },
    summary: {
      title: 'Gastos da Loja',
      indirectCostsMonthly: 'Custos Indiretos Mensais',
      hiddenCostsMonthly: 'Custos Ocultos Mensais',
      taxesTotal: 'Taxas/Impostos Totais',
    },
    empty: {
      title: 'Nenhum produto cadastrado',
      description: 'Adicione seu primeiro produto para ver os calculos de precificacao aqui.',
      button: '+ Criar Primeiro Produto',
    },
    marketComparison: {
      below: 'Abaixo',
      equal: 'Igual',
      above: 'Acima',
    },
    costsBreakdown: {
      title: 'Detalhamento de Custos da Loja',
      indirectCosts: 'Custos Indiretos',
      hiddenCosts: 'Custos Ocultos',
      taxes: 'Impostos e Taxas',
      columns: {
        name: 'Nome',
        category: 'Categoria',
        originalValue: 'Valor Original',
        frequency: 'Frequencia',
        monthlyValue: 'Valor Mensal',
        percentage: 'Percentual',
      },
      subtotal: 'Subtotal',
      total: 'Total Geral de Custos',
      categories: {
        // Indirect costs
        rent: 'Aluguel',
        utilities: 'Energia/Agua',
        salaries: 'Salarios',
        marketing: 'Marketing',
        tools: 'Ferramentas',
        accountant: 'Contador',
        // Hidden costs
        vehicle_depreciation: 'Veiculo',
        food: 'Alimentacao',
        work_clothes: 'Roupas',
        packaging: 'Materiais',
        electricity_home: 'Energia Home',
        internet_personal: 'Internet/Tel',
        unpaid_time: 'Tempo',
        equipment_depreciation: 'Equipamentos',
        // Taxes
        tax_rate: 'Imposto',
        card_fee: 'Taxa Cartao',
        marketplace_fee: 'Marketplace',
        commission: 'Comissao',
        other: 'Outro',
      },
    },
  },

  // -------------------------------------------------------------------------
  // Exportacao
  // -------------------------------------------------------------------------
  export: {
    title: 'Exportar Tabela',
    hideColumns: 'Ocultar colunas (substituir por ***)',
    hideProducts: 'Ocultar produtos (linhas)',
    info: 'Valores ocultos aparecem como "***" na exportacao, mas continuam funcionando nos calculos da tabela original.',
    exportExcel: 'Exportar Excel',
    exportPdf: 'Exportar PDF',
    cancel: 'Cancelar',
    excelButton: 'Excel',
    pdfButton: 'PDF',
  },

  // -------------------------------------------------------------------------
  // Tutorial
  // -------------------------------------------------------------------------
  tutorial: {
    button: '? Tutorial',
    next: 'Proximo',
    previous: 'Anterior',
    skip: 'Pular tutorial',
    finish: 'Finalizar',
    keepDemoData: 'Deseja manter os dados de exemplo?',
    keepDemoYes: 'Sim, manter',
    keepDemoNo: 'Nao, excluir',
    demoStoreName: 'Loja Demonstracao',
    demoProductName: 'Produto Exemplo',
    steps: {
      store: {
        title: 'Selecione uma Loja',
        description: 'Crie ou selecione uma loja para comecar. Cada loja e uma tabela de precos independente.',
      },
      costsTabIntro: {
        title: 'Aba de Custos',
        description: 'Nesta aba voce configura todos os custos do seu negocio: indiretos, ocultos e impostos. Esses valores sao rateados entre seus produtos.',
      },
      indirectCosts: {
        title: 'Custos Indiretos',
        description: 'Configure os custos fixos do seu negocio: aluguel, energia, salarios, etc.',
      },
      hiddenCosts: {
        title: 'Custos Ocultos',
        description: 'Inclua custos que voce normalmente esquece: veiculo, alimentacao, tempo nao pago.',
      },
      taxes: {
        title: 'Impostos e Taxas',
        description: 'Defina impostos e taxas que incidem sobre cada venda.',
      },
      productTabIntro: {
        title: 'Aba de Produto',
        description: 'Nesta aba voce cadastra e gerencia seus produtos. Aqui voce define custos diretos, margem desejada e ajusta precos.',
      },
      product: {
        title: 'Adicione Produtos',
        description: 'Cadastre seus produtos com custos e margens desejadas.',
      },
      table: {
        title: 'Veja os Calculos',
        description: 'A tabela mostra todos os calculos em tempo real.',
      },
      export: {
        title: 'Exporte seus Dados',
        description: 'Exporte sua tabela de precos para Excel ou PDF.',
      },
      exportHide: {
        title: 'Ocultar Colunas e Linhas',
        description: 'Ao exportar, voce pode ocultar colunas sensiveis (como custos) e linhas de produtos especificos. Os valores ocultos aparecem como "***" no arquivo exportado.',
      },
    },
  },

  // -------------------------------------------------------------------------
  // Tooltips (Explicacoes Didaticas)
  // -------------------------------------------------------------------------
  tooltips: {
    directCost: 'Tudo que aumenta quando voce vende mais: materiais, tempo do profissional, insumos, taxas por venda.',
    indirectCost: 'Gastos que acontecem independente do numero de vendas: aluguel, internet, contador, ferramentas.',
    hiddenCost: 'Despesas reais nao contabilizadas que reduzem o lucro sem voce perceber.',
    totalCost: 'Custo Direto + Custos Indiretos Rateados + Custos Ocultos Rateados',
    markup: 'Percentual aplicado sobre os custos para chegar ao preco final. Preco = Custo x (1 + Markup%)',
    grossMargin: 'Lucro antes das despesas fixas. Formula: (Lucro Bruto / Preco) x 100',
    netMargin: 'Lucro final apos todos os custos e despesas. Formula: (Lucro Liquido / Preco) x 100',
    contributionMargin: 'Quanto sobra por unidade apos custos variaveis. Fundamental para entender rentabilidade.',
    breakEven: 'Quantas unidades precisam ser vendidas para cobrir todos os custos. Formula: Custos Fixos / Margem de Contribuicao',
    allocationEqual: 'Divide os custos igualmente entre todos os produtos.',
    allocationWeighted: 'Distribui os custos proporcionalmente ao peso definido em cada produto.',
    allocationRevenue: 'Distribui os custos proporcionalmente a receita estimada de cada produto.',
    amortization: 'Para custos unicos: em quantos meses voce quer diluir esse gasto.',
    // Novos tooltips para ProductModal
    weight: 'Define a proporcao usada para rateio quando o metodo e "Por peso".',
    monthlyEstimate: 'Quantidade estimada vendida por mes - usada para rateio por receita.',
    marketPrice: 'Preco de referencia do mercado para comparar seu preco sugerido.',
    positioning: 'Estrategia de preco: premium (acima do mercado), intermediario ou economico (abaixo do mercado).',
    // Tooltip para TaxConfigForm
    taxImpact: 'Impostos e taxas sao aplicados sobre o preco final de venda.',
  },

  // -------------------------------------------------------------------------
  // Mensagens
  // -------------------------------------------------------------------------
  messages: {
    saved: 'Salvo com sucesso!',
    deleted: 'Excluido com sucesso!',
    error: 'Ocorreu um erro. Tente novamente.',
    required: 'Campo obrigatorio',
    invalidValue: 'Valor invalido',
    loading: 'Carregando...',
    saving: 'Salvando...',
    confirmDelete: 'Tem certeza que deseja excluir?',
    confirmDeleteStore: 'Excluir esta loja removera todos os custos e produtos associados.',
    confirmDeleteProduct: 'Tem certeza que deseja excluir este produto?',
  },

  // -------------------------------------------------------------------------
  // Estados Vazios
  // -------------------------------------------------------------------------
  empty: {
    noStores: 'Nenhuma loja criada ainda.',
    noProducts: 'Nenhum produto cadastrado.',
    noCosts: 'Nenhum custo adicionado.',
    noTaxes: 'Nenhuma taxa adicionada.',
    createFirst: 'Crie seu primeiro item para comecar.',
  },
} as const;

// Tipo para garantir type-safety nas traducoes
export type PricingLabels = typeof PRICING_LABELS;

// =============================================================================
// Constantes de Calculo
// =============================================================================

export const CALCULATION_CONSTANTS = {
  // ---------------------------------------------------------------------------
  // Constantes de Tempo (configuráveis)
  // ---------------------------------------------------------------------------
  time: {
    workingDaysPerMonth: 22,    // Dias úteis médios por mês
    weeksPerMonth: 4.33,        // Semanas médias por mês (52 ÷ 12)
  },

  // ---------------------------------------------------------------------------
  // Depreciação de Veículo (R$/km)
  // ---------------------------------------------------------------------------
  vehicleDepreciationPerKm: {
    car: 0.7,                   // R$ 0,70 por km (carro)
    motorcycle: 0.35,           // R$ 0,35 por km (moto)
  },

  // ---------------------------------------------------------------------------
  // Custo de Energia por Hora (home office)
  // ---------------------------------------------------------------------------
  electricityPerHour: {
    withoutAc: 0.5,             // R$ 0,50 por hora (sem ar-condicionado)
    withAc: 1.5,                // R$ 1,50 por hora (com ar-condicionado)
  },

  // ---------------------------------------------------------------------------
  // Valores Padrão para Formulários
  // ---------------------------------------------------------------------------
  defaults: {
    amortizationMonths: 12,     // Meses para diluir custo único
    marginPercentage: 30,       // Margem de lucro padrão (%)
    weight: 1,                  // Peso padrão para rateio
    monthlyUnitsEstimate: 100,  // Estimativa de vendas/mês
    equipmentUsefulLife: 36,    // Vida útil de equipamentos (meses)
    workPercentage: 100,        // % de uso para trabalho
    foodDaysPerMonth: 22,       // Dias/mês de alimentação fora
  },
};

// =============================================================================
// Sugestoes de Custos (para os chips clicaveis)
// =============================================================================

export const COST_SUGGESTIONS = {
  indirect: [
    { id: 'rent', label: PRICING_LABELS.indirectCosts.suggestions.rent, category: 'rent' as const },
    { id: 'utilities', label: PRICING_LABELS.indirectCosts.suggestions.utilities, category: 'utilities' as const },
    { id: 'salaries', label: PRICING_LABELS.indirectCosts.suggestions.salaries, category: 'salaries' as const },
    { id: 'marketing', label: PRICING_LABELS.indirectCosts.suggestions.marketing, category: 'marketing' as const },
    { id: 'tools', label: PRICING_LABELS.indirectCosts.suggestions.tools, category: 'tools' as const },
    { id: 'accountant', label: PRICING_LABELS.indirectCosts.suggestions.accountant, category: 'accountant' as const },
  ],
  hidden: [
    { id: 'vehicle', label: PRICING_LABELS.hiddenCosts.suggestions.vehicle_depreciation, category: 'vehicle_depreciation' as const, hasAuxiliary: true },
    { id: 'food', label: PRICING_LABELS.hiddenCosts.suggestions.food, category: 'food' as const, hasAuxiliary: true },
    { id: 'clothes', label: PRICING_LABELS.hiddenCosts.suggestions.work_clothes, category: 'work_clothes' as const, hasAuxiliary: false },
    { id: 'packaging', label: PRICING_LABELS.hiddenCosts.suggestions.packaging, category: 'packaging' as const, hasAuxiliary: false },
    { id: 'electricity', label: PRICING_LABELS.hiddenCosts.suggestions.electricity_home, category: 'electricity_home' as const, hasAuxiliary: true },
    { id: 'internet', label: PRICING_LABELS.hiddenCosts.suggestions.internet_personal, category: 'internet_personal' as const, hasAuxiliary: false },
    { id: 'time', label: PRICING_LABELS.hiddenCosts.suggestions.unpaid_time, category: 'unpaid_time' as const, hasAuxiliary: true },
    { id: 'equipment', label: PRICING_LABELS.hiddenCosts.suggestions.equipment_depreciation, category: 'equipment_depreciation' as const, hasAuxiliary: true },
  ],
  taxes: [
    { id: 'card', label: PRICING_LABELS.taxes.suggestions.card_fee },
    { id: 'marketplace', label: PRICING_LABELS.taxes.suggestions.marketplace_fee },
    { id: 'commission', label: PRICING_LABELS.taxes.suggestions.commission },
  ],
};
