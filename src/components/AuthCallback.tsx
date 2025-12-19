// AuthCallback - Processa callback de OAuth (Cloudflare e Supabase)

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/AuthServiceV2';
import { ROUTES } from '../router';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      console.log('🔐 [AUTH CALLBACK] Processing callback...');
      console.log('🔐 [AUTH CALLBACK] URL:', window.location.href);
      console.log('🔐 [AUTH CALLBACK] Search params:', searchParams.toString());
      console.log('🔐 [AUTH CALLBACK] Hash:', window.location.hash);

      // Check for Cloudflare token in query params
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        console.error('❌ [AUTH CALLBACK] OAuth error:', errorParam);
        setError(errorParam);
        setTimeout(() => navigate(ROUTES.HOME), 3000);
        return;
      }

      if (token) {
        console.log('🔐 [AUTH CALLBACK] Found Cloudflare token, processing...');

        // Process Cloudflare token
        const result = await authService.handleAuthCallback();

        if (result.success) {
          console.log('✅ [AUTH CALLBACK] Cloudflare auth successful:', result.user?.email);
          // Redirect to home instead of dashboard - user can navigate from there
          navigate(ROUTES.HOME);
        } else {
          console.error('❌ [AUTH CALLBACK] Cloudflare auth failed:', result.error);
          setError(result.error || 'Authentication failed');
          setTimeout(() => navigate(ROUTES.HOME), 3000);
        }
        return;
      }

      // Check for Supabase hash (access_token in URL fragment)
      if (window.location.hash.includes('access_token')) {
        console.log('🔐 [AUTH CALLBACK] Found Supabase access_token in hash');
        // Supabase will handle this automatically via detectSessionInUrl
        // Redirect to home instead of dashboard
        setTimeout(() => navigate(ROUTES.HOME), 1000);
        return;
      }

      // No token found, redirect to home
      console.warn('⚠️ [AUTH CALLBACK] No token found in callback');
      navigate(ROUTES.HOME);
    };

    processCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Erro na autenticacao</div>
          <div className="text-slate-400">{error}</div>
          <div className="text-slate-500 text-sm mt-4">Redirecionando...</div>
        </div>
      </div>
    );
  }

  // Return empty div - the redirect happens quickly so no need for loading UI
  return <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main" />;
}
