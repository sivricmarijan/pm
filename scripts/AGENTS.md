# Scripts Guide

This folder contains Docker-only start and stop helpers for Windows, macOS, and Linux.

## Current Scripts

- `start-windows.ps1`
- `stop-windows.ps1`
- `start-mac.sh`
- `stop-mac.sh`
- `start-linux.sh`
- `stop-linux.sh`

## Expectations

- Scripts should run from anywhere by resolving the repo root relative to their own location.
- Scripts should stay thin wrappers around `docker compose`.
- Keep output concise and focused on whether the app is up or down.
