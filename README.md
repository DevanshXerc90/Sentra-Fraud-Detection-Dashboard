# Sentra — Fraud Detection Dashboard

Sentra is a modern frontend for the Credit Card Fraud Detection Pipeline. It connects to a FastAPI backend to score transactions, visualize fraud risk, explore model evaluation metrics, and monitor API health.

## Features

- **Home Dashboard:** Overview of the fraud detection pipeline and model evaluation.
- **Transaction Scoring:** Submit transaction features and view the predicted fraud score, classification, risk level, and decision threshold.
- **Threshold Analysis:** Compare documented operating points and understand the trade-off between precision and recall.
- **Model Card:** Explore the model's evaluation results, intended use, and limitations.
- **API Status:** Check backend availability and model readiness.
- **Input Validation:** Validate API responses and transaction inputs, with clear error states.
- **Responsive UI:** Designed for desktop and mobile screens.

## Tech Stack

- React
- TypeScript
- TanStack Start
- Tailwind CSS
- Recharts
- Zod
- Vitest

## Architecture

```text
User
  |
  v
Sentra Frontend
  |
  | GET /health
  | POST /predict
  v
FastAPI Backend
  |
  v
Preprocessing Pipeline
  |
  v
Trained Fraud Detection Model
  |
  v
Fraud Score and Classification
```

The frontend communicates directly with the backend API. No frontend proxy is configured. The pipeline illustration represents the high-level request flow; internal backend processing details are not independently verified by this frontend repository.

## Live API Configuration

The browser API client uses `VITE_API_BASE_URL` to determine the backend URL.

Default backend:

```text
https://fraud-detection-pipeline-yyfx.onrender.com
```

To use a different API, set the variable in your frontend environment before building or deploying:

```env
VITE_API_BASE_URL=https://your-api-url.example.com
```

Changing the environment variable requires a fresh frontend deployment.

### CORS Configuration

The FastAPI backend must allow the exact origin of the deployed frontend. Add the published frontend origin and any required development or preview origins to the backend's `FRONTEND_ORIGINS` environment variable.

The API should allow the following methods and headers:

- Methods: `GET`, `POST`, `OPTIONS`
- Headers: `Content-Type`

A successful direct health request does not guarantee browser access. Verify CORS and prediction requests from the deployed frontend after changing the backend allowlist.

## Getting Started

### Prerequisites

- Node.js
- npm
- Access to a running Sentra-compatible FastAPI backend

Install Node.js using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating), if needed.

### Install and Run

Clone this repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Install dependencies:

```bash
npm install
```

Configure the backend URL in your environment if needed, then start the development server using the script configured by this project:

```bash
npm run dev
```

## Application Routes

| Route | Purpose |
|---|---|
| `/` | Home dashboard |
| `/score` | Transaction scoring |
| `/thresholds` | Threshold comparison |
| `/model-card` | Model information and evaluation |
| `/api-status` | Backend health and API status |

## Evaluation Visualizations

Sentra includes charts for three documented offline stratified operating points. Evaluation values are maintained in `src/lib/evaluation.ts`.

The dashboard does not synthesize a full precision-recall curve. Displayed metrics come from documented offline evaluation results and should not be interpreted as guarantees of future or production performance.

The model's reported score is not necessarily a calibrated probability of fraud.

## Testing

Run the project's targeted tests:

```bash
bunx vitest run \
  src/test/fraudApi.test.ts \
  src/test/evaluation.test.ts \
  src/test/app-routing.test.tsx
```

These tests cover API response validation, documented evaluation values, and application routing.

## Project Structure

```text
src/
├── components/
│   ├── EvaluationCharts.tsx
│   ├── ScoreBar.tsx
│   ├── AppShell.tsx
│   └── ui-kit.tsx
├── lib/
│   ├── fraudApi.ts
│   └── evaluation.ts
├── routes/
│   ├── index.tsx
│   ├── score.tsx
│   ├── thresholds.tsx
│   ├── model-card.tsx
│   ├── api-status.tsx
│   └── __root.tsx
├── styles.css
└── test/
```

## Verification Notes

**Last documented enhancement verification:** 26 October 2026.

- Targeted tests: 14 passed across API validation, evaluation metrics, and routing.
- Browser checks covered the five application views, missing-field validation, sample input population, threshold charts, and desktop/mobile layouts.
- The backend returned HTTP 200 with a ready status during a direct health request.
- Browser access was not fully verified at that time because the tested frontend origin was missing from the backend CORS allowlist. Update the allowlist, redeploy the backend, and verify live health and scoring requests from the published frontend.

## Related Repository

**Backend:** [Credit Card Fraud Detection Pipeline](https://github.com/DevanshXerc90/Fraud-detection-pipeline)

The backend repository contains the FastAPI service, model pipeline, and evaluation documentation.

## Disclaimer

Sentra is a demonstration frontend for a machine-learning fraud detection project. The reported metrics are based on offline dataset evaluations and do not guarantee performance on live financial transactions. The application has not been established as a production-ready financial decision system.
