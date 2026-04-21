# float-comparison-checker

Safe floating point comparison validator for engineering teams shipping financial, analytics, and scientific systems.

## What it does

`float-comparison-checker` catches unsafe direct float comparisons (`==`, `===`, `!=`, `!==`) in JavaScript, TypeScript, and Python. It provides epsilon-safe replacement snippets, exposes a paywalled web dashboard, and includes a CLI designed for CI/CD enforcement.

## Why it matters

Floating point comparison bugs are subtle and expensive:

- Financial calculations can pass local tests and fail in production reconciliation.
- Analytics pipelines can drift silently from expected thresholds.
- Regression tests become flaky because decimal math is not exact in binary representation.

This tool adds an explicit quality gate so precision bugs are found before merge.

## Product positioning

- Niche: developer tools
- Target buyers: backend teams in fintech, scientific computing, and data-heavy startups
- Price: **$8/month** via Stripe hosted checkout

## Architecture

- Next.js 15 App Router web application (`src/app/*`)
- API analyzer endpoint (`POST /api/analyze`)
- Stripe webhook ingestion endpoint (`POST /api/webhooks/lemonsqueezy`)
- Health check endpoint (`GET /api/health`)
- Cookie-based paywall unlock route (`GET /api/unlock?session_id=...`)
- CLI scanner (`cli/index.js`) with analyzers for JS/TS/Python
- Lightweight JSON persistence (`.data/purchases.json`)

## Environment variables

Copy `.env.example` to `.env` and set values:

- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Stripe checkout and unlock flow

1. Customer clicks Buy button that links directly to `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`.
2. Stripe Payment Link completes checkout.
3. Stripe sends `checkout.session.completed` webhook to `/api/webhooks/lemonsqueezy`.
4. App stores the session ID in local JSON store.
5. Configure Stripe success redirect to:
   `/dashboard?session_id={CHECKOUT_SESSION_ID}`
6. `/api/unlock` validates the session and sets a signed `fcc_access` cookie.
7. Dashboard and `/api/analyze` unlock for paid users.

## Local development

```bash
npm install
npm run dev
```

App URLs:

- Landing page: `http://localhost:3000/`
- Dashboard: `http://localhost:3000/dashboard`
- Health: `http://localhost:3000/api/health`

## Build

```bash
npm run build
```

## CLI usage

Run scanner on a repository:

```bash
node ./cli/index.js . --extensions ts,tsx,js,jsx,py
```

Machine-readable output:

```bash
node ./cli/index.js . --json
```

Do not fail CI (for baseline mode):

```bash
node ./cli/index.js . --no-fail
```

Set custom epsilon recommendation text:

```bash
node ./cli/index.js . --epsilon 1e-10
```

## CI example (GitHub Actions)

```yaml
name: Float Comparison Guard
on: [pull_request]

jobs:
  float-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: node ./cli/index.js . --extensions ts,tsx,js,jsx,py
```

## API example

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: fcc_access=<signed-cookie>" \
  -d '{
    "language": "typescript",
    "filePath": "src/calculations/pricing.ts",
    "code": "const total = subtotal * 0.1; if (total === expected) { ship(); }"
  }'
```

## Notes on persistence

This build uses local JSON storage for portability and zero-ORM deployment. For multi-instance production deployments, replace `src/lib/database.ts` with a transactional Postgres implementation via `pg`.
