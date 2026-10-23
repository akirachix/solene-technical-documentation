---
title: Frontend Web
description: Architecture, routing, and workflows for the CANOPY Next.js portal.
status: verified
evidence: []
---

# CANOPY Frontend Web Portal

This guide explains how the frontend is structured and how to work within it. It focuses on implementation details, request flow, validation, and verification so changes are consistent and safe to ship.

## 1. What this project is

The Canopy Web Portal is the web layer for the conservation platform. It is responsible for:

- authenticating users and protecting routes
- retrieving and displaying case, task, and overview data
- rendering map-based insights and AI-assisted content
- forwarding secure requests to the backend through a server-controlled proxy layer

The key architectural choice is that the browser does not talk directly to the backend API. Instead, the frontend uses a server-side BFF/proxy pattern so tokens, cookies, and authorization checks stay on the server.

## Preview of web

![CANOPY Web Portal](/web.png)

## 2. Local setup

### 2.1 Prerequisites

Before starting, make sure you have:

- Node.js 20+
- npm
- Git
- access to the backend service and any required environment variables
- optional access to Upstash Redis and Firebase configuration for full local parity

### 2.2 Install and start

```bash
git clone https://github.com/akirachix/solene-frontend.git
cd solene-frontend
npm install
npm run dev
```

Then open:

http://localhost:3000

````

If the app does not load as expected, check whether the backend URL or session cookie environment values are populated and whether a stale development server is still running on port 3000.

### 2.3 Required environment variables

Create a `.env.local` file in the root project directory. These values are required for the app to behave like the real environment.

```env
CANOPY_API_URL=
SESSION_COOKIE=canopy_session
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
NEXT_PUBLIC_MAPTILER_KEY=
````

The exact value of `CANOPY_API_URL` depends on the backend environment you are targeting. If you are working on a local backend, make sure the URL matches that service. If a value is missing, the app may still start in some cases, but API flows will fail or be partially functional.

### 2.4 Common scripts

Use these commands regularly:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run format:check
```

A good workflow is:

1. work locally in dev mode
2. run targeted linting when editing files
3. build before deployment
4. run Playwright verification for route-related changes

## 3. How the app works

### 3.1 Request flow

The flow below is the most important concept in the repo:

1. The browser requests a route.
2. The Next.js server handles the request.
3. It reads the secure session cookie and checks the user context.
4. It creates the outbound request to the backend with the correct auth headers.
5. It returns the filtered response back to the browser.

This means the browser must not call backend endpoints directly. The server layer is the controlled boundary that enforces auth and policy.

<details>
<summary>View proxy code</summary>

```ts
// server-side proxy pattern
const session = cookies().get("canopy_session");
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const res = await fetch(`${process.env.CANOPY_API_URL}/api/v1/cases`, {
  headers: { Authorization: `Bearer ${session.value}` },
});

return res;
```

</details>

### 3.2 BFF/proxy pattern

This pattern exists for a few practical reasons:

- it prevents leaking backend URLs to the browser
- it keeps the session cookie server-side
- it allows role checks before the request is forwarded
- it centralizes policy logic around sensitive routes

When adding a feature, ask: "Does this request need to go through the app proxy, or is it purely a client-side UI change?" If it depends on backend data, the request should usually be routed through the server-side proxy flow.

## 4. Repository structure

```text
src/
├── app/                  # Route definitions and server-side request handlers
│   ├── (app)/            # Authenticated application pages
│   ├── (auth)/           # Login and public auth flows
│   └── api/              # Proxy and backend integration endpoints
├── components/           # Reusable UI building blocks
│   ├── cases/            # Case-related screens and actions
│   ├── layout/          # Shell layout, nav, and page scaffolding
│   ├── map/              # Map components and map interactions
│   └── ui/               # Generic shared UI primitives
├── config/               # Environment variable configuration
├── lib/                  # Utilities and backend-facing logic
│   ├── api.ts            # Client-side API helpers
│   ├── backend.ts        # Server-side backend wrapper logic
│   ├── validators.ts     # Zod validation schemas
│   └── rateLimit.ts      # Redis-based guardrails for sensitive endpoints
├── types/                # Shared TypeScript models
├── proxy.ts              # Middleware and security-related proxy setup
└── ...
```

Use this map when debugging:

