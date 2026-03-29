# Backend Guide

## Scope

This directory contains the FastAPI backend for the Project Management MVP. It currently serves the statically exported frontend at `/`, exposes MVP auth endpoints, and keeps a placeholder fallback only if the frontend output is missing.

## Current Structure

- `pyproject.toml`
  Python project metadata and dependencies managed with `uv`.
- `app/main.py`
  FastAPI app factory, auth/API routes, frontend static build resolution, and placeholder fallback.
- `tests/test_app.py`
  Tests for placeholder mode, auth behavior, API behavior, and static frontend serving.

## Current Behavior

- `GET /`
  Serves the exported frontend when present, otherwise returns the placeholder HTML page.
- `GET /api/session`
  Returns whether the current request has a valid local MVP session.
- `POST /api/login`
  Validates the hardcoded `user` / `password` credentials and sets the session cookie.
- `POST /api/logout`
  Clears the session cookie.
- `GET /api/hello`
  Returns a simple JSON payload used to verify backend routing and frontend-to-API communication.

## Guidance

- Keep the backend simple. Build only what the current plan phase needs.
- Prefer small modules and direct code paths over early abstraction.
- Future phases should layer in auth, persistence, and AI without replacing the basic app structure unnecessarily.

## Useful Commands

- `cd backend && uv sync --extra dev`
- `cd backend && uv run pytest`
- `cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000`
