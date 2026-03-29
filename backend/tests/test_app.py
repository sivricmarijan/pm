from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app


def test_root_serves_placeholder_html_when_frontend_build_is_missing(
    tmp_path: Path,
) -> None:
    app = create_app(frontend_dir=tmp_path / "missing-frontend")
    client = TestClient(app)
    response = client.get("/")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Project Management MVP" in response.text
    assert 'fetch("/api/hello")' in response.text


def test_api_hello_returns_expected_payload() -> None:
    client = TestClient(create_app(frontend_dir=Path("does-not-exist")))
    response = client.get("/api/hello")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Hello from FastAPI",
        "source": "api",
    }


def test_root_serves_exported_frontend_when_available(tmp_path: Path) -> None:
    frontend_dir = tmp_path / "frontend-out"
    frontend_dir.mkdir()
    (frontend_dir / "index.html").write_text(
        "<!doctype html><html><body><h1>Kanban Studio</h1></body></html>",
        encoding="utf-8",
    )
    (frontend_dir / "asset.txt").write_text("frontend asset", encoding="utf-8")

    client = TestClient(create_app(frontend_dir=frontend_dir))

    root_response = client.get("/")
    asset_response = client.get("/asset.txt")
    api_response = client.get("/api/hello")

    assert root_response.status_code == 200
    assert "Kanban Studio" in root_response.text
    assert asset_response.status_code == 200
    assert asset_response.text == "frontend asset"
    assert api_response.status_code == 200


def test_login_sets_session_cookie_and_session_endpoint_reads_it() -> None:
    client = TestClient(create_app(frontend_dir=Path("does-not-exist")))

    initial_session = client.get("/api/session")
    login_response = client.post(
        "/api/login",
        json={"username": "user", "password": "password"},
    )
    active_session = client.get("/api/session")

    assert initial_session.status_code == 200
    assert initial_session.json() == {"authenticated": False, "username": None}
    assert login_response.status_code == 200
    assert login_response.json() == {"authenticated": True, "username": "user"}
    assert "pm_session=" in login_response.headers["set-cookie"]
    assert active_session.status_code == 200
    assert active_session.json() == {"authenticated": True, "username": "user"}


def test_login_rejects_invalid_credentials() -> None:
    client = TestClient(create_app(frontend_dir=Path("does-not-exist")))

    response = client.post(
        "/api/login",
        json={"username": "user", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials."}


def test_logout_clears_the_session_cookie() -> None:
    client = TestClient(create_app(frontend_dir=Path("does-not-exist")))
    client.post("/api/login", json={"username": "user", "password": "password"})

    logout_response = client.post("/api/logout")
    session_response = client.get("/api/session")

    assert logout_response.status_code == 200
    assert logout_response.json() == {"authenticated": False, "username": None}
    assert "pm_session=\"\"" in logout_response.headers["set-cookie"]
    assert session_response.status_code == 200
    assert session_response.json() == {"authenticated": False, "username": None}
