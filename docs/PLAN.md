# Project Plan

This document is the working checklist for the MVP. Each part should be completed in order unless a later step explicitly depends on a small prerequisite being pulled forward.

Testing guidance
- Aim for valuable automated tests and roughly 80% coverage when it is sensible.
- Do not add low-value tests just to reach a coverage target.
- Falling short of 80% is acceptable when extra coverage would mostly be noise.

## Part 1: Plan

- [x] Review root AGENTS.md and the current repo state.
- [x] Inspect the existing frontend implementation and tests.
- [x] Expand this plan into detailed checklists with tests and success criteria.
- [x] Create `frontend/AGENTS.md` describing the existing frontend code.
- [x] Get user approval before starting implementation work.

Tests
- Documentation review only. No code execution required.

Success criteria
- The plan is concrete enough to execute without guessing major requirements.
- The current frontend architecture is documented for future edits.
- The user approves the plan before Part 2 begins.

## Part 2: Scaffolding

- [x] Create a minimal FastAPI app in `backend/`.
- [x] Set up Python project metadata and dependency management using `uv`.
- [x] Add Docker assets to build and run the app in one container.
- [x] Add a minimal backend route for an API hello-world response.
- [x] Add a minimal root page or static asset flow served through FastAPI to prove end-to-end serving.
- [x] Create Docker-only start and stop scripts for Windows, macOS, and Linux in `scripts/`.
- [x] Add concise backend run/test instructions where needed.

Tests
- [x] Container build succeeds.
- [x] Start scripts launch the container locally.
- [x] Visiting `/` returns the temporary hello-world content.
- [x] Visiting the API test endpoint returns the expected JSON response.
- [x] Stop scripts shut the container down cleanly.

Success criteria
- A fresh clone can be started locally through the provided Docker scripts.
- FastAPI serves both an HTML response at `/` and a simple API response from the same container.
- The scaffolding is simple and ready to host the built frontend later.

## Part 3: Add In Frontend

- [x] Adapt the existing Next.js app for static export/build output compatible with FastAPI serving.
- [x] Integrate the built frontend into the Docker image and backend static file serving.
- [x] Keep the current Kanban demo behavior intact at `/`.
- [x] Ensure asset paths and client-side behavior work when served by FastAPI.
- [x] Keep or adjust frontend test config as needed for the integrated setup.

Tests
- [x] Frontend unit tests pass.
- [x] Frontend E2E tests pass against the served app.
- [x] The container serves the Kanban board successfully at `/`.

Success criteria
- The demo Kanban board loads from the FastAPI-served root route.
- The current five-column experience remains intact.
- Static asset serving works without requiring a standalone Next.js server in production.

## Part 4: Fake User Sign In

- [x] Add a login screen at `/` for unauthenticated users.
- [x] Validate hardcoded credentials: `user` / `password`.
- [x] Use a simple cookie/session-based auth mechanism for MVP login state.
- [x] Redirect or render authenticated users into the Kanban board.
- [x] Add a logout action that clears the login state.
- [x] Keep the implementation intentionally minimal and local-only.

Tests
- [x] Add valuable backend and frontend auth tests, aiming for useful coverage rather than exhaustive permutations.
- [x] Backend or integration tests cover successful login, failed login, and logout.
- [x] Frontend tests verify the login form and gated Kanban access.
- [x] E2E test verifies a full login and logout flow.

Success criteria
- Unauthenticated visits do not reveal the board.
- Valid credentials allow access to the board.
- Logout reliably returns the user to the login experience.

## Part 5: Database Modeling

- [ ] Propose a minimal SQLite schema for multi-user support with one board per user for MVP.
- [ ] Store the board payload as JSON in the database.
- [ ] Document the schema, persistence approach, and tradeoffs in `docs/`.
- [ ] Confirm the design with the user before implementation.

Tests
- [ ] Documentation review only unless a prototype script is useful.

