"use client";

import { useEffect, useState, type FormEvent } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";

type SessionPayload = {
  authenticated: boolean;
  username: string | null;
};

const sessionRequestOptions = {
  credentials: "same-origin" as const,
  cache: "no-store" as const,
};

const readSession = async (): Promise<SessionPayload> => {
  const response = await fetch("/api/session", sessionRequestOptions);
  if (!response.ok) {
    throw new Error("Unable to verify session.");
  }

  return (await response.json()) as SessionPayload;
};

const signIn = async (
  username: string,
  password: string
): Promise<SessionPayload> => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ username, password }),
  });

  const payload = (await response.json()) as
    | SessionPayload
    | { detail?: string };

  if (!response.ok) {
    const detail = "detail" in payload ? payload.detail : undefined;
    throw new Error(detail ?? "Unable to sign in.");
  }

  return payload as SessionPayload;
};

const signOut = async (): Promise<void> => {
  const response = await fetch("/api/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Unable to sign out.");
  }
};

export const HomeShell = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formState, setFormState] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const session = await readSession();
        if (!isMounted) {
          return;
        }

        setUsername(session.authenticated ? session.username : null);
      } catch {
        if (!isMounted) {
          return;
        }

        setUsername(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const session = await signIn(formState.username, formState.password);
      setUsername(session.username);
      setFormState({ username: "", password: "" });
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
      setUsername(null);
      setLoginError(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6">
        <div className="w-full max-w-md rounded-[32px] border border-[var(--stroke)] bg-white/90 p-10 text-center shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
            Session Check
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-[var(--navy-dark)]">
            Loading workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--gray-text)]">
            Checking whether you already have an active local session.
          </p>
        </div>
      </main>
    );
  }

  if (username) {
    return (
      <KanbanBoard
        username={username}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface)]">
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.22)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.15)_0%,_rgba(117,57,145,0.04)_55%,_transparent_75%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-[1100px] items-center px-6 py-12">
        <section className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-[var(--stroke)] bg-white/85 p-8 shadow-[var(--shadow)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
              Local Sign In
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-[var(--navy-dark)]">
              Sign in to Kanban Studio
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--gray-text)]">
              This MVP uses a single local account before we add real persistence
              and user management. Sign in to unlock the board experience.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
                  Username
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--navy-dark)]">
                  user
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
                  Password
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--navy-dark)]">
                  password
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
                  Mode
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--navy-dark)]">
                  Local only
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-[var(--stroke)] bg-white p-8 shadow-[var(--shadow)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gray-text)]">
              Access
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold text-[var(--navy-dark)]">
              Enter credentials
            </h2>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
                  Username
                </span>
                <input
                  value={formState.username}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
                  Password
                </span>
                <input
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            {loginError ? (
              <p
                className="mt-4 rounded-2xl border border-[rgba(117,57,145,0.18)] bg-[rgba(117,57,145,0.08)] px-4 py-3 text-sm text-[var(--navy-dark)]"
                role="alert"
              >
                {loginError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-full bg-[var(--secondary-purple)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};
