# bolek — All-in-one workspace for individuals and freelancers

A neumorphic task-management dashboard built with React, TypeScript, and Vite.  
Deployed as a **Cloudflare Pages** static site with a **Cloudflare Workers** (Pages Functions) backend for the Gemini AI proxy.

---

## Local development

**Prerequisites:** Node.js ≥ 18

```bash
npm install
cp .env.example .env.local   # add your GEMINI_API_KEY
npm run dev                   # http://localhost:3000
```

## Build

```bash
npm run build   # output → dist/
```

## Deploy to Cloudflare Pages

### 1. Connect the repository

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Select this repository and configure the build:
   | Setting | Value |
   |---|---|
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node.js version | `20` |

### 2. Add secrets

In **Settings → Environment Variables** (or via Wrangler), add:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |

> **Security note:** The Gemini API key is used only in the Cloudflare Pages Function at `functions/api/gemini.ts`. It is never included in the static frontend bundle.

### 3. Deploy via Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages secret put GEMINI_API_KEY   # paste your key when prompted
wrangler pages deploy dist --project-name=bolek
```

### Automatic CI/CD

The included `.github/workflows/webpack.yml` workflow:
- Runs `npm run lint` and `npm run build` on every push/PR.
- Deploys to Cloudflare Pages automatically on pushes to `main`.

Add the following repository secrets in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | A Cloudflare API token with *Cloudflare Pages: Edit* permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `GEMINI_API_KEY` | Your Google Gemini API key (injected at build time and as a Worker secret) |

## Gemini API proxy (Pages Function)

`functions/api/gemini.ts` is a Cloudflare Pages Function that proxies `POST /api/gemini` requests to the Google Generative Language API, keeping the secret key server-side.

```ts
// Example frontend usage
const res = await fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }],
  }),
});
const data = await res.json();
```
 
