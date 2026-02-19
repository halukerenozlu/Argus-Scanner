# 🤖 AGUS SCANNER - MASTER AGENT GUIDE

## 🏗️ Project Architecture

- **Monorepo Structure**: Split into two main directories.
  - `/API`: Django REST Framework (Backend) + Selenium.
  - `/Client`: React + TypeScript + Vite (Frontend).
- **Database**: SQLite (located at `API/db.sqlite3`).
- **Environment**: Python `venv` is located inside the `API/` folder.

## 🛠️ Technical Stack

- **Backend**: Python 3.12, Django 5+, Selenium (undetected-chromedriver).
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React.
- **Communication**: Axios (Base URL: `http://127.0.0.1:8000/api/`).

## 📜 Coding Rules

1. **Frontend**: Always use TypeScript. Define interfaces for all API responses.
2. **Backend**: Use `@api_view(['POST'])` for scanning endpoints.
3. **Consistency**: Never delete `.windsurf`, `.cursor`, or `AGENT.md` files.
4. **Git**: Ensure `node_modules`, `venv`, and `__pycache__` are ignored via `.gitignore`.

## 📍 Current Progress

- Project structure reorganized into `/API` and `/Client`.
- Basic link detection and risk scoring logic implemented in `API/scanner/utils.py`.
- Frontend-Backend connection established via Axios.
