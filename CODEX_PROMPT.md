# Build Task: float-comparison-checker

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: float-comparison-checker
HEADLINE: Safe floating point comparison validator
WHAT: None
WHY: None
WHO PAYS: None
NICHE: developer-tools
PRICE: $$8/mo

ARCHITECTURE SPEC:
A Next.js web app that validates floating point comparisons in code snippets, highlighting unsafe equality checks and suggesting epsilon-based alternatives. Users paste code, get instant feedback on floating point operations, and access premium features like batch validation and IDE integration.

PLANNED FILES:
- app/page.tsx
- app/api/validate/route.ts
- app/api/webhooks/lemonsqueezy/route.ts
- components/CodeEditor.tsx
- components/ValidationResults.tsx
- components/PricingCard.tsx
- lib/float-validator.ts
- lib/lemonsqueezy.ts
- lib/auth.ts
- middleware.ts

DEPENDENCIES: next, tailwindcss, @lemonsqueezy/lemonsqueezy.js, next-auth, prisma, @prisma/client, monaco-editor, @monaco-editor/react, acorn, acorn-walk, typescript

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.


PREVIOUS ATTEMPT FAILED WITH:
Codex exited 1: Reading additional input from stdin...
OpenAI Codex v0.121.0 (research preview)
--------
workdir: /tmp/openclaw-builds/float-comparison-checker
model: gpt-5.3-codex
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 019d94f5-9eb1-7730-8a7f-76332ebb9404
--------
user
# Build Task: float-comparison-checker

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: float-comparison-checker
HEADLINE: Safe fl
Please fix the above errors and regenerate.