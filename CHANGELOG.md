# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Prettier for consistent frontend code formatting with ESLint integration
- Pre-commit hooks via husky + lint-staged (auto-format and lint on commit)
- Backend unit tests: URL normalization, href filtering, analyze endpoint (17 tests)
- Frontend component tests with Vitest + Testing Library: Header, SearchInput, ResultCards (17 tests)
- Test steps in CI pipeline for both backend and frontend
- GitHub Actions CI pipeline with backend (ruff + Django check) and frontend (tsc + ESLint) jobs

### Refactored
- Split `App.tsx` into focused components: `Header`, `SearchInput`, `ResultCards`, `Spinner`

### Changed
- Migrated backend package management from pip/requirements.txt to uv/pyproject.toml
- Updated `start_backend.ps1` to use `uv run` instead of venv Python

### Removed
- Unused Vite scaffold assets (`react.svg`, `vite.svg`)

### Fixed
- Fixed unused imports and unsorted import blocks in Django scaffold files (admin, models, tests, urls)
- Added `.ruff_cache/` to `.gitignore`
