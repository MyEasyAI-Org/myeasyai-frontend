import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helper functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { data, error };
};

export const signInWithFacebook = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { data, error };
};

export const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  fullName: string,
  preferredName?: string,
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        name: fullName,
        preferred_name: preferredName || '',
      },
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const getCurrentSession = () => {
  return supabase.auth.getSession();
};

// Function to register user in users table after social login
export const ensureUserInDatabase = async (user: any) => {
  try {
    // Check if user already exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('uuid')
      .eq('email', user.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = "The result contains 0 rows" - user not found
      console.error('Erro ao verificar usuário existente:', checkError);
      return;
    }

    // If user doesn't exist, create record
    if (!existingUser) {
      const fullName =
        user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário';
      const preferredName = user.user_metadata?.preferred_name || '';

      const { error: insertError } = await supabase.from('users').insert({
        uuid: user.id,
        email: user.email,
        name: fullName,
        preferred_name: preferredName || null,
        created_at: new Date().toISOString(),
        last_online: new Date().toISOString(),
        preferred_language: 'pt',
      });

      if (insertError) {
        console.error('Erro ao inserir usuário na tabela:', insertError);
      } else {
        console.log('Usuário registrado na tabela users:', user.email);
      }
    } else {
      // Update last_online if user already exists
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_online: new Date().toISOString() })
        .eq('email', user.email);

      if (updateError) {
        console.error('Erro ao atualizar last_online:', updateError);
      }
    }
  } catch (error) {
    console.error('Erro na função ensureUserInDatabase:', error);
  }
};

// Function to check if user needs to complete onboarding
export const checkUserNeedsOnboarding = async (user: any) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select(
        'name, mobile_phone, country, postal_code, address, preferred_language',
      )
      .eq('email', user.email)
      .single();

    if (error) {
      console.error('Erro ao verificar dados do usuário:', error);
      return true; // If there's an error, assume needs onboarding
    }

    // Check if essential fields are missing
    const missingRequiredFields =
      !userData.name || !userData.country || !userData.preferred_language;

    // Check if at least some optional fields are filled
    const hasOptionalData =
      userData.mobile_phone || userData.postal_code || userData.address;

    // Needs onboarding if required fields are missing OR has no optional data
    return missingRequiredFields || !hasOptionalData;
  } catch (error) {
    console.error('Erro na verificação de onboarding:', error);
    return true;
  }
};