Success criteria
- The schema supports future multi-user growth without complicating the MVP.
- The board JSON shape is clear and consistent with frontend/backend expectations.
- The user signs off before Part 6 begins.

## Part 6: Backend

- [ ] Implement database initialization on startup if the SQLite file does not exist.
- [ ] Add backend models/helpers for loading and saving a user board.
- [ ] Add authenticated API routes to fetch the current board.
- [ ] Add authenticated API routes to replace or update the board state.
- [ ] Keep backend logic small and easy to reason about.

Tests
- [ ] Backend unit tests cover database creation.
- [ ] Backend unit tests cover board read and write behavior.
- [ ] Backend tests cover auth-protected access rules.
- [ ] Backend tests cover the default board creation path for a new user if needed.

Success criteria
- A logged-in user can read and persist their board through the API.
- The database file is created automatically when missing.
- The backend API contract is stable enough for frontend integration.

## Part 7: Frontend + Backend

- [ ] Replace frontend in-memory board initialization with backend-backed loading.
- [ ] Persist rename, add, delete, and move operations through the backend API.
- [ ] Add loading/error handling only where required for a solid MVP.
- [ ] Keep the UI behavior close to the existing demo unless backend integration requires small changes.

Tests
- [ ] Frontend unit/integration tests cover loading persisted board data.
- [ ] Frontend tests cover save flows for rename, add, delete, and move actions.
- [ ] End-to-end tests verify persistence across reloads.

Success criteria
- Board edits survive refresh/restart because they are stored in SQLite.
- The user experience remains simple and responsive.
- The frontend no longer depends on hardcoded local state after initial load.

## Part 8: AI Connectivity

- [ ] Add backend configuration for `OPENROUTER_API_KEY`.
- [ ] Implement a minimal OpenRouter client using model `openai/gpt-oss-120b`.
- [ ] Add a simple internal test path or test helper to verify the connection with a `2+2` prompt.
- [ ] Keep secrets out of frontend code and out of committed files.

Tests
- [ ] Backend unit tests cover request construction and response parsing with mocks.
- [ ] A real connectivity check confirms `2+2` succeeds when credentials are present.

Success criteria
- The backend can successfully call OpenRouter from the local Docker app.
- Failures are surfaced clearly enough to debug configuration issues.

## Part 9: Structured AI Board Updates

- [ ] Define the backend prompt contract using board JSON, user message, and conversation history.
- [ ] Define a structured output schema containing assistant reply text and an optional board update.
- [ ] Implement response parsing and validation.
- [ ] Restrict AI-driven board changes to creating, editing, and moving cards only.
- [ ] Apply valid board updates safely on the backend before returning results to the UI.
- [ ] Persist updated board state when AI changes are accepted.

Tests
- [ ] Backend unit tests cover prompt payload construction.
- [ ] Backend tests cover structured output parsing and validation.
- [ ] Backend tests cover no-op AI responses and board-modifying AI responses.
- [ ] Mocked tests verify invalid outputs are rejected safely.

Success criteria
- Every AI request includes the current board JSON and conversation history.
- The backend returns a normal assistant reply plus an optional board update.
- Invalid or out-of-scope AI output does not corrupt stored board data.

## Part 10: AI Sidebar UI

- [ ] Add a sidebar chat UI that fits the existing visual language.
- [ ] Support conversation history in the frontend.
- [ ] Send chat prompts to the backend AI endpoint.
- [ ] Refresh board state automatically when the AI returns an update.
- [ ] Keep the AI UI clearly scoped to the MVP and avoid extra workflow features.

Tests
- [ ] Frontend component tests cover chat rendering and submission states.
- [ ] Integration tests cover applying AI-driven board updates in the UI.
- [ ] End-to-end tests cover a full chat request/response flow with mocked or controlled AI responses.

Success criteria
- The user can chat with the AI from the sidebar without leaving the board.
- AI-created, edited, or moved cards appear on the board automatically after a successful response.
- The UI remains usable on desktop and mobile widths.
