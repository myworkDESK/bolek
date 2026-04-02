/**
 * Cloudflare Pages Function — Google OAuth redirect
 *
 * GET /api/auth/google
 *
 * Returns a Google OAuth 2.0 authorization URL.  The client then redirects
 * the user to that URL.  After consent, Google calls your configured
 * redirect_uri (e.g. /api/auth/google/callback) where you exchange the code
 * for tokens.
 *
 * Required secrets (wrangler pages secret put):
 *   GOOGLE_CLIENT_ID      — OAuth 2.0 client ID from Google Cloud Console
 *   GOOGLE_REDIRECT_URI   — e.g. https://your-domain.com/api/auth/google/callback
 */

interface Env {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_REDIRECT_URI?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const clientId = context.env.GOOGLE_CLIENT_ID;
  const redirectUri = context.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return jsonResponse(
      { ok: false, error: 'Google OAuth is not configured on this server.' },
      503,
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return jsonResponse({ ok: true, redirectUrl });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
