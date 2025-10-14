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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  return { data, error }
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
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
    // Verificar se o usuário já existe na tabela users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('uuid')
      .eq('email', user.email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = "The result contains 0 rows" - usuário não encontrado
      console.error('Erro ao verificar usuário existente:', checkError)
      return
    }

    // Se o usuário não existe, criar registro
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          uuid: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
          created_at: new Date().toISOString(),
          last_online: new Date().toISOString(),
          preferred_language: 'pt'
        })

      if (insertError) {
        console.error('Erro ao inserir usuário na tabela:', insertError)
      } else {
        console.log('Usuário registrado na tabela users:', user.email)
      }
    } else {
      // Atualizar last_online se o usuário já existe
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_online: new Date().toISOString() })
        .eq('email', user.email)

      if (updateError) {
        console.error('Erro ao atualizar last_online:', updateError)
      }
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
      .single()

    if (error) {
      console.error('❌ Erro ao verificar dados do usuário:', error)
      console.log('✅ Usuário precisa de onboarding (erro ao buscar dados)')
      return true // Se houver erro, assumir que precisa onboarding
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
