# Frontend Guide

## Scope

This directory contains the current frontend MVP for the project management app. It is statically exported and served by the FastAPI backend in Docker, and it now includes a local sign-in gate before showing the client-side Kanban demo.

## Current Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- `@dnd-kit` for drag and drop
- static export via `next.config.ts`
- Vitest + Testing Library for unit/integration tests
- Playwright for end-to-end tests

## Current Behavior

- `/` first renders a local sign-in experience, then shows the Kanban board after a valid session is established.
- Production delivery is via static export served by FastAPI.
- The frontend checks `/api/session` on load.
- The frontend signs in through `/api/login` and logs out through `/api/logout`.
- The board has five fixed columns:
  - Backlog
  - Discovery
  - In Progress
  - Review
  - Done
- Column titles are editable inline.
- Cards can be dragged within a column or across columns.
- Cards can be added to a column.
- Cards can be removed from a column.
- All state is currently client-side only and resets on refresh.
- The frontend does not call the backend yet beyond being served by it.

## Important Files

- `src/app/page.tsx`
  Renders the auth shell entrypoint.
- `src/components/HomeShell.tsx`
  Handles session check, login form, login errors, and logout flow.
- `src/components/KanbanBoard.tsx`
  Main authenticated board component. Owns board state and drag/add/delete/rename handlers.
- `src/components/KanbanColumn.tsx`
  Renders one column, inline rename input, sortable card list, and new card form.
- `src/components/KanbanCard.tsx`
  Renders an individual draggable card and remove action.
- `src/components/NewCardForm.tsx`
  Handles local add-card form state and validation.
- `src/lib/kanban.ts`
  Defines board types, seed data, drag/drop move logic, and client-side id generation.
- `next.config.ts`
  Enables static export for backend serving.
- `src/components/KanbanBoard.test.tsx`
  Covers core board rendering and basic edit flows.
- `src/components/HomeShell.test.tsx`
  Covers the login gate, successful sign-in, logout, and failed sign-in behavior.
- `src/lib/kanban.test.ts`
  Covers move logic.
- `tests/kanban.spec.ts`
  Covers page load, card add flow, and drag/drop behavior in the browser.
- `playwright.config.ts`
  Supports both local Next dev E2E and backend-served E2E via environment variables.

## Styling Notes

- The visual system already matches the project color palette from the root `AGENTS.md`.
- Fonts are loaded in `src/app/layout.tsx` with `Space Grotesk` for display and `Manrope` for body copy.
- Global theme variables live in `src/app/globals.css`.
- Preserve the current visual language unless a later requirement explicitly needs a change.

## Editing Guidance

- Keep the board shape simple. Do not add extra concepts such as labels, assignees, due dates, or multiple boards unless required by the plan.
- Preserve the current five-column structure. Columns may be renamed, but the MVP should not add column creation or deletion.
- Future AI actions should stay limited to creating, editing, and moving cards.
- Prefer evolving `src/lib/kanban.ts` into a shared contract source for frontend/backend board JSON shape.
- When backend integration starts, avoid large UI rewrites. Replace local state plumbing incrementally.
- Keep tests close to behavior changes. If board interactions change, update unit/integration and E2E coverage in the same step.
- Preserve static-export compatibility unless a later phase intentionally changes the delivery model.

## Known Current Constraints

- Authentication is MVP-only and hardcoded to one local account.
- There is no persistence layer yet.
- The board still uses client-side-only state after login.
- There is no AI sidebar or chat flow yet.

## Commands

- `npm run dev`
- `npm run build`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:all`
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8000 npm run test:e2e`
  Use this style to point Playwright at the backend-served build instead of starting Next dev.
