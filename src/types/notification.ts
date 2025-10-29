export type NotificationType = 'platform_update' | 'personal';

export interface Notification {
  id: string;
  title: string;
  message: string;
  fullContent: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  linkUrl?: string;
}

// Mock notifications for testing
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Novo recurso: Editor de Sites com IA',
    message: 'Agora você pode criar e editar sites completos usando inteligência artificial.',
    fullContent: 'Estamos empolgados em anunciar o lançamento do nosso novo Editor de Sites com IA! Agora você pode criar sites profissionais em minutos usando o poder da inteligência artificial. O editor inclui: geração automática de conteúdo, paletas de cores inteligentes, otimização de SEO, e muito mais. Experimente agora mesmo no seu dashboard!',
    type: 'platform_update',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
  },
  {
    id: '2',
    title: 'Seu site foi publicado com sucesso',
    message: 'O deploy do seu site "Minha Loja" foi concluído e está no ar!',
    fullContent: 'Parabéns! O deploy do seu site "Minha Loja" foi concluído com sucesso. Seu site está agora disponível publicamente e pode ser acessado por qualquer pessoa. Você pode visualizar seu site, editar o conteúdo ou verificar as métricas de acesso no seu dashboard.',
    type: 'personal',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
  },
  {
    id: '3',
    title: 'Business Guru: Novas perguntas disponíveis',
    message: 'Adicionamos 20 novas perguntas para ajudar você a estruturar melhor seu negócio.',
    fullContent: 'O Business Guru agora conta com 20 novas perguntas estratégicas desenvolvidas por especialistas em negócios. Estas perguntas vão ajudá-lo a definir melhor seu público-alvo, proposta de valor e estratégias de marketing. Acesse o Business Guru e descubra insights valiosos para o seu negócio!',
    type: 'platform_update',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
  },
  {
    id: '4',
    title: 'Créditos adicionados à sua conta',
    message: 'Você recebeu 100 créditos bônus de boas-vindas!',
    fullContent: 'Bem-vindo ao MyEasyAI! Como agradecimento por se juntar à nossa plataforma, adicionamos 100 créditos bônus à sua conta. Use esses créditos para explorar todos os recursos da plataforma: criar sites, gerar conteúdo com IA, fazer deploys e muito mais. Aproveite!',
    type: 'personal',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
  },
  {
    id: '5',
    title: 'Atualização de segurança importante',
    message: 'Implementamos novas medidas de segurança para proteger sua conta.',
    fullContent: 'A segurança dos nossos usuários é nossa prioridade. Implementamos novas medidas de segurança incluindo: autenticação de dois fatores (em breve), criptografia de ponta a ponta para seus dados, e monitoramento de atividades suspeitas. Suas informações estão mais seguras do que nunca!',
    type: 'platform_update',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
  },
  {
    id: '6',
    title: 'Seu plano foi atualizado',
    message: 'Você agora tem acesso ao plano Pro com todos os recursos premium.',
    fullContent: 'Parabéns pela atualização para o plano Pro! Agora você tem acesso a recursos exclusivos: geração ilimitada de conteúdo com IA, hospedagem de até 10 sites, suporte prioritário 24/7, analytics avançados e muito mais. Explore todos os novos recursos no seu dashboard.',
    type: 'personal',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
  },
  {
    id: '7',
    title: 'Nova integração: Google Analytics',
    message: 'Conecte sua conta do Google Analytics para acompanhar métricas detalhadas.',
    fullContent: 'Lançamos integração oficial com o Google Analytics! Agora você pode conectar sua conta do GA4 e visualizar métricas detalhadas dos seus sites diretamente no dashboard do MyEasyAI. Acompanhe visitantes, conversões, origem do tráfego e muito mais. Configure agora em Configurações > Integrações.',
    type: 'platform_update',
    isRead: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
  },
  {
    id: '8',
    title: 'Build completado: Portfólio Pessoal',
    message: 'O build do seu site foi finalizado sem erros.',
    fullContent: 'O processo de build do seu site "Portfólio Pessoal" foi concluído com sucesso! Não foram detectados erros e seu site está otimizado para performance máxima. Todas as imagens foram comprimidas, o CSS foi minificado e o JavaScript foi otimizado. Seu site está pronto para impressionar!',
    type: 'personal',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
  },
  {
    id: '9',
    title: 'Webinar: Como criar sites que convertem',
    message: 'Participe do nosso webinar gratuito no próximo sábado às 14h.',
    fullContent: 'Junte-se a nós no próximo sábado, 14h (horário de Brasília), para um webinar exclusivo sobre como criar sites que realmente convertem visitantes em clientes. Vamos abordar: princípios de design persuasivo, otimização de CTAs, psicologia das cores, testes A/B e muito mais. Vagas limitadas, inscreva-se agora!',
    type: 'platform_update',
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 dias atrás
  },
  {
    id: '10',
    title: 'Limite de armazenamento atingido',
    message: 'Você está usando 90% do seu espaço de armazenamento.',
    fullContent: 'Você está usando 90% (450MB de 500MB) do seu espaço de armazenamento. Considere fazer upgrade para um plano superior ou deletar arquivos que não estão mais em uso. Com o plano Pro, você tem 5GB de armazenamento. Gerencie seus arquivos em Dashboard > Armazenamento.',
    type: 'personal',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
  },
  {
    id: '11',
    title: 'Desconto especial: 30% OFF no plano anual',
    message: 'Oferta por tempo limitado! Economize 30% no plano anual.',
    fullContent: 'Oferta especial exclusiva para você! Aproveite 30% de desconto no plano anual Pro. Em vez de R$ 588/ano, pague apenas R$ 411/ano. Isso representa uma economia de R$ 177! Oferta válida até o final do mês. Use o cupom ANUAL30 no checkout. Não perca esta oportunidade!',
    type: 'platform_update',
    isRead: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 dias atrás
  },
  {
    id: '12',
    title: 'Bem-vindo ao MyEasyAI!',
    message: 'Estamos felizes em ter você conosco. Veja como começar.',
    fullContent: 'Bem-vindo ao MyEasyAI! 🎉 Estamos muito felizes em ter você na nossa plataforma. Para começar: 1) Complete seu perfil em Configurações, 2) Explore o Business Guru para definir seu negócio, 3) Crie seu primeiro site no Editor de Sites, 4) Publique e compartilhe! Se precisar de ajuda, nossa equipe de suporte está disponível 24/7. Bora começar?',
    type: 'personal',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
  },
];
