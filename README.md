# Rakamin — Workforce Intelligence Platform
### PM Case Study Submission · Medika Nusantara

Website Link: https://rakaminwip.lovable.app

Dataset A & B: https://drive.google.com/drive/folders/1SiZZdSgGoWBEI6McMQdI6kc_rm9zbM1D?usp=sharing

> **Role:** Product Manager (AI-Native)  
> **Engagement:** Rp 2.5B · 12 months · First C-suite milestone: Day 90  
> **Tools used:** Claude Sonnet (ideation, writing, data analysis framing), Python (synthetic data generation), HTML/CSS/JS (prototype)

---

## The Problem

Medika Nusantara: 15,000 employees, 90 branches, 5 disconnected HR systems. The CEO launched a Digital Transformation Initiative. The CHRO has 6 months to deliver AI-driven workforce decision-making. She wants to know:

1. Which employees should be reskilled?
2. Which teams are at productivity or attrition risk?
3. Which roles will become obsolete in the next 2 years?

**The actual problem isn't AI.** It's data. 40% of skill records are blank. The same employee exists as three different IDs across three different systems. Performance ratings use different scales per branch. No single source of truth exists.

No data layer, no insight.

---

## What This Repository Contains

```
rakamin-pm-case-study/
│
├── docs/                          # Deliverable 1 — Written Analysis
│   ├── part_a_problem_discovery.docx
│   ├── part_b_data_strategy.docx
│   ├── part_c_ai_system_design.docx
│   ├── part_d_product_design.docx
│   ├── part_e_roadmap.docx
│   └── part_f_platform_strategy.docx
│
├── prototype/
│   └── prototype.html             # Deliverable 2 — Working Prototype
│
├── data/                          # Deliverable 3 — Synthetic Datasets
│   ├── dataset_a_messy.json       # 200 records — enterprise reality
│   └── dataset_b_clean.json       # Same 200 — post-processing
│
├── automation/
│   └── rakamin_n8n_workflow.json  # n8n pipeline workflow (importable)
│
└── README.md
```

---

## Deliverable 1 — Written Analysis (Parts A–F)

| Part | Topic | Key argument |
|------|-------|-------------|
| **A** | Problem Discovery | Reframes CHRO's vague mandate into 3 product problems. Evaluates 9 focus areas. Maps each to a named product surface. |
| **B** | Data Strategy | 4-layer architecture (Ingestion → Contextualization → Feature Engineering → Intelligence). Identity resolution using Fellegi-Sunter probabilistic matching + Jaro-Winkler string similarity. Skill inference justified under Rubin (1976) MAR assumption. |
| **C** | AI System Design | XGBoost attrition classifier. 9 features, all payroll-agnostic. 3-stage missing data handling. SHAP explainability. Day 75 "feels wrong" scenario — 5 root causes specific to this dataset. |
| **D** | Product Design | 7-surface HR workspace designed for HR managers, not data analysts. Uncertainty communication framework. Productivity as proxy signals (not KPI). |
| **E** | 90-Day Roadmap | Three demo-able milestones. Day 30: data quality report. Day 60: first predictions + productivity signals. Day 90: full 7-surface workspace. All 3 CHRO questions answered. |
| **F** | Platform Strategy | 8 reusable modules extracted from this engagement. Client progression: 90 days → 45 days → 30 days → 2 weeks. Indonesian workforce data moat. |

---

## Deliverable 2 — Working Prototype

**[Open prototype.html in any browser — no server needed]**

A fully functional HR intelligence workspace built from the synthetic data. Includes:

### 7 Decision Surfaces

| Surface | Answers |
|---------|---------|
| **Overview** | Which branch has the highest concentration of at-risk employees? |
| **Attrition Risk** | Which individual employees are most likely to leave in 12 months? |
| **Productivity** | Which departments show signs of productivity problems? (3 proxy signals) |
| **Reskilling Plan** | Who needs training, in what order, and how urgent? |
| **Role Obsolescence** | Which roles will be automated in the next 2 years? |
| **Internal Mobility** | Which employees can be moved internally before they leave? |
| **Human Review Queue** | Which predictions need HR manager verification before action? |

### Dataset Toggle

Switch between **Dataset A (messy)** and **Dataset B (clean)** to see the difference the data layer makes. On Dataset A: 0 actionable predictions. On Dataset B: 33 high-risk employees identified with context, reason codes, and recommended actions.