- UI issue -> check the page/component under `src/app` or `src/components`
- API issue -> inspect `src/lib/backend.ts`, `src/lib/api.ts`, or the proxy routes under `src/app/api`
- validation issue -> inspect `src/lib/validators.ts`
- auth or security issue -> inspect `src/proxy.ts` and the request guard logic

<details>
<summary>View component code examples</summary>

```ts
// server component
export default async function CasesPage() {
  const cases = await fetchCases();
  return <CasesTable data={cases} />;
}

// client component
'use client';
export function CasesFilter({ onChange }: { onChange: (v: string) => void }) {
  return <input onChange={(e) => onChange(e.target.value)} />;
}
```

</details>

## 5. Dependencies: what they are for and when to use them

This project is intentionally small but uses a curated set of packages. Here is the practical dependency map.

| Dependency                              | Why it exists                                 | When you touch it                                                      |
| :-------------------------------------- | :-------------------------------------------- | :--------------------------------------------------------------------- |
| `next`                                  | App router, server rendering, route handling  | when changing route structure, server rendering, or API behavior       |
| `react` / `react-dom`                   | UI rendering                                  | when building or refactoring UI components                             |
| `typescript`                            | type safety                                   | whenever adding types, API contracts, or props                         |
| `tailwindcss`                           | styling                                       | when creating or adjusting layout, spacing, color, responsive behavior |
| `lucide-react`                          | icons                                         | when adding consistent UX icons                                        |
| `react-hook-form`                       | form state and validation                     | when building forms or editing form logic                              |
| `zod`                                   | schema validation                             | when validating request payloads or form inputs                        |
| `maplibre-gl`                           | maps                                          | when changing map rendering or map interaction features                |
| `firebase`                              | notifications and messaging                   | when modifying push notification support                               |
| `@upstash/redis` / `@upstash/ratelimit` | rate limiting and edge-safe protection        | when hardening authentication or adding sensitive endpoints            |
| `react-markdown` / `remark-gfm`         | rendering markdown from AI or content sources | when working on chat, AI, or markdown-based output                     |
| `@playwright/test`                      | E2E testing                                   | whenever verifying flows through the browser                           |

The important developer habit is this: do not add libraries just to solve a small local problem unless the problem is clearly shared and the package fits the architecture. Default to the existing stack and patterns already in the repository.

## 6. Coding standards

### 6.1 File and naming conventions

Use the existing conventions consistently:

- `kebab-case` for files and folders
- `PascalCase` for React components
- `camelCase` for functions and variables
- `PascalCase` for interfaces/types
- `UPPER_SNAKE_CASE` for constants

This matters because the repo treats names as part of the system structure.

### 6.2 Server vs client components

This is a common decision point:

- use server components for most page layout and data-fetching tasks
- add `"use client"` only when you need hooks, event handlers, or browser APIs
- keep client components near the usage point and avoid large client-heavy trees

If a component only displays data, prefer server rendering. If it needs interaction, isolate the client logic and keep the rest server-side.

### 6.3 Form handling

All user-submitted input should go through a validation pattern similar to the current repo standard:

1. define a Zod schema
2. validate on submit or request entry
3. reject empty or whitespace-only values with `.trim()` patterns
4. show accessible feedback to the user

<details>
<summary>View validation code</summary>

```ts
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const parsed = loginSchema.safeParse(body);
if (!parsed.success) {
  return Response.json({ error: parsed.error.flatten() }, { status: 400 });
}
```

</details>

Do not trust client-side HTML alone. Validation is also a server-side responsibility.

### 6.4 Styling

Use Tailwind and the project color palette consistently instead of introducing custom one-off styling. This project uses a defined visual system, and design consistency is part of product quality.

When working on responsive tables, lists, or dashboard components, keep mobile behavior in mind from the start.

## 7. How to add or change feature work

Use this workflow for almost any change.

### Step 1: understand the route and data source

Before editing code, identify:

- where the user enters the flow
- what backend or API endpoint it depends on
- what auth/session data is required
- whether the data is rendered server-side or client-side

### Step 2: follow the existing pattern

Check similar features already implemented in the repo. The fastest way to do correct work is to copy the architecture and adapt it to the new requirement.

### Step 3: validate request boundaries

