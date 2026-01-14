/**
 * Trending hashtags and topics by business niche
 * Curated list of popular hashtags for Brazilian market
 */

import type { BusinessNiche, SocialNetwork } from '../types';

export interface TrendingHashtag {
  tag: string;
  popularity: 'high' | 'medium' | 'rising';
  networks: SocialNetwork[];
}

export interface TrendingTopic {
  title: string;
  description: string;
  hashtags: string[];
  contentIdeas: string[];
}

export interface NicheTrends {
  hashtags: TrendingHashtag[];
  topics: TrendingTopic[];
  tips: string[];
}

// Hashtags populares por nicho
export const TRENDING_BY_NICHE: Record<BusinessNiche, NicheTrends> = {
  restaurant: {
    hashtags: [
      { tag: '#foodporn', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#comidaboa', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#gastronomia', popularity: 'high', networks: ['instagram', 'linkedin'] },
      { tag: '#restaurante', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#cheflife', popularity: 'medium', networks: ['instagram', 'tiktok'] },
      { tag: '#foodie', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#instafood', popularity: 'high', networks: ['instagram'] },
      { tag: '#comidacaseira', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#delivery', popularity: 'rising', networks: ['instagram', 'facebook'] },
      { tag: '#sabor', popularity: 'medium', networks: ['instagram'] },
      { tag: '#receita', popularity: 'rising', networks: ['instagram', 'tiktok', 'youtube'] },
      { tag: '#culinaria', popularity: 'medium', networks: ['instagram', 'youtube'] },
    ],
    topics: [
      {
        title: 'Bastidores da Cozinha',
        description: 'Mostre o preparo dos pratos e a equipe trabalhando',
        hashtags: ['#bastidores', '#cozinha', '#cheflife'],
        contentIdeas: [
          'Time-lapse do preparo de um prato especial',
          'Apresente seu chef e a historia dele',
          'Mostre ingredientes frescos chegando',
        ],
      },
      {
        title: 'Pratos do Dia',
        description: 'Destaque promocoes e novidades do cardapio',
        hashtags: ['#pratododia', '#promocao', '#novidade'],
        contentIdeas: [
          'Anuncie o prato especial da semana',
          'Crie enquetes sobre novos sabores',
          'Mostre antes/depois de um prato sendo montado',
        ],
      },
    ],
    tips: [
      'Poste fotos de pratos entre 11h-13h (hora do almoco)',
      'Videos curtos de preparo performam muito bem no Reels/TikTok',
      'Responda comentarios rapidamente para aumentar engajamento',
    ],
  },

  retail: {
    hashtags: [
      { tag: '#compras', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#promocao', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#oferta', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#loja', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#novidades', popularity: 'medium', networks: ['instagram'] },
      { tag: '#tendencia', popularity: 'rising', networks: ['instagram', 'tiktok'] },
      { tag: '#estilo', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#moda', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#lookdodia', popularity: 'medium', networks: ['instagram'] },
      { tag: '#descontos', popularity: 'rising', networks: ['instagram', 'facebook'] },
      { tag: '#blackfriday', popularity: 'high', networks: ['instagram', 'facebook', 'twitter'] },
      { tag: '#compraonline', popularity: 'rising', networks: ['instagram', 'facebook'] },
    ],
    topics: [
      {
        title: 'Novidades da Colecao',
        description: 'Apresente lancamentos e produtos em destaque',
        hashtags: ['#lancamento', '#novidade', '#colecao'],
        contentIdeas: [
          'Unboxing de novos produtos',
          'Combinacoes de looks com pecas da loja',
          'Bastidores da selecao de produtos',
        ],
      },
      {
        title: 'Depoimentos de Clientes',
        description: 'Compartilhe experiencias reais de compradores',
        hashtags: ['#clientefeliz', '#depoimento', '#recomendo'],
        contentIdeas: [
          'Reposte stories de clientes usando seus produtos',
          'Crie cards com avaliacoes positivas',
          'Faca videos de clientes na loja',
        ],
      },
    ],
    tips: [
      'Use carrosséis para mostrar varios angulos do produto',
      'Crie urgencia com contagem regressiva nos Stories',
      'Responda DMs rapidamente - muitas vendas comecam ali',
    ],
  },

  consulting: {
    hashtags: [
      { tag: '#consultoria', popularity: 'high', networks: ['linkedin', 'instagram'] },
      { tag: '#negocios', popularity: 'high', networks: ['linkedin', 'instagram'] },
      { tag: '#empreendedorismo', popularity: 'high', networks: ['linkedin', 'instagram'] },
      { tag: '#gestao', popularity: 'medium', networks: ['linkedin'] },
      { tag: '#lideranca', popularity: 'high', networks: ['linkedin'] },
      { tag: '#estrategia', popularity: 'medium', networks: ['linkedin'] },
      { tag: '#produtividade', popularity: 'rising', networks: ['linkedin', 'instagram'] },
      { tag: '#carreira', popularity: 'high', networks: ['linkedin'] },
      { tag: '#sucesso', popularity: 'medium', networks: ['linkedin', 'instagram'] },
      { tag: '#dicas', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#mentoria', popularity: 'rising', networks: ['linkedin', 'instagram'] },
      { tag: '#businesstips', popularity: 'medium', networks: ['linkedin', 'twitter'] },
    ],
    topics: [
      {
        title: 'Dicas Praticas',
        description: 'Compartilhe conhecimento actionavel',
        hashtags: ['#dicasdenegocios', '#aprenda', '#conhecimento'],
        contentIdeas: [
          'Lista de 5 erros comuns que empresas cometem',
          'Framework simples para resolver um problema',
          'Case de sucesso de um cliente (com permissao)',
        ],
      },
      {
        title: 'Tendencias do Mercado',
        description: 'Analise cenarios e oportunidades',
        hashtags: ['#tendencias', '#mercado', '#analise'],
        contentIdeas: [
          'Sua opiniao sobre uma noticia relevante do setor',
          'Previsoes para o proximo trimestre',
          'O que mudou no mercado nos ultimos anos',
        ],
      },
    ],
    tips: [
      'LinkedIn e sua principal plataforma - poste artigos longos',
      'Compartilhe dados e estatisticas para gerar credibilidade',
      'Responda a posts de outros especialistas para aumentar visibilidade',
    ],
  },

  health: {
    hashtags: [
      { tag: '#saude', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#bemestar', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#qualidadedevida', popularity: 'medium', networks: ['instagram'] },
      { tag: '#medicina', popularity: 'medium', networks: ['instagram', 'linkedin'] },
      { tag: '#prevencao', popularity: 'rising', networks: ['instagram', 'facebook'] },
      { tag: '#saudemental', popularity: 'rising', networks: ['instagram', 'tiktok'] },
      { tag: '#autocuidado', popularity: 'high', networks: ['instagram'] },
      { tag: '#vidasaudavel', popularity: 'high', networks: ['instagram'] },
      { tag: '#dicas', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#medico', popularity: 'medium', networks: ['instagram'] },
      { tag: '#clinica', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#tratamento', popularity: 'medium', networks: ['instagram'] },
    ],
    topics: [
      {
        title: 'Mitos e Verdades',
        description: 'Desmistifique informacoes sobre saude',
        hashtags: ['#mitoseverdades', '#saude', '#informacao'],
        contentIdeas: [
          'Serie de posts desmistificando crencas populares',
          'Video respondendo duvidas frequentes',
          'Carrossel comparando mito vs realidade',
        ],
      },
      {
        title: 'Prevencao',
        description: 'Eduque sobre cuidados preventivos',
        hashtags: ['#prevencao', '#cuidados', '#saude'],
        contentIdeas: [
          'Checklist de exames por faixa etaria',
          'Sinais de alerta que nao devem ser ignorados',
          'Habitos simples para melhorar a saude',
        ],
      },
    ],
    tips: [
      'Cuidado com claims medicos - sempre cite fontes confiaveis',
      'Conteudo educativo gera muito engajamento',
      'Stories com enquetes sobre habitos de saude funcionam bem',
    ],
  },

  beauty: {
    hashtags: [
      { tag: '#beleza', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#makeup', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#maquiagem', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#skincare', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#cabelo', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#beauty', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#tutorial', popularity: 'rising', networks: ['instagram', 'tiktok', 'youtube'] },
      { tag: '#antesedepois', popularity: 'high', networks: ['instagram'] },
      { tag: '#rotina', popularity: 'medium', networks: ['instagram', 'tiktok'] },
      { tag: '#autoestima', popularity: 'medium', networks: ['instagram'] },
      { tag: '#cuidadoscomapele', popularity: 'rising', networks: ['instagram', 'tiktok'] },
      { tag: '#tendencias', popularity: 'medium', networks: ['instagram', 'tiktok'] },
    ],
    topics: [
      {
        title: 'Tutoriais Rapidos',
        description: 'Ensine tecnicas de forma simples e pratica',
        hashtags: ['#tutorial', '#aprenda', '#passoapasso'],
        contentIdeas: [
          'Make de 5 minutos para o dia a dia',
          'Como aplicar produto X corretamente',
          'Erros comuns e como evitar',
        ],
      },
      {
        title: 'Transformacoes',
        description: 'Mostre resultados impressionantes',
        hashtags: ['#antesedepois', '#transformacao', '#resultado'],
        contentIdeas: [
          'Antes e depois de procedimentos',
          'Evolucao de tratamentos ao longo do tempo',
          'Cliente do mes com sua historia',
        ],
      },
    ],
    tips: [
      'Videos curtos com tutoriais sao os que mais viralizam',
      'Use boa iluminacao - faz toda diferenca em conteudo de beleza',
      'Reels e TikTok sao essenciais para esse nicho',
    ],
  },

  education: {
    hashtags: [
      { tag: '#educacao', popularity: 'high', networks: ['instagram', 'linkedin'] },
      { tag: '#aprendizado', popularity: 'high', networks: ['instagram', 'linkedin'] },
      { tag: '#conhecimento', popularity: 'medium', networks: ['instagram', 'linkedin'] },
      { tag: '#estudos', popularity: 'high', networks: ['instagram'] },
      { tag: '#cursos', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#professor', popularity: 'medium', networks: ['instagram'] },
      { tag: '#dicas', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#estude', popularity: 'medium', networks: ['instagram'] },
      { tag: '#concursos', popularity: 'rising', networks: ['instagram', 'youtube'] },
      { tag: '#vestibular', popularity: 'medium', networks: ['instagram', 'tiktok'] },
      { tag: '#enem', popularity: 'rising', networks: ['instagram', 'tiktok', 'youtube'] },
      { tag: '#aprenda', popularity: 'high', networks: ['instagram', 'tiktok'] },
    ],
    topics: [
      {
        title: 'Dicas de Estudo',
        description: 'Ajude alunos a estudar melhor',
        hashtags: ['#dicasdeestudo', '#estudar', '#foco'],
        contentIdeas: [
          'Tecnicas de memorizacao que funcionam',
          'Como montar um cronograma de estudos',
          'Apps e ferramentas uteis para estudantes',
        ],
      },
      {
        title: 'Conteudo Educativo',
        description: 'Ensine de forma simples e engajante',
        hashtags: ['#aprenda', '#educacao', '#conhecimento'],
        contentIdeas: [
          'Explique um conceito dificil de forma simples',
          'Resumo visual de um topico importante',
          'Quiz interativo nos Stories',
        ],
      },
    ],
    tips: [
      'Carrosseis educativos tem alta taxa de salvamento',
      'Use linguagem acessivel, evite jargoes',
      'Videos curtos explicando conceitos viralizam no TikTok',
    ],
  },

  technology: {
    hashtags: [
      { tag: '#tecnologia', popularity: 'high', networks: ['instagram', 'linkedin', 'twitter'] },
      { tag: '#tech', popularity: 'high', networks: ['instagram', 'twitter', 'linkedin'] },
      { tag: '#inovacao', popularity: 'high', networks: ['linkedin', 'instagram'] },
      { tag: '#programacao', popularity: 'medium', networks: ['instagram', 'linkedin'] },
      { tag: '#desenvolvedor', popularity: 'medium', networks: ['linkedin', 'twitter'] },
      { tag: '#startup', popularity: 'high', networks: ['linkedin', 'twitter'] },
      { tag: '#ia', popularity: 'rising', networks: ['linkedin', 'twitter', 'instagram'] },
      { tag: '#inteligenciaartificial', popularity: 'rising', networks: ['linkedin', 'instagram'] },
      { tag: '#digital', popularity: 'medium', networks: ['linkedin', 'instagram'] },
      { tag: '#futuro', popularity: 'medium', networks: ['linkedin'] },
      { tag: '#software', popularity: 'medium', networks: ['linkedin', 'twitter'] },
      { tag: '#coding', popularity: 'medium', networks: ['instagram', 'twitter'] },
    ],
    topics: [
      {
        title: 'Novidades Tech',
        description: 'Comente lancamentos e tendencias',
        hashtags: ['#tecnews', '#novidade', '#lancamento'],
        contentIdeas: [
          'Review de novo produto/servico',
          'O que muda com a nova atualizacao X',
          'Comparativo entre ferramentas',
        ],
      },
      {
        title: 'Tutoriais e Dicas',
        description: 'Ensine a usar ferramentas e tecnologias',
        hashtags: ['#tutorial', '#dicas', '#aprenda'],
        contentIdeas: [
          'Como fazer X em 60 segundos',
          'Ferramenta que vai mudar sua produtividade',
          'Atalhos que todo mundo deveria conhecer',
        ],
      },
    ],
    tips: [
      'Twitter/X e LinkedIn sao as principais redes para tech',
      'Threads explicando conceitos complexos performam bem',
      'Compartilhe sua opiniao sobre noticias do setor',
    ],
  },

  fitness: {
    hashtags: [
      { tag: '#fitness', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#treino', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#academia', popularity: 'high', networks: ['instagram'] },
      { tag: '#musculacao', popularity: 'medium', networks: ['instagram'] },
      { tag: '#saude', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#gym', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#workout', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#emagrecer', popularity: 'rising', networks: ['instagram', 'tiktok'] },
      { tag: '#dieta', popularity: 'medium', networks: ['instagram'] },
      { tag: '#personaltrainer', popularity: 'medium', networks: ['instagram'] },
      { tag: '#motivacao', popularity: 'high', networks: ['instagram'] },
      { tag: '#foco', popularity: 'medium', networks: ['instagram'] },
    ],
    topics: [
      {
        title: 'Treinos Rapidos',
        description: 'Exercicios praticos para fazer em qualquer lugar',
        hashtags: ['#treino', '#exercicio', '#emcasa'],
        contentIdeas: [
          'Treino de 15 minutos sem equipamento',
          'Exercicio do dia com demonstracao',
          'Serie de 7 dias de desafio fitness',
        ],
      },
      {
        title: 'Transformacoes',
        description: 'Inspire com resultados reais',
        hashtags: ['#antesedepois', '#transformacao', '#resultado'],
        contentIdeas: [
          'Historia de transformacao de um aluno',
          'Sua propria jornada fitness',
          'Comparativo de evolucao mes a mes',
        ],
      },
    ],
    tips: [
      'Videos de exercicios curtos sao muito compartilhados',
      'Poste nos horarios que as pessoas vao para academia (6h, 18h)',
      'Mostre sua rotina real, nao so os momentos perfeitos',
    ],
  },

  real_estate: {
    hashtags: [
      { tag: '#imoveis', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#imobiliaria', popularity: 'high', networks: ['instagram', 'facebook'] },
      { tag: '#apartamento', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#casa', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#corretor', popularity: 'medium', networks: ['instagram'] },
      { tag: '#investimento', popularity: 'rising', networks: ['instagram', 'linkedin'] },
      { tag: '#mercadoimobiliario', popularity: 'medium', networks: ['linkedin', 'instagram'] },
      { tag: '#decoracao', popularity: 'high', networks: ['instagram'] },
      { tag: '#arquitetura', popularity: 'high', networks: ['instagram'] },
      { tag: '#tour', popularity: 'medium', networks: ['instagram', 'tiktok', 'youtube'] },
      { tag: '#venda', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#aluguel', popularity: 'medium', networks: ['instagram', 'facebook'] },
    ],
    topics: [
      {
        title: 'Tour Virtual',
        description: 'Mostre imoveis de forma imersiva',
        hashtags: ['#tour', '#imovel', '#conheca'],
        contentIdeas: [
          'Video tour pelo imovel destacando diferenciais',
          'Antes e depois de uma reforma',
          'Os 3 melhores imoveis da semana',
        ],
      },
      {
        title: 'Dicas para Compradores',
        description: 'Eduque sobre o processo de compra',
        hashtags: ['#dicas', '#primeiroape', '#investimento'],
        contentIdeas: [
          'O que verificar antes de comprar um imovel',
          'Financiamento: passo a passo simplificado',
          'Erros comuns de quem compra o primeiro imovel',
        ],
      },
    ],
    tips: [
      'Videos de tour sao essenciais - invista em boa qualidade',
      'Use drone para mostrar a vizinhanca e localizacao',
      'Reels mostrando "dia na vida de corretor" humanizam a marca',
    ],
  },

  services: {
    hashtags: [
      { tag: '#servicos', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#qualidade', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#profissional', popularity: 'medium', networks: ['instagram', 'linkedin'] },
      { tag: '#trabalho', popularity: 'medium', networks: ['instagram', 'linkedin'] },
      { tag: '#orcamento', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#atendimento', popularity: 'medium', networks: ['instagram', 'facebook'] },
      { tag: '#cliente', popularity: 'medium', networks: ['instagram'] },
      { tag: '#resultado', popularity: 'medium', networks: ['instagram'] },
      { tag: '#antesedepois', popularity: 'high', networks: ['instagram'] },
      { tag: '#dicas', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#facavocemesmo', popularity: 'rising', networks: ['instagram', 'tiktok', 'youtube'] },
      { tag: '#manutencao', popularity: 'medium', networks: ['instagram', 'facebook'] },
    ],
    topics: [
      {
        title: 'Bastidores do Trabalho',
        description: 'Mostre o processo e dedicacao',
        hashtags: ['#bastidores', '#trabalho', '#processo'],
        contentIdeas: [
          'Time-lapse de um servico sendo executado',
          'Ferramentas que voce usa no dia a dia',
          'Desafios e solucoes de um projeto real',
        ],
      },
      {
        title: 'Educacao do Cliente',
        description: 'Ensine quando contratar e o que esperar',
        hashtags: ['#dicas', '#saibamais', '#informacao'],
        contentIdeas: [
          'Sinais de que voce precisa de [servico]',
          'O que esta incluso no orcamento',
          'Como escolher um bom profissional da area',
        ],
      },
    ],
    tips: [
      'Antes e depois sao muito poderosos para servicos',
      'Depoimentos em video de clientes geram confianca',
      'Responda perguntas frequentes em formato de Reels',
    ],
  },

  other: {
    hashtags: [
      { tag: '#empreendedor', popularity: 'high', networks: ['instagram', 'linkedin'] },
      { tag: '#negocios', popularity: 'high', networks: ['instagram', 'linkedin'] },
      { tag: '#sucesso', popularity: 'medium', networks: ['instagram', 'linkedin'] },
      { tag: '#motivacao', popularity: 'medium', networks: ['instagram'] },
      { tag: '#trabalho', popularity: 'medium', networks: ['instagram', 'linkedin'] },
      { tag: '#dicas', popularity: 'high', networks: ['instagram', 'tiktok'] },
      { tag: '#brasil', popularity: 'medium', networks: ['instagram', 'twitter'] },
      { tag: '#novidade', popularity: 'medium', networks: ['instagram'] },
      { tag: '#trending', popularity: 'rising', networks: ['instagram', 'tiktok'] },
      { tag: '#viral', popularity: 'rising', networks: ['tiktok', 'instagram'] },
      { tag: '#fyp', popularity: 'high', networks: ['tiktok'] },
      { tag: '#paravoce', popularity: 'high', networks: ['tiktok'] },
    ],
    topics: [
      {
        title: 'Conteudo de Valor',
        description: 'Compartilhe conhecimento util',
        hashtags: ['#dicas', '#aprenda', '#valor'],
        contentIdeas: [
          'Liste 5 coisas que seu publico precisa saber',
          'Responda as duvidas mais frequentes',
          'Compartilhe sua historia e aprendizados',
        ],
      },
      {
        title: 'Engajamento',
        description: 'Crie conexao com sua audiencia',
        hashtags: ['#comunidade', '#juntos', '#voces'],
        contentIdeas: [
          'Enquete pedindo opiniao dos seguidores',
          'Caixa de perguntas nos Stories',
          'Agradeca marcos importantes (seguidores, aniversario)',
        ],
      },
    ],
    tips: [
      'Consistencia e mais importante que perfeicao',
      'Interaja genuinamente com seus seguidores',
      'Teste diferentes formatos para ver o que funciona',
    ],
  },
};

// Datas comemorativas proximas (para contexto sazonal)
export const UPCOMING_DATES = [
  { date: '14/02', name: 'Dia dos Namorados (EUA)', relevant: ['retail', 'restaurant', 'beauty'] },
  { date: '08/03', name: 'Dia da Mulher', relevant: ['all'] },
  { date: '15/03', name: 'Dia do Consumidor', relevant: ['retail', 'services'] },
  { date: '21/03', name: 'Inicio do Outono', relevant: ['retail', 'beauty', 'fitness'] },
  { date: '01/04', name: 'Dia da Mentira', relevant: ['all'] },
  { date: '21/04', name: 'Tiradentes', relevant: ['education'] },
  { date: '01/05', name: 'Dia do Trabalho', relevant: ['all'] },
  { date: '2o dom maio', name: 'Dia das Maes', relevant: ['all'] },
  { date: '12/06', name: 'Dia dos Namorados (BR)', relevant: ['retail', 'restaurant', 'beauty'] },
  { date: '24/06', name: 'Sao Joao', relevant: ['restaurant', 'retail'] },
  { date: '2o dom agosto', name: 'Dia dos Pais', relevant: ['all'] },
  { date: '07/09', name: 'Independencia', relevant: ['all'] },
  { date: '12/10', name: 'Dia das Criancas', relevant: ['retail', 'education'] },
  { date: '15/10', name: 'Dia do Professor', relevant: ['education'] },
  { date: '31/10', name: 'Halloween', relevant: ['retail', 'restaurant', 'beauty'] },
  { date: '25/11', name: 'Black Friday', relevant: ['all'] },
  { date: '25/12', name: 'Natal', relevant: ['all'] },
  { date: '31/12', name: 'Reveillon', relevant: ['all'] },
];

/**
 * Get trending data for a specific niche
 */
export function getTrendingForNiche(niche: BusinessNiche): NicheTrends {
  return TRENDING_BY_NICHE[niche] || TRENDING_BY_NICHE.other;
}

/**
 * Filter hashtags by network
 */
export function getHashtagsForNetwork(
  niche: BusinessNiche,
  network: SocialNetwork
): TrendingHashtag[] {
  const trends = getTrendingForNiche(niche);
  return trends.hashtags.filter((h) => h.networks.includes(network));
}

/**
 * Get top hashtags (high popularity + rising)
 */
export function getTopHashtags(niche: BusinessNiche, limit = 6): TrendingHashtag[] {
  const trends = getTrendingForNiche(niche);
  return trends.hashtags
    .filter((h) => h.popularity === 'high' || h.popularity === 'rising')
    .slice(0, limit);
}
