// Google OAuth 2.0 handler para Cloudflare Workers

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name?: string;
  picture: string;
  locale?: string;
}

/**
 * Gera URL de autorização do Google
 */
export function getGoogleAuthUrl(
  clientId: string,
  redirectUri: string,
  state?: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Troca o código de autorização por tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google token exchange failed:', error);
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

/**
 * Obtém informações do usuário usando o access_token
 */
export async function getGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Google userinfo failed:', error);
    throw new Error(`Failed to get user info: ${error}`);
  }

  return response.json();
}

/**
 * Decodifica o ID token (JWT) do Google
 * Nota: Em produção, você deve verificar a assinatura
 */
export function decodeGoogleIdToken(idToken: string): any {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Verifica o ID token do Google (simplificado)
 * Em produção, use a biblioteca oficial ou verifique com as chaves públicas do Google
 */
export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string
): Promise<GoogleUserInfo | null> {
  try {
    // Verificar com endpoint do Google
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      console.error('Google ID token verification failed');
      return null;
    }

    const tokenInfo = await response.json() as {
      aud: string;
      exp: number;
      sub: string;
      email: string;
      email_verified: string;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      locale: string;
    };

    // Verificar audience (client_id)
    if (tokenInfo.aud !== clientId) {
      console.error('Invalid audience in ID token');
      return null;
    }

    // Verificar expiração
    const now = Math.floor(Date.now() / 1000);
    if (tokenInfo.exp < now) {
      console.error('ID token expired');
      return null;
    }

    return {
      id: tokenInfo.sub,
      email: tokenInfo.email,
      verified_email: tokenInfo.email_verified === 'true',
      name: tokenInfo.name,
      given_name: tokenInfo.given_name,
      family_name: tokenInfo.family_name,
      picture: tokenInfo.picture,
      locale: tokenInfo.locale,
    };
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    return null;
  }
}
