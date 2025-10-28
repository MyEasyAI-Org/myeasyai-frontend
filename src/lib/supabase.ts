import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      console.error('❌ Erro no login com Google:', error)
    } else {
      console.log('✅ Login com Google iniciado')
    }
    
    return { data, error }
  } catch (error) {
    console.error('❌ Erro inesperado no login com Google:', error)
    return { data: null, error }
  }
}

export const signInWithFacebook = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin
    }
  })
  return { data, error }
}

export const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: window.location.origin
    }
  })
  return { data, error }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('🔐 Tentando login com email:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Erro no login com email:', error)
      
      // Mensagens de erro mais amigáveis
      if (error.message.includes('Invalid login credentials')) {
        return { 
          data, 
          error: { 
            ...error, 
            message: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.' 
          } 
        }
      }
      
      if (error.message.includes('Email not confirmed')) {
        return { 
          data, 
          error: { 
            ...error, 
            message: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.' 
          } 
        }
      }
    } else {
      console.log('✅ Login com email bem-sucedido:', data.user?.email)
    }
    
    return { data, error }
  } catch (error) {
    console.error('❌ Erro inesperado no login com email:', error)
    return { data: null, error }
  }
}

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getCurrentSession = () => {
  return supabase.auth.getSession()
}

// Função para registrar usuário na tabela users após login social
export const ensureUserInDatabase = async (user: any) => {
  try {
    // Usar upsert para evitar erros de duplicação (409)
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        uuid: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
        last_online: new Date().toISOString(),
        preferred_language: 'pt'
      }, {
        onConflict: 'email', // Usar email como chave de conflito
        ignoreDuplicates: false // Atualizar se já existir
      })

    if (upsertError) {
      console.error('Erro ao garantir usuário no banco:', upsertError)
    } else {
      console.log('Usuário registrado/atualizado na tabela users:', user.email)
    }
  } catch (error) {
    console.error('Erro na função ensureUserInDatabase:', error)
  }
}

// Função para verificar se o usuário precisa completar o onboarding
export const checkUserNeedsOnboarding = async (user: any) => {
  try {
    console.log('🔍 Verificando se usuário precisa de onboarding:', user.email)
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('name, mobile_phone, country, postal_code, address, preferred_language')
      .eq('email', user.email)
      .maybeSingle() // Usar maybeSingle ao invés de single para evitar erro se não encontrar

    if (error) {
      console.error('❌ Erro ao verificar dados do usuário:', error)
      console.log('✅ Usuário precisa de onboarding (erro ao buscar dados)')
      return true // Se houver erro, assumir que precisa onboarding
    }

    if (!userData) {
      console.log('⚠️ Usuário não encontrado no banco - precisa onboarding')
      return true
    }

    console.log('📊 Dados do usuário:', {
      name: userData.name || 'VAZIO',
      mobile_phone: userData.mobile_phone || 'VAZIO',
      country: userData.country || 'VAZIO',
      postal_code: userData.postal_code || 'VAZIO',
      address: userData.address || 'VAZIO',
      preferred_language: userData.preferred_language || 'VAZIO'
    })

    // Verificar campos obrigatórios - CRÍTICO para o Dashboard
    const hasName = !!userData.name && userData.name.trim() !== '' && userData.name !== 'Usuário'
    const hasCountry = !!userData.country && userData.country.trim() !== ''
    const hasLanguage = !!userData.preferred_language && userData.preferred_language.trim() !== ''
    const hasMobilePhone = !!userData.mobile_phone && userData.mobile_phone.trim() !== ''
    
    // Verificar se TODOS os campos essenciais estão preenchidos
    const allRequiredFieldsFilled = hasName && hasCountry && hasLanguage && hasMobilePhone
    
    console.log('📋 Verificação de campos:')
    console.log('  - Nome:', hasName ? '✅' : '❌', userData.name)
    console.log('  - País:', hasCountry ? '✅' : '❌', userData.country)
    console.log('  - Idioma:', hasLanguage ? '✅' : '❌', userData.preferred_language)
    console.log('  - Telefone:', hasMobilePhone ? '✅' : '❌', userData.mobile_phone)
    
    const needsOnboarding = !allRequiredFieldsFilled
    
    if (needsOnboarding) {
      console.log('⚠️ Usuário PRECISA completar onboarding!')
    } else {
      console.log('✅ Usuário JÁ completou onboarding')
    }
    
    return needsOnboarding
    
  } catch (error) {
    console.error('❌ Erro na verificação de onboarding:', error)
    console.log('✅ Usuário precisa de onboarding (erro na verificação)')
    return true
  }
}
