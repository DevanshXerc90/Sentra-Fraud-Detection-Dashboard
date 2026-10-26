<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All backend calls go through `src/lib/fraudApi.ts` (zod-validated, base URL from `VITE_API_BASE_URL`); UI never fabricates results — keeps presentation separate from the live FastAPI service.
- Offline evaluation figures live only in `src/lib/evaluation.ts`, always labeled by split; never mix them with live `/health` data.
- No proxy/backend for CORS: the FastAPI service must allowlist the frontend origin.
- Home is the default `/` route and the live analyst scoring form resides at `/score`; keep all five content views independently shareable.
- Reuse Recharts for discrete documented operating-point charts, never synthesize precision-recall curve data; reusable chart presentation stays separate from evaluation values.