### Key Features
- Attrition risk scoring with SHAP-based reason codes in plain language
- Confidence bar separate from risk level (two signals, never merged)
- CS L1 flagged as Critical obsolescence — 82% displacement probability in 12–18 months
- Mandatory AI Literacy module tracker for all 200 employees
- Internal mobility matching: CS L1 → CS L2 path surfaced automatically
- Agree & Intervene / Disagree & Recalibrate buttons on every risk card

---

## Deliverable 3 — Synthetic Data

Two datasets, 200 records each. Designed to reflect real enterprise data conditions.

### Dataset A — Messy (Enterprise Reality)

What you'd actually find when connecting to Medika Nusantara's systems:

- `36%` of skill records blank — no one enforces the field
- Job title variants: "Senior Sales", "Sales 2", "AE Sales", "Sales Officer" — same role, different names by branch
- Performance scales inconsistent: `1–5`, `1–10`, letter grades `A/B/C` — not comparable across branches
- Employee IDs differ per system: `EMP-2938` in HRIS, `candidate_918` in ATS
- `20` records with conflicting hire dates between HRIS and ATS
- `12` records missing ATS link entirely (likely internal transfers)
- No risk scores computable — identity unresolved, features uncalculable
- Roles include: CS L1 / CS L2 / CS L3 with realistic raw naming variants

### Dataset B — Clean (Post-Contextualization)

The same 200 employees after the Rakamin data processing pipeline:

| Field | Description |
|-------|-------------|
| `rakamin_id` | Canonical ID (`RMN-10001`) — resolved across HRIS + ATS + LMS |
| `job_title_normalized` | Mapped to standard taxonomy (10 normalized roles) |
| `skills_normalized` | Inferred via 3-tier pipeline: direct → LMS → role → peer |
| `skill_source` | `direct` / `lms_inferred` / `role_inferred` / `peer_inferred` |
| `skill_confidence` | `0.95` / `0.72` / `0.55` / `0.40` |
| `performance_score_normalized` | All scales converted to `0–100` |
| `data_confidence_overall` | Weighted average: identity (35%) + skill (35%) + performance (30%) |
| `attrition_risk_score` | `0–100` |
| `risk_level` | `High` / `Medium` / `Low` |
| `risk_factors` | Array of plain-language reasons |
| `needs_human_review` | `true` if confidence < 55% or high risk + confidence < 70% |
| `skill_gap_to_next_level` | Skills needed to qualify for next role |
| `mobility_match_role` | Best internal role match |
| `mobility_match_score` | Match confidence `0–100` |
| `promotion_ready` | `true` if tenure + performance meet promotion criteria |
| `role_obsolescence_risk` | `Critical` / `Moderate` / `Low` / `Very Low` |
| `role_obsolescence_probability_2yr` | `0.82` for CS L1, etc. |
| `role_replacement_technology` | What replaces the role |
| `role_reskilling_path` | Recommended transition path |
| `role_obsolescence_source` | WEF / Gartner / McKinsey citation |

### Role Distribution

| Role | Count | Obsolescence Risk |
|------|-------|-------------------|
| Customer Service L1 | 30 | 🔴 Critical (82%) |
| Medical Sales Specialist | 23 | 🟢 Very Low (8%) |
| Sales Representative | 26 | 🟡 Low-Moderate (20%) |
| Warehouse Staff | 17 | 🟡 Moderate (40%) |
| Customer Service L2 | 22 | 🟡 Moderate (35%) |
| Customer Service L3 | 18 | 🟢 Low (10%) |
| Branch Manager | 15 | 🟢 Very Low (5%) |
| Operations Supervisor | 10 | 🟢 Low (12%) |
| HR Generalist | 10 | 🟡 Moderate (30%) |
| Finance Analyst | 10 | 🟡 Low-Moderate (25%) |
| Supply Chain Coordinator | 10 | 🟢 Low (15%) |
| IT Support | 9 | 🟡 Moderate (35%) |

---

## n8n Automation Pipeline

`rakamin_n8n_workflow.json` is a fully importable n8n workflow that replicates the data processing pipeline.

### Import Instructions

1. Open your n8n instance
2. Click **+** → **Import from file**
3. Upload `rakamin_n8n_workflow.json`
4. Set credentials for Email (node 12) and Google Sheets (node 13)

### Pipeline Steps

```
Webhook (POST /upload-dataset)
  → Parse & Validate
  → Identity Resolution (HRIS + ATS + LMS)
  → Job Title Normalization
  → Skill Inference (3-tier)
  → Performance Normalization
  → Attrition Risk Scoring
  → Confidence Scoring + Human Review Flagging
  → Format Output
  → [Return Dataset B as JSON response]
  → [IF review items exist → Email HR Alert → Push to Google Sheets]
```

### Usage

