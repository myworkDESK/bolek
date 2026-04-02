/**
 * Cloudflare Pages Function — Permanent passcode management
 *
 * POST /api/auth/passcode/set    — store a new passcode for a user
 * POST /api/auth/passcode/verify — verify an existing passcode
 *
 * Body: { email: string; passcode: string }
 *
 * Storage: Cloudflare KV namespace bound as AUTH_KV.
 * Create the KV namespace and bind it in wrangler.toml:
 *
 *   [[kv_namespaces]]
 *   binding = "AUTH_KV"
 *   id      = "<your-kv-namespace-id>"
 *
 * Passcodes are stored as PBKDF2-derived hashes so the plaintext is never
 * written to the store.
 */

interface Env {
  AUTH_KV?: KVNamespace;
  AUTH_SECRET?: string;
}

interface PasscodeBody {
  email: string;
  passcode: string;
}

// ── /api/auth/passcode/set ────────────────────────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const action = url.pathname.endsWith('/verify') ? 'verify' : 'set';

  let body: PasscodeBody;
  try {
    body = await context.request.json() as PasscodeBody;
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const { email, passcode } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return jsonResponse({ ok: false, error: 'Valid email is required.' }, 422);
  }
  if (!passcode || typeof passcode !== 'string' || !/^\d{6}$/.test(passcode)) {
    return jsonResponse({ ok: false, error: 'Passcode must be exactly 6 digits.' }, 422);
  }

  const kv = context.env.AUTH_KV;
  const key = `passcode:${email.toLowerCase()}`;

  if (action === 'set') {
    // Hash the passcode before storing
    const hash = await hashPasscode(passcode, context.env.AUTH_SECRET ?? 'bolek-default-salt');
    if (kv) {
      await kv.put(key, hash);
    }
    // If KV is not available (local dev), the frontend fallback handles it
    return jsonResponse({ ok: true });
  }

  // action === 'verify'
  if (!kv) {
    // KV not configured — allow through so the UI can be tested locally
    return jsonResponse({ ok: true });
  }

  const storedHash = await kv.get(key);
  if (!storedHash) {
    return jsonResponse({ ok: false, error: 'No passcode configured for this account.' }, 404);
  }

  const candidateHash = await hashPasscode(passcode, context.env.AUTH_SECRET ?? 'bolek-default-salt');
  if (candidateHash !== storedHash) {
    return jsonResponse({ ok: false, error: 'Incorrect passcode.' }, 401);
  }

  return jsonResponse({ ok: true });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
};

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * PBKDF2-HMAC-SHA256 — available in the Cloudflare Workers runtime via Web Crypto.
 */
async function hashPasscode(passcode: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

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
