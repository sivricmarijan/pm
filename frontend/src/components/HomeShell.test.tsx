import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { HomeShell } from "@/components/HomeShell";

type FetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

const mockFetchSequence = (responses: FetchResponse[]) => {
  const fetchMock = vi.fn<(typeof fetch)>();

  responses.forEach((response) => {
    fetchMock.mockResolvedValueOnce(response as Response);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("HomeShell", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the login form when the user is not authenticated", async () => {
    mockFetchSequence([
      {
        ok: true,
        json: async () => ({ authenticated: false, username: null }),
      },
    ]);

    render(<HomeShell />);

    expect(
      await screen.findByRole("heading", { name: /sign in to kanban studio/i })
    ).toBeInTheDocument();
    expect(screen.queryByTestId("column-col-backlog")).not.toBeInTheDocument();
  });

  it("signs in successfully and lets the user log out", async () => {
    const fetchMock = mockFetchSequence([
      {
        ok: true,
        json: async () => ({ authenticated: false, username: null }),
      },
      {
        ok: true,
        json: async () => ({ authenticated: true, username: "user" }),
      },
      {
        ok: true,
        json: async () => ({ authenticated: false, username: null }),
      },
    ]);

    render(<HomeShell />);

    await screen.findByRole("heading", { name: /sign in to kanban studio/i });
    await userEvent.type(screen.getByLabelText(/username/i), "user");
    await userEvent.type(screen.getByLabelText(/password/i), "password");
    await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByRole("heading", { name: "Kanban Studio" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(
      await screen.findByRole("heading", { name: /sign in to kanban studio/i })
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("shows an error when sign in fails", async () => {
    mockFetchSequence([
      {
        ok: true,
        json: async () => ({ authenticated: false, username: null }),
      },
      {
        ok: false,
        json: async () => ({ detail: "Invalid credentials." }),
      },
    ]);

    render(<HomeShell />);

    await screen.findByRole("heading", { name: /sign in to kanban studio/i });
    await userEvent.type(screen.getByLabelText(/username/i), "user");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /invalid credentials/i
    );
    await waitFor(() => {
      expect(screen.queryByTestId("column-col-backlog")).not.toBeInTheDocument();
    });
  });
});
