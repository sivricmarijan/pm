import hashlib
import hmac
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


VALID_USERNAME = "user"
VALID_PASSWORD = "password"
SESSION_COOKIE_NAME = "pm_session"
SESSION_SECRET = os.environ.get("SESSION_SECRET", "pm-local-session-secret")


class LoginRequest(BaseModel):
    username: str
    password: str


def build_session_token(username: str) -> str:
    digest = hmac.new(
        SESSION_SECRET.encode("utf-8"),
        username.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{username}.{digest}"


def read_session_username(request: Request) -> str | None:
    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not raw_token or "." not in raw_token:
        return None

    username, signature = raw_token.rsplit(".", 1)
    expected_token = build_session_token(username)
    expected_signature = expected_token.rsplit(".", 1)[1]

    if not hmac.compare_digest(signature, expected_signature):
        return None

    if username != VALID_USERNAME:
        return None

    return username


def resolve_frontend_dir() -> Path | None:
    candidates = []
    frontend_dist = os.environ.get("FRONTEND_DIST")
    if frontend_dist:
        candidates.append(Path(frontend_dist))

    app_root = Path("/app/frontend-dist")
    repo_root = Path(__file__).resolve().parents[2] / "frontend" / "out"
    candidates.extend([app_root, repo_root])

    for candidate in candidates:
        if candidate.exists() and candidate.is_dir():
            return candidate

    return None


def create_app(frontend_dir: Path | None = None) -> FastAPI:
    app = FastAPI(title="Project Management MVP")

    @app.get("/api/session")
    def read_session(request: Request) -> dict[str, str | bool | None]:
        username = read_session_username(request)
        return {
            "authenticated": username is not None,
            "username": username,
        }

    @app.post("/api/login")
    def login(
        credentials: LoginRequest,
        response: Response,
    ) -> dict[str, str | bool | None]:
        if (
            credentials.username != VALID_USERNAME
            or credentials.password != VALID_PASSWORD
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials.",
            )

        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=build_session_token(credentials.username),
            httponly=True,
            samesite="lax",
            secure=False,
            path="/",
            max_age=60 * 60 * 8,
        )
        return {
            "authenticated": True,
            "username": credentials.username,
        }

    @app.post("/api/logout")
    def logout(response: Response) -> dict[str, str | bool | None]:
        response.delete_cookie(
            key=SESSION_COOKIE_NAME,
            httponly=True,
            samesite="lax",
            secure=False,
            path="/",
        )
        return {
            "authenticated": False,
            "username": None,
        }

    @app.get("/api/hello")
    def read_hello() -> dict[str, str]:
        return {
            "message": "Hello from FastAPI",
            "source": "api",
        }

    static_dir = frontend_dir if frontend_dir is not None else resolve_frontend_dir()

    if static_dir is not None and static_dir.exists():
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")
    else:

        @app.get("/", response_class=HTMLResponse)
        def read_root() -> str:
            return """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Project Management MVP</title>
    <style>
      :root {
        color-scheme: light;
        --accent-yellow: #ecad0a;
        --primary-blue: #209dd7;
        --secondary-purple: #753991;
        --navy-dark: #032147;
        --gray-text: #888888;
        --surface: #f7f8fb;
        --stroke: rgba(3, 33, 71, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(32, 157, 215, 0.18), transparent 35%),
          radial-gradient(circle at bottom right, rgba(117, 57, 145, 0.14), transparent 40%),
          var(--surface);
        color: var(--navy-dark);
      }

      main {
        max-width: 880px;
        margin: 0 auto;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
      }

      section {
        width: 100%;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid var(--stroke);
        border-radius: 32px;
        padding: 32px;
        box-shadow: 0 24px 48px rgba(3, 33, 71, 0.12);
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.2rem);
      }

      p {
        line-height: 1.6;
        color: var(--gray-text);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 999px;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        border: 1px solid var(--stroke);
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--accent-yellow);
      }

      .panel {
        margin-top: 28px;
        padding: 20px 22px;
        border-radius: 24px;
        background: var(--navy-dark);
        color: white;
      }

      code {
        font-family: Consolas, monospace;
      }

      #api-response {
        color: #dfe8ff;
        margin: 12px 0 0;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <div class="pill">
          <span class="dot"></span>
          Docker + FastAPI scaffold
        </div>
        <h1>Project Management MVP</h1>
        <p>
          The backend container is running and serving this placeholder page from FastAPI.
          The next step is to replace this with the statically built frontend while keeping
          the API routes in place.
        </p>

        <div class="panel">
          <strong>Hello world check</strong>
          <p id="api-response">Calling <code>/api/hello</code>...</p>
        </div>
      </section>
    </main>
    <script>
      const responseNode = document.getElementById("api-response");

      fetch("/api/hello")
        .then((response) => response.json())
        .then((payload) => {
          responseNode.textContent = `${payload.message} (${payload.source})`;
        })
        .catch(() => {
          responseNode.textContent = "API call failed.";
        });
    </script>
  </body>
</html>
"""

    return app


app = create_app()
