# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- GitHub Actions CI pipeline with backend (ruff + Django check) and frontend (tsc + ESLint) jobs

### Changed
- Migrated backend package management from pip/requirements.txt to uv/pyproject.toml
- Updated `start_backend.ps1` to use `uv run` instead of venv Python

### Fixed
- Fixed unused imports and unsorted import blocks in Django scaffold files (admin, models, tests, urls)
