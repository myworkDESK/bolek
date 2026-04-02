/**
 * Cloudflare Pages Function — Email/password & magic-link login
 *
 * POST /api/auth/login
 * Body: { email: string; password?: string; method: "password" | "magic" }
 *
 * In production, connect this to your identity provider (e.g. Firebase Auth,
 * Auth0, Supabase, or a user database stored in Cloudflare D1/KV).
 *
 * Required secrets (set via `wrangler pages secret put`):
 *   AUTH_SECRET   — used to sign session tokens
 *   SMTP_*        — for sending magic-link emails (optional)
 */

interface Env {
  AUTH_SECRET?: string;
  AUTH_KV?: KVNamespace;
}

interface LoginBody {
  email: string;
  password?: string;
  method: 'password' | 'magic';
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  let body: LoginBody;
  try {
    body = await request.json() as LoginBody;
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const { email, password, method } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return jsonResponse({ ok: false, error: 'A valid email address is required.' }, 422);
  }

  if (method === 'password') {
    if (!password || typeof password !== 'string') {
      return jsonResponse({ ok: false, error: 'Password is required.' }, 422);
    }

    // TODO: Replace with your real credential check (D1, KV, external IdP, etc.)
    // Example using Cloudflare KV:
    //   const storedHash = await context.env.AUTH_KV?.get(`user:${email}:password`);
    //   const valid = storedHash && await verifyPasswordHash(password, storedHash);
    //
    // For now we accept any non-empty credentials so the UI flow can be tested.
    const valid = password.length >= 1;
    if (!valid) {
      return jsonResponse({ ok: false, error: 'Invalid email or password.' }, 401);
    }

    return jsonResponse({ ok: true, email });
  }

  if (method === 'magic') {
    // TODO: Generate a time-limited signed token and send it via email.
    // Example: create token, store in KV with TTL, send via SendGrid/Resend/etc.
    //
    // For now, just acknowledge the request.
    return jsonResponse({ ok: true, email, message: 'Magic link sent — check your inbox.' });
  }

  return jsonResponse({ ok: false, error: 'Unsupported login method.' }, 400);
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
};

// ── helpers ───────────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
