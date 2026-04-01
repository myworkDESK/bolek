/**
 * Cloudflare Pages Function — Gemini API proxy
 *
 * Proxies requests to the Google Generative Language API so that the
 * GEMINI_API_KEY secret is never exposed to the browser.
 *
 * Configure the secret in the Cloudflare Pages dashboard or via:
 *   wrangler pages secret put GEMINI_API_KEY
 *
 * Usage from the frontend:
 *   POST /api/gemini
 *   Body: { model: string, contents: object[], generationConfig?: object }
 */

interface Env {
  GEMINI_API_KEY: string;
}

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY secret is not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { model = 'gemini-2.0-flash', ...payload } = body as Record<string, unknown>;

  const upstreamUrl = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const responseBody = await upstreamResponse.text();

  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': upstreamResponse.headers.get('Content-Type') ?? 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
