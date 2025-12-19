/**
 * Traduz erros de autenticação do Supabase para mensagens claras em português
 * com orientações específicas para o usuário
 */

type AuthErrorTranslation = {
  title: string;
  description: string;
};

const SUPPORT_EMAIL = 'info@myeasyai.com';

/**
 * Mapeamento de códigos/mensagens de erro do Supabase para mensagens amigáveis
 */
const errorTranslations: Record<string, AuthErrorTranslation> = {
  // Erros de credenciais
  'Invalid login credentials': {
    title: 'E-mail ou senha incorretos',
    description: 'Verifique se digitou corretamente. Lembre-se que a senha diferencia maiúsculas de minúsculas.',
  },
  'invalid_credentials': {
    title: 'E-mail ou senha incorretos',
    description: 'Verifique se digitou corretamente. Lembre-se que a senha diferencia maiúsculas de minúsculas.',
  },

  // Erros de email
  'User already registered': {
    title: 'Este e-mail já está cadastrado',
    description: 'Tente fazer login ou use a opção "Esqueci minha senha" para recuperar o acesso.',
  },
  'user_already_exists': {
    title: 'Este e-mail já está cadastrado',
    description: 'Tente fazer login ou use a opção "Esqueci minha senha" para recuperar o acesso.',
  },
  'Email not confirmed': {
    title: 'E-mail não confirmado',
    description: 'Verifique sua caixa de entrada e clique no link de confirmação que enviamos.',
  },
  'Invalid email': {
    title: 'Formato de e-mail inválido',
    description: 'Digite um e-mail válido no formato: seuemail@dominio.com',
  },
  'invalid_email': {
    title: 'Formato de e-mail inválido',
    description: 'Digite um e-mail válido no formato: seuemail@dominio.com',
  },

  // Erros de senha
  'Password should be at least 6 characters': {
    title: 'Senha muito curta',
    description: 'A senha precisa ter no mínimo 6 caracteres. Use letras, números e símbolos para mais segurança.',
  },
  'weak_password': {
    title: 'Senha muito fraca',
    description: 'Crie uma senha mais forte com no mínimo 6 caracteres, usando letras, números e símbolos.',
  },

  // Erros de rate limit
  'Email rate limit exceeded': {
    title: 'Muitas tentativas',
    description: 'Aguarde alguns minutos antes de tentar novamente.',
  },
  'over_request_rate_limit': {
    title: 'Muitas tentativas',
    description: 'Aguarde alguns minutos antes de tentar novamente.',
  },
  'rate_limit': {
    title: 'Limite de tentativas excedido',
    description: 'Aguarde alguns minutos antes de tentar novamente.',
  },

  // Erros de rede/servidor
  'fetch_error': {
    title: 'Erro de conexão',
    description: `Verifique sua internet e tente novamente. Se o problema persistir, entre em contato: ${SUPPORT_EMAIL}`,
  },
  'network_error': {
    title: 'Erro de conexão',
    description: `Verifique sua internet e tente novamente. Se o problema persistir, entre em contato: ${SUPPORT_EMAIL}`,
  },
  'Failed to fetch': {
    title: 'Erro de conexão',
    description: `Verifique sua internet e tente novamente. Se o problema persistir, entre em contato: ${SUPPORT_EMAIL}`,
  },

  // Erros de sessão
  'Session expired': {
    title: 'Sessão expirada',
    description: 'Sua sessão expirou por segurança. Faça login novamente.',
  },
  'session_not_found': {
    title: 'Sessão não encontrada',
    description: 'Faça login novamente para continuar.',
  },

  // Erros de OAuth
  'oauth_error': {
    title: 'Erro no login social',
    description: `Não foi possível conectar com o provedor. Tente novamente ou use outro método de login.`,
  },
  'access_denied': {
    title: 'Acesso negado',
    description: 'Você cancelou o login ou não concedeu as permissões necessárias. Tente novamente.',
  },

  // Conta bloqueada/desabilitada
  'user_banned': {
    title: 'Conta suspensa',
    description: `Sua conta foi suspensa. Entre em contato com nosso suporte: ${SUPPORT_EMAIL}`,
  },

  // Erro genérico de servidor
  'server_error': {
    title: 'Erro no servidor',
    description: `Estamos com um problema temporário. Tente novamente em alguns minutos ou entre em contato: ${SUPPORT_EMAIL}`,
  },
  '500': {
    title: 'Erro no servidor',
    description: `Estamos com um problema temporário. Tente novamente em alguns minutos ou entre em contato: ${SUPPORT_EMAIL}`,
  },
};

/**
 * Traduz um erro de autenticação para uma mensagem amigável
 * @param error - Objeto de erro do Supabase ou string de erro
 * @returns Objeto com título e descrição traduzidos
 */
export function translateAuthError(error: unknown): AuthErrorTranslation {
  // Se for null ou undefined
  if (!error) {
    return getDefaultError();
  }

  // Extrair mensagem do erro
  let errorMessage = '';
  let errorCode = '';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    errorMessage = String(errorObj.message || errorObj.error_description || errorObj.error || '');
    errorCode = String(errorObj.code || errorObj.error_code || errorObj.status || '');
  }

  // Tentar encontrar tradução por código primeiro
  if (errorCode && errorTranslations[errorCode]) {
    return errorTranslations[errorCode];
  }

  // Tentar encontrar tradução por mensagem exata
  if (errorMessage && errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }

  // Tentar encontrar por substring (para mensagens que variam)
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return translation;
    }
  }

  // Se não encontrou tradução, retornar erro genérico com a mensagem original
  return getDefaultError(errorMessage);
}

/**
 * Retorna a mensagem de erro padrão
 */
function getDefaultError(originalMessage?: string): AuthErrorTranslation {
  return {
    title: 'Erro inesperado',
    description: originalMessage
      ? `${originalMessage}. Se o problema persistir, entre em contato: ${SUPPORT_EMAIL}`
      : `Algo deu errado. Tente novamente em alguns minutos ou entre em contato: ${SUPPORT_EMAIL}`,
  };
}

/**
 * Valida campos de formulário e retorna erros específicos por campo
 */
export function validateFormFields(fields: {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validar email
  if (fields.email !== undefined) {
    if (!fields.email.trim()) {
      errors.email = 'O campo E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      errors.email = 'Digite um e-mail válido (ex: seuemail@dominio.com)';
    }
  }

  // Validar senha
  if (fields.password !== undefined) {
    if (!fields.password) {
      errors.password = 'O campo Senha é obrigatório';
    } else if (fields.password.length < 6) {
      errors.password = 'A senha precisa ter no mínimo 6 caracteres';
    }
  }

  // Validar confirmação de senha
  if (fields.confirmPassword !== undefined && fields.password !== undefined) {
    if (!fields.confirmPassword) {
      errors.confirmPassword = 'Confirme sua senha';
    } else if (fields.password !== fields.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
    }
  }

  // Validar nome completo
  if (fields.fullName !== undefined) {
    if (!fields.fullName.trim()) {
      errors.fullName = 'O campo Nome é obrigatório';
    } else if (fields.fullName.trim().split(' ').length < 2) {
      errors.fullName = 'Digite seu nome completo (nome e sobrenome)';
    }
  }

  return errors;
}