Send a `POST` request to the webhook URL with a JSON array of employee records (Dataset A format). The pipeline returns Dataset B.

```bash
curl -X POST https://your-n8n-instance/webhook/upload-dataset \
  -H "Content-Type: application/json" \
  -d @data/dataset_a_messy.json
```

---

## Technical Foundations

### Why Probabilistic Matching for Identity Resolution?
Exact matching fails — no shared unique ID exists across 5 systems. Deterministic rule-based matching is brittle (22 records have date conflicts; name variants break exact string rules). ML-based classifiers require labeled training data we don't have (circular dependency).

**Fellegi & Sunter (1969)** proved that the probabilistic decision rule is the optimal linkage approach under specified error levels. We use **Jaro-Winkler** string similarity (threshold 0.88) for name comparison — specifically designed for person name matching and calibrated for Indonesian names with common endings (-o, -a, -i).

> Fellegi, I.P. & Sunter, A.B. (1969). *A Theory for Record Linkage.* JASA, 64(328), 1183–1210.

### Why Inference for Missing Skill Data?
**Rubin (1976)** classified missing data into three types: MCAR, MAR, MNAR. Skill field missingness in this dataset is **MAR** — it correlates with branch and manager behavior, not with the actual skill value. Under MAR, using related observed variables (LMS history, role, peer group) to infer missing values is theoretically justified.

Alternatives rejected: listwise deletion (drops 36% of dataset, introduces bias), mean imputation (meaningless for categorical skill data), self-collection (months to reach 60%, people most at risk are least likely to fill it in).

> Rubin, D.B. (1976). *Inference and Missing Data.* Biometrika, 63(3), 581–590.

### Why XGBoost?
Best balance of accuracy, explainability, and missing data handling at PoC scale (~200 labeled records). Native handling of null values via learned default directions (Chen & Guestrin, 2016). SHAP values (Lundberg & Lee, 2017) provide theoretically grounded per-prediction explanations suitable for non-technical HR managers.

> Chen, T. & Guestrin, C. (2016). *XGBoost: A Scalable Tree Boosting System.* KDD 2016.  
> Lundberg, S.M. & Lee, S.I. (2017). *A Unified Approach to Interpreting Model Predictions.* NeurIPS 2017.

---

## The Core Argument

The AI model is the same on Dataset A and Dataset B. What changes is the data underneath.

**Dataset A:** 0 actionable predictions. HR managers working blind.  
**Dataset B:** 33 high-risk employees identified with context. 19 promotion-ready. 30 CS L1 flagged for urgent reskilling before AI chatbot displacement.

That difference is the value of the data layer — not the AI layer. This is the argument Rakamin makes to every enterprise client.

---

## References

| # | Source | Used for |
|---|--------|----------|
| [1] | Gallup (2019). *This Fixable Problem Costs U.S. Businesses $1 Trillion.* | Attrition cost baseline (1.5–2x annual salary) |
| [2] | WEF (2025). *Future of Jobs Report 2025.* | 39% skill obsolescence by 2030; CS L1 displacement forecast |
| [3] | OneRange (2025). *The ROI of Internal Mobility.* | 57% employees consider leaving without career path |
| [4] | Gartner Evanta (2025). *2025 CHRO Leadership Perspectives.* | Proxy data for CHRO priority mapping |
| [5] | Rubin (1976). *Inference and Missing Data.* Biometrika. | MAR theoretical basis for skill inference |
| [6] | Fellegi & Sunter (1969). *A Theory for Record Linkage.* JASA. | Probabilistic matching theoretical basis |
| [7] | Jaro (1989). *Advances in Record-Linkage Methodology.* JASA. | Jaro-Winkler for Indonesian name matching |
| [8] | Chen & Guestrin (2016). *XGBoost.* KDD 2016. | XGBoost native missing data handling |
| [9] | Lundberg & Lee (2017). *SHAP.* NeurIPS 2017. | Model explainability for HR managers |

---

## Least Confident Decision

The decision to prioritize attrition prediction over skill gap analysis as the initial PoC focus.

Reasoning: 40% missing skill data makes a skill gap PoC indefensible without inference. The inference pipeline (Part B) turned out to work — skill gap analysis was included by Day 45, not deferred. But this wasn't certain at the time of scoping.

**To validate:** Ask the CHRO directly in the Day 1 meeting — *"If at Day 90 we could show the CEO one thing that makes them say this worked — what would that be?"* Her answer overrides every assumption in this document.

---

*Submitted for the Rakamin Product Manager (AI-Native) case study. All data is synthetic. This document is for candidate evaluation purposes only.*
