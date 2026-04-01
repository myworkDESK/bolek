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
 
# 🚀 bolek – All-in-One Workspace (Freelancer & Personal)

## 📌 Overview

TaskFlow is a unified workspace platform designed for individuals, freelancers, and small teams.
It combines task management, client tracking, finance, and productivity tools into a single system.

The UI is based on a **minimal olive-themed dashboard** with modular architecture for scalability.

---

## 🧩 Core Modules

### 1. Tasks

* Create, update, delete tasks
* Priority levels (High, Medium, Low)
* Task linking to projects and clients
* Status tracking (Pending, In Progress, Done)

### 2. Projects

* Group tasks into projects
* Track completion percentage
* Assign deadlines

### 3. Clients

* Store client details
* Link projects & invoices
* Track communication notes

### 4. Time Tracking

* Start/stop timer
* Manual time entries
* Billable vs non-billable tracking

### 5. Finance

* Invoice generation
* Payment tracking
* Expense logging

### 6. Calendar & Schedule

* Auto-generated calendar (existing feature)
* Event tracking
* Deadline reminders

---

## 🏗️ Architecture

### Frontend (Current)

* Pure HTML + CSS + Vanilla JS
* Component-style sections:

  * Topbar
  * Cards (modular UI blocks)
  * Calendar engine
  * Task list

### Future (Recommended)

* Framework: React / Next.js
* State Management: Zustand / Redux
* Backend: Supabase / Firebase
* API Layer: REST or GraphQL

---

## ⚙️ Development Rules (IMPORTANT)

### 1. Do NOT Break Existing UI

* Keep:

  * CSS variables (`:root`)
  * `.card` system
  * Grid layout
* Any new feature must **reuse existing styles**

### 2. Follow Modular Structure

Each feature must be isolated:

```
/modules
  /tasks
  /clients
  /finance
  /time
```

### 3. Naming Convention

* camelCase (JS)
* kebab-case (CSS classes)
* Clear semantic names

---

## 🔐 Security Guidelines

### Input Handling

* Always sanitize user input
* Never inject raw HTML
* Use `textContent` instead of `innerHTML`

### Authentication (Future)

* Use JWT or Supabase Auth
* Store tokens securely (HTTP-only cookies)

### Data Protection

* Never expose API keys in frontend
* Use environment variables

### API Rules

* Validate all requests server-side
* Rate limit endpoints
* Log critical actions

---

## 🤖 AI / GitHub Copilot Rules

### AI Development Constraints

Copilot / AI must:

1. ❌ NOT modify existing core layout unless required
2. ✅ ONLY extend features modularly
3. ✅ Follow existing design tokens (colors, spacing)
4. ❌ NOT introduce random UI styles
5. ✅ Keep functions small and reusable

---

## 📐 UI Design System

### Colors

* Primary: `#5f6f45`
* Background: `#f4f6ef`
* Panel: `#fdfef9`

### Components

* Card (main container)
* Badge (status indicator)
* Calendar grid
* Task list

---

## 🔄 Feature Extension Rules

When adding new features:

1. Check if component already exists
2. Reuse `.card`
3. Keep animation consistent (`rise`, `hover`)
4. Do NOT duplicate logic

---

## 📊 Data Flow

```
Tasks → Projects → Clients → Finance
          ↓
       Calendar
```

---

## 🧪 Testing

* Test UI responsiveness
* Validate task creation flow
* Check calendar rendering
* Ensure no console errors

---

## 🚀 Deployment

* Static hosting (Cloudflare Pages / Vercel)
* Use `.env` for configs
* Enable HTTPS

---

## 📈 Future Enhancements

* AI Assistant
* Real-time sync
* Notifications
* Mobile responsive layout
* Dark mode

---

## ⚠️ Strict Rule

> Every update MUST align with:
>
> * Existing UI system
> * Security practices
> * Modular architecture

No exceptions.
