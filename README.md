# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Sentra configuration

`VITE_API_BASE_URL` configures the browser API client. It defaults to `https://fraud-detection-pipeline-yyfx.onrender.com`. Set it in the frontend environment before deploying; changing it requires a fresh frontend deployment. The client calls `GET /health` and `POST /predict`, validates responses with Zod, and reports browser-observed durations.

FastAPI must allowlist the frontend's exact origin in its CORS middleware, including the preview origin during development and the final published origin. Allow GET, POST, OPTIONS and the Content-Type header. No frontend proxy is provided.

Home is `/`; scoring is `/score`; existing `/thresholds`, `/model-card` and `/api-status` views are preserved. Recharts compares three documented offline stratified operating points. All offline metrics remain in `src/lib/evaluation.ts`; no full precision-recall curve is synthesized.

Run `bunx vitest run src/test/fraudApi.test.ts src/test/evaluation.test.ts src/test/app-routing.test.tsx` to verify the input contract, split-specific metrics and all five view addresses.

### Enhancement verification (26 October 2026)

- Changed pages: `src/routes/index.tsx` (new Home), `src/routes/score.tsx` (preserved scoring moved from `/`), `src/routes/thresholds.tsx`, `src/routes/model-card.tsx`, `src/routes/api-status.tsx`.
- Shared presentation: `src/components/EvaluationCharts.tsx` (new grouped bar charts and metric bars), `src/components/ScoreBar.tsx`, `src/components/AppShell.tsx`, `src/components/ui-kit.tsx`, `src/styles.css`, `src/routes/__root.tsx`. `src/lib/fraudApi.ts` retains its contract and uses index-style environment access for TypeScript compatibility.
- Tests: 14 passed across API validation, exact documented evaluation values and five-page routing. Browser checks confirmed all five views, 30 missing-field errors, sample-only input population, 12 threshold bars, no page-level runtime exceptions, and no document overflow at 1280px desktop and 390px mobile.
- Remaining external step: the service returned HTTP 200 / ready to a direct health request, but omitted Access-Control-Allow-Origin for the tested `http://localhost:8080` origin. Prediction preflight returned HTTP 400. Browser health and scoring therefore correctly show unavailable/error states; a successful browser prediction could not be verified. Allowlist the frontend origin in Render and redeploy the service, then repeat the live test.
- Pipeline illustration is a high-level contract-based description. This frontend repository contains no backend source or held-out precision-recall curve asset; internal processing order is not independently verified.