If the feature depends on backend data, ensure the request is routed through the server boundary rather than using a raw browser fetch to the backend.

### Step 4: add validation and guardrails

If you add a new endpoint or form, validate both the input and the user context. Put guard logic in the server request flow, not just in the UI.

### Step 5: verify before you finish

The minimum bar for a PR should be:

- app still builds locally
- lint passes or shows no new issues
- relevant Playwright flows pass
- no auth or route regressions are introduced

## 8. Security expectations

This repo treats security as part of development, not as an afterthought.

<details>
<summary>View safe rendering code</summary>

```ts
// do not render raw user HTML
const content = await aiService.getSummary();
return <MarkdownMessage text={content} />;
```

</details>

### 8.1 CSP and sanitization

The proxy layer and CSP arrangement are part of the platform defense. Avoid unsafe patterns such as untrusted HTML injection. If you are rendering AI-generated content, use the existing markdown wrapper with safe handling instead of raw HTML.

### 8.2 Session checks

Do not assume a route is protected because the page is hidden in the UI. Route protection and session verification must be enforced in the request handling path.

### 8.3 Rate limiting

Sensitive endpoints should use the rate limiting utility. If a new auth-related or sensitive endpoint is introduced, it should be gated in the same way as the existing protected flows.

## 9. Testing workflow: how to verify changes

The repo uses Playwright for end-to-end verification. This is the key way to validate that the user journey still works in a real browser.

### 9.1 Run the full suite

```bash
npx playwright test
```

### 9.2 Run a single spec or scenario

```bash
npx playwright test tests/specs/security.spec.ts --headed
npx playwright test tests/specs/functional.spec.ts --headed
```

### 9.3 Debug a failing flow

```bash
npx playwright test --headed
npx playwright show-report
```

<details>
<summary>View test code example</summary>

```ts
test("user can sign in", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

</details>

This is the practical debugging path when a page loads but a workflow breaks; the report includes browser trace data and captured failure state.

### 9.4 Test structure

The project separates test responsibility in a simple structure:

- `tests/pages/` contains page object models with locators and wrappers for browser interactions
- `tests/specs/` contains end-to-end scenarios that exercise user journeys

This keeps tests readable and makes it easier to extend flows without rewriting everything each time.

## 10. Deployment and environment controls

### 10.1 Local build verification

Before deployment, always run:

```bash
npm run build
```

This catches many issues that only appear in a production-style build, such as missing environment configuration or type mismatches.

### 10.2 Vercel deployment

Deployment is handled through the Vercel CLI when GitHub direct deployment is unavailable in this environment.

```bash
git checkout main
git pull origin main
npm run build
vercel --prod
```

### 10.3 Required production variables

These values must be configured in the Vercel environment settings:

- `CANOPY_API_URL`
- `SESSION_COOKIE`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- all `NEXT_PUBLIC_*` variables used by the app

If a value is missing in production, the app can behave differently than local development. Check the environment before diagnosing frontend bugs as code issues.

## 11. Troubleshooting checklist

When something breaks, use this sequence instead of guessing.

| Symptom                | What to check                                        | Typical fix                                          |
| :--------------------- | :--------------------------------------------------- | :--------------------------------------------------- |
| app fails to load      | `.env.local` values and running dev server           | set missing env vars and restart                     |
| API requests fail      | `CANOPY_API_URL`, session cookie, browser auth state | verify backend URL and auth flow                     |
| rate-limiting warnings | Upstash connection and Redis setup                   | configure Redis or ignore for local-only development |
| Playwright tests fail  | port conflicts, browser state, backend access        | stop stale local server, rerun headed                |
| build fails            | TypeScript errors, lint issues, env config           | run `npm run build` locally and fix the actual error |

## 12. Definition of done

A change is not done when the UI looks correct. It is done when:

- the feature works in the browser
- the relevant API boundary is correctly protected
- validation is covered
- lint/build checks pass
- the relevant Playwright flows pass
- the environment requirements are still satisfied

This repo is a production-facing frontend. The standard is not only that it compiles; it must also behave correctly, securely, and predictably in the real user flow.

## Summary

The frontend is a server-controlled, security-aware application that sits in front of the Canopy backend. The most important habits are to understand the request path, respect the server-side proxy boundary, validate user input, and verify the browser flow with Playwright before shipping changes.
