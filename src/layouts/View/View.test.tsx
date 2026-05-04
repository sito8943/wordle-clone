import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@config";
import { DialogQueueProvider } from "@providers";
import View from "./View";
import {
  APP_VERSION_STORAGE_KEY,
  PLAYER_STORAGE_KEY,
  PREVIOUS_APP_VERSION_STORAGE_KEY,
} from "./constants";

const ORIGINAL_APP_VERSION = env.appVersion;

vi.mock("@hooks", () => ({
  useThemePreference: () => undefined,
  useAnimationsPreference: () => undefined,
}));

vi.mock("./components", () => ({
  Navbar: () => <nav>Navbar</nav>,
  Footer: () => <footer>Footer</footer>,
}));

vi.mock(
  "@layouts/View/components/InitialPlayerDialog/InitialPlayerDialog",
  () => ({
    default: ({
      visible,
      onConfirm,
    }: {
      visible: boolean;
      onConfirm: (name: string) => Promise<string | null>;
    }) =>
      visible ? (
        <div>
          <p>Initial player dialog</p>
          <button
            type="button"
            onClick={() => {
              void onConfirm("Player");
            }}
          >
            Confirm initial player
          </button>
        </div>
      ) : null,
  }),
);

const updatePlayerMock = vi.fn().mockResolvedValue(undefined);
const recoverPlayerMock = vi.fn().mockResolvedValue(undefined);
const isNickAvailableMock = vi.fn().mockResolvedValue(true);

const ChangelogRouteProbe = () => {
  const { version } = useParams();

  return <div>{`Changelog content ${version ?? ""}`}</div>;
};

vi.mock("@providers", async () => {
  const actual =
    await vi.importActual<typeof import("@providers")>("@providers");

  return {
    ...actual,
    useApi: () => ({
      scoreClient: {
        isNickAvailable: isNickAvailableMock,
      },
    }),
    usePlayer: () => ({
      player: { name: "Player" },
      recoverPlayer: recoverPlayerMock,
      updatePlayer: updatePlayerMock,
    }),
  };
});

const renderView = (initialEntry = "/") =>
  render(
    <DialogQueueProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/" element={<View />}>
            <Route index element={<div>Home content</div>} />
            <Route path="play" element={<div>Play content</div>} />
            <Route path="scoreboard" element={<div>Scoreboard content</div>} />
            <Route path="changelog/:version" element={<ChangelogRouteProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </DialogQueueProvider>,
  );

afterEach(() => {
  env.appVersion = ORIGINAL_APP_VERSION;
  localStorage.clear();
  cleanup();
  vi.clearAllMocks();
});

describe("View layout chrome visibility", () => {
  it("hides navbar and footer on home route", () => {
    renderView("/");

    expect(screen.queryByText("Navbar")).toBeNull();
    expect(screen.queryByText("Footer")).toBeNull();
    expect(screen.getByText("Home content")).toBeTruthy();
  });

  it("shows navbar and footer on non-home routes", () => {
    renderView("/play");

    expect(screen.getByText("Navbar")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
  });
});

describe("View app version dialog", () => {
  it("stores the current app version when there is no previous one", async () => {
    renderView("/play");

    await waitFor(() => {
      expect(localStorage.getItem(APP_VERSION_STORAGE_KEY)).toBe(
        env.appVersion,
      );
    });
  });

  it("shows the update dialog from any route when a newer version is detected", async () => {
    env.appVersion = "0.0.16-beta";
    localStorage.setItem(APP_VERSION_STORAGE_KEY, "0.0.15");

    renderView("/scoreboard");

    expect(screen.getByText("Scoreboard content")).toBeTruthy();
    expect(screen.getByText("Updated to 0.0.16-beta")).toBeTruthy();
    expect(
      screen.getByText("Congratulations, a new version has been published."),
    ).toBeTruthy();
    expect(screen.getByText("Version history")).toBeTruthy();
    expect(localStorage.getItem(APP_VERSION_STORAGE_KEY)).toBe("0.0.15");

    fireEvent.click(
      screen.getByRole("button", { name: "View current changelog" }),
    );

    await waitFor(() => {
      expect(localStorage.getItem(APP_VERSION_STORAGE_KEY)).toBe("0.0.16-beta");
    });
    expect(screen.getByText("Changelog content 0.0.16-beta")).toBeTruthy();
  });

  it("shows pending update dialog details when previous app version is preserved after storage reset", async () => {
    env.appVersion = "0.0.16-beta";
    localStorage.setItem(APP_VERSION_STORAGE_KEY, "0.0.16-beta");
    localStorage.setItem(PREVIOUS_APP_VERSION_STORAGE_KEY, "0.0.15");

    renderView("/scoreboard");

    expect(screen.getByText("Updated to 0.0.16-beta")).toBeTruthy();
    expect(
      screen.getByText("Congratulations, a new version has been published."),
    ).toBeTruthy();
    expect(screen.getByText("Previous version: 0.0.15.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    await waitFor(() => {
      expect(localStorage.getItem(PREVIOUS_APP_VERSION_STORAGE_KEY)).toBeNull();
    });
  });

  it("does not show the dialog when the stored version is newer", () => {
    env.appVersion = "0.0.15";
    localStorage.setItem(APP_VERSION_STORAGE_KEY, "0.0.16-beta");

    renderView("/scoreboard");

    expect(screen.queryByText("Updated to 0.0.15")).toBeNull();
  });

  it("queues layout dialogs and renders the next one after closing the active one", async () => {
    env.appVersion = "0.0.16-beta";
    localStorage.setItem(APP_VERSION_STORAGE_KEY, "0.0.15");
    localStorage.setItem(
      PLAYER_STORAGE_KEY,
      JSON.stringify({ name: "Player" }),
    );

    renderView("/play");

    await waitFor(() => {
      expect(screen.getByText("Initial player dialog")).toBeTruthy();
    });
    expect(screen.queryByText("Updated to 0.0.16-beta")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Confirm initial player" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Updated to 0.0.16-beta")).toBeTruthy();
    });
  });
});
