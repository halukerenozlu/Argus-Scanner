# 🤖 AGUS SCANNER - MASTER AGENT GUIDE

## 🏗️ Project Architecture

- **Monorepo Structure**: Split into two main directories.
  - `/API`: Django REST Framework (Backend) + Selenium.
  - `/Client`: React + TypeScript + Vite (Frontend).
- **Database**: SQLite (located at `API/db.sqlite3`).
- **Environment**: Python `venv` is located inside the `API/` folder.
- **Django Entrypoint**: `manage.py` is located inside the `API/` folder (`/API/manage.py`).

## ▶️ How to Run (Local)

- **Backend (Django)**:
  - From repo root:
    - `.\API\venv\Scripts\python.exe manage.py runserver`
  - Or from `/API`:
    - `.\venv\Scripts\python.exe ..\manage.py runserver`

- **Frontend (Vite)**:
  - `cd Client`
  - `npm install` (first time / when deps change)
  - `npm run dev`

## 🛠️ Technical Stack

- **Backend**: Python 3.12, Django 5+, Selenium (undetected-chromedriver).
- **Frontend**: React 18, TypeScript (Types managed in `src/types/index.ts`), Tailwind CSS, Lucide React.
- **Communication**: Axios (Base URL: `http://127.0.0.1:8000/api/`).

## 📜 Coding Rules

1. **Frontend**: Always use TypeScript. All API models must be defined in `src/types/index.ts`.
2. **Backend**: Use `@api_view(['POST'])` for scanning endpoints.
3. **Consistency**: Never delete `.windsurf`, `.cursor`, or `AGENT.md` files.
4. **Git**: Ensure `node_modules`, `venv`, and `__pycache__` are ignored via `.gitignore`.

## 📍 Current Progress

- Project structure reorganized into `/API` and `/Client`.
- **Keyword Hunter Logic**: Implemented in `API/scanner/utils.py`. The scanner now analyzes both URL parameters and page text content for disclosure keywords.
- **Risk Scoring 2.0**: New algorithm combines link density and keyword matches (Max 100 points).
- Frontend-Backend connection established via Axios.
