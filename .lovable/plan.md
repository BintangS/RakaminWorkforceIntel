# Plan — Build "Rakamin Workforce Intelligence" app from prototype + answers

## Goal
Turn `prototype.html` + the two datasets (`dataset_a_messy.json`, `dataset_b_clean.json`) into the actual running app inside this TanStack Start project, preserving the prototype's design system, navigation, and behavior — and surfacing the strategic answers from the 6 PDFs as in-app context where relevant (alert banners, methodology notes, role-obsolescence sources, etc.).

## Scope
Frontend-only. No backend, no auth, no DB. Datasets are bundled as static JSON imports. Design tokens come verbatim from the prototype (dark theme, Syne + DM Sans + DM Mono, `--ac:#4fffb0` accent, etc.) and are wired into `src/styles.css` as semantic tokens.

## Information architecture (routes)
App shell = sidebar + topbar + content (matches prototype 1:1).

- `/` → **Overview** (KPI strip, top risk bar, branch distribution, data-health panel)
- `/attrition` → **Attrition Risk** (filter bar All/High/Med/Low/Review, employee table, pagination)
- `/review-queue` → **Review Queue** (cards with reason + recommended action; badge count in sidebar)
- `/productivity` → **Productivity** (proxy-metrics methodology note + per-department signal grid)
- `/reskilling` → **Reskilling Plan** (AI literacy + role-specific tracks, full table)
- `/obsolescence` → **Role Obsolescence** (WEF/Gartner/McKinsey sourced cards, severity stats)
- `/data-quality` → **Data Quality** (side-by-side Dataset A vs B + insight cards)
- `/employees/$id` → **Employee detail page** (replaces the prototype's modal; current URL already points here)

Global UI state (sidebar):
- **Dataset Mode** toggle (Messy ⇄ Clean) — persisted in URL search param `?ds=messy|clean` so the current route stays shareable; default `clean`.
- Topbar shows mode chip + overall Data Quality % (85% clean / 36% messy as in prototype).

## Data layer
- `src/data/datasetClean.ts` and `src/data/datasetMessy.ts` — typed exports of the two JSON files (copied from the uploads).
- `src/data/types.ts` — `EmployeeClean`, `EmployeeMessy` interfaces matching the JSON shapes (rakamin_id, skills_normalized[], risk_level, confidence fields, role_obsolescence_*, etc.).
- `src/hooks/useDataset.ts` — reads `?ds=` from URL, returns active dataset + helpers (`byId`, `byBranch`, `byDepartment`, `byRisk`, `reviewQueue`, `obsolescenceGroups`).
- All derived stats (KPIs, branch distributions, department signals, reskilling rollups) are computed client-side via `useMemo`.

## Design system
Port the prototype's CSS variables into `src/styles.css` using `oklch` semantic tokens:
- `--background`, `--card`, `--card-2`, `--border`, `--border-strong`
- `--foreground`, `--muted-foreground`, `--subtle-foreground`
- `--accent` (mint), `--accent-soft`, `--warning` (amber), `--destructive` (coral), `--info` (blue), `--mobility` (purple), each with a `-soft` translucent companion
- Fonts: load Syne (display), DM Sans (body), DM Mono (numbers) via `index.html` link tags. Map to Tailwind via `@theme` in `styles.css`.
- Components: build thin wrappers (`StatCard`, `Panel`, `RiskBadge`, `ConfidenceBar`, `Pill`, `Alert` with `info/warn/danger/success` variants, `BarRow`) instead of inlining classes. shadcn `Table`, `Button`, `Badge` are restyled via tokens.

## Views — content parity with prototype + PDF answers
1. **Overview** — 4 stat cards (Total / High Risk / Avg Confidence / Needs Review), top-3 risk-factor bars, per-branch stacked bar, data-health panel with confidence histogram.
2. **Attrition** — filter bar, sortable table (Employee, Branch, Role, Risk score+badge, Confidence bar, top-3 skills, Flag), 20/page pagination, row click → `/employees/$id`.
3. **Review Queue** — list of `needs_human_review === true` records as cards: name, role, reason, "Recommended Action" pulled from clean dataset fields; empty-state for messy mode.
4. **Productivity** — methodology alert (verbatim from prototype/Part D), per-department panel: normalized performance avg, LMS engagement %, attrition concentration % — each with traffic-light dot.
5. **Reskilling** — alert from Part E, two track cards (AI Literacy / Role-specific), table grouped by `job_title_normalized` with `training_weeks_estimated`, target skills, count of employees, urgency from obsolescence risk.
6. **Obsolescence** — severity stats (Critical/High/Medium/Low counts), one card per `job_title_normalized` with probability bar, reason, replacement_technology, reskilling_path, timeline, source citation (WEF / Gartner / McKinsey / Deloitte from Part C & E).
7. **Data Quality** — A vs B side-by-side: identity-resolved %, fields populated %, normalized skills %, confidence avg; risk-distribution bars; insight chips ("82% accuracy ≠ trustworthy without confidence", "Identity resolution unlocks 47 employees previously invisible", etc., sourced from Part B).
8. **Employee detail** (`/employees/$id`) — full record: identity panel (rakamin_id + source IDs + confidence), skills (normalized + source + confidence), performance + CSAT + LMS, attrition card (score, level, factors, recommended action), mobility match, obsolescence outlook, raw vs normalized diff if in messy mode. Replaces the prototype's modal so deep links work.

## Strategic-document surface
The 6 PDFs are not the product, but their key claims are folded into in-app callouts so the prototype "argues" the strategy:
- Part A → Overview hero alert ("Reframe: not predicting attrition, deciding where humans add more value than statistics").
- Part B → Data Quality view insights.
- Part C → Confidence/uncertainty UI (every score has a confidence bar; sub-55% routes to Review Queue).
- Part D → Productivity methodology note + decision-product framing on employee detail.
- Part E → Reskilling tracks, 90-day milestone strip on Overview footer.
- Part F → Footer "Platform reusability" mini-section on Overview (Medika today → Bank/Retail tomorrow).

## Technical details
- **Stack:** TanStack Start (already scaffolded), Tailwind v4 via `src/styles.css`, shadcn primitives already present.
- **Routes:** flat file-based — `src/routes/index.tsx`, `src/routes/attrition.tsx`, `src/routes/review-queue.tsx`, `src/routes/productivity.tsx`, `src/routes/reskilling.tsx`, `src/routes/obsolescence.tsx`, `src/routes/data-quality.tsx`, `src/routes/employees.$id.tsx`. Shared shell lives in `src/routes/__root.tsx` (sidebar + topbar + Outlet), with `errorComponent` + `notFoundComponent` set.
- **Sidebar nav** uses `<Link>` with `activeProps` for the active style; review-queue badge reads from active dataset.
- **Dataset toggle** uses `useNavigate({ search: prev => ({ ...prev, ds }) })` so it preserves route + params.
- **Charts:** lightweight CSS bars (matches prototype) — no Recharts needed.
- **No new deps** unless a font loader is preferred (use `<link>` in `__root.tsx` head).
- **SEO:** each route sets its own `head()` with title + description.

## Out of scope (this pass)
- Real backend / persistence
- Editing data
- Auth
- Mobile redesign (prototype is desktop-first; we keep that, with sensible breakpoint collapse for sidebar < 1024px)

## Deliverable
A working app at `/` that mirrors the prototype's look, behavior, and content using the real datasets, plus a navigable employee detail page and dataset-mode toggle persisted via URL.
