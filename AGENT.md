# 🤖 ARGUS SCANNER - MASTER AGENT GUIDE

## Project Overview

Argus Scanner is a local-first web application for detecting hidden ads and suspicious redirects.

### Repository Structure
- `API/`: Django backend and scan logic
- `Client/`: React + TypeScript + Vite frontend

### Current Priorities
1. Preserve the existing local development flow
2. Improve scan performance
3. Avoid unnecessary deployment-oriented refactors

## Local Run

### Backend
Preferred:
```powershell
powershell -ExecutionPolicy Bypass -File .\API\start_backend.ps1
```

Alternative from repo root:
```powershell
.\API\venv\Scripts\python.exe .\API\manage.py runserver
```

Alternative from `API/`:
```powershell
.\venv\Scripts\python.exe .\manage.py runserver
```

### Frontend
From `Client/`:
```powershell
npm install
npm run dev
```

## Technical Stack

### Backend
- Python 3.12
- Django 5+
- Selenium / undetected-chromedriver

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Axios

### Local API Configuration
- Prefer `VITE_API_BASE_URL` for frontend API configuration
- Local default backend URL is `http://127.0.0.1:8000/api/`

## Primary Goal

Improve scan speed without breaking the currently working local setup.

The product goal is to provide a fast initial signal in seconds, not a deep exhaustive crawl on every request.

## Guardrails

- Do not migrate the backend away from Django
- Do not migrate the frontend away from Vite + React
- Do not move or rename `API/` or `Client/` without explicit approval
- Do not introduce major architecture changes unless explicitly requested
- Do not add new dependencies without explaining why first
- Do not change API routes, request payloads, or response shapes unless necessary
- Do not rewrite UI copy unless the task explicitly asks for it
- Do not create duplicate files such as `*_v2`, `*_new`, `*_fixed`
- Never delete `.windsurf`, `.cursor`, `AGENT.md`, `CLAUDE.md`, or `README.md` unless explicitly asked
- Do not optimize for cloud deployment unless explicitly requested
- Do not refactor the project to match Vercel-first or serverless-first conventions unless explicitly requested

## Performance Rules

When improving scan performance:

1. Measure current timing before changing logic
2. Prefer low-risk optimizations first
3. Prioritize:
   - request timeout tuning
   - session / connection reuse
   - duplicate URL filtering
   - skipping irrelevant links (`mailto:`, `tel:`, `javascript:`, fragments, file assets)
   - limiting scanned links
4. Prefer fast initial analysis over deeper crawling
5. Report before/after timing when possible

## Frontend Rules

- Use TypeScript for frontend code
- Keep API-related types in the existing canonical types location
- Preserve the current UI flow unless explicitly improving it
- Avoid unnecessary component rewrites

## Backend Rules

- Keep the current Django structure intact
- Prefer improving existing scanner logic over replacing it
- Avoid breaking current local scripts
- Keep endpoint behavior compatible with the current frontend unless explicitly coordinated

## Workflow

For non-trivial tasks:

1. Briefly explain the plan
2. Make the smallest useful change first
3. Then summarize:
   - what changed
   - what was tested
   - known risks
   - suggested next step

## Documentation

- If setup commands change, update `README.md`
- If local run steps change, update this guide
- Keep commands and file paths accurate
