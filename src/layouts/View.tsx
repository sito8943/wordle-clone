import { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router";
import {
  ErrorBoundary,
  ErrorFallback,
  Footer,
  InitialPlayerDialog,
  Navbar,
} from "../components";
import { useAnimationsPreference, useThemePreference } from "../hooks";
import { useApi, usePlayer } from "../providers";
import { normalizePlayerName } from "../providers/utils";
import {
  INITIAL_PLAYER_NAME_NOT_AVAILABLE_ERROR,
  INITIAL_PLAYER_NAME_VALIDATION_ERROR,
} from "./constants";
import { shouldAskForInitialPlayerName } from "./utils";

const View = () => {
  const { scoreClient } = useApi();
  const { player, updatePlayer } = usePlayer();
  const { pathname } = useLocation();
  useThemePreference({ applyToDocument: true });
  useAnimationsPreference({ applyToDocument: true });
  const [showInitialPlayerDialog, setShowInitialPlayerDialog] = useState(
    shouldAskForInitialPlayerName,
  );

  const confirmInitialPlayerName = useCallback(
    (name: string) => {
      updatePlayer(name);
      setShowInitialPlayerDialog(false);
    },
    [updatePlayer],
  );

  const validateInitialPlayerName = useCallback(
    async (name: string): Promise<string | null> => {
      const normalizedName = normalizePlayerName(name);

      try {
        const isAvailable = await scoreClient.isNickAvailable(normalizedName);
        if (!isAvailable) {
          return INITIAL_PLAYER_NAME_NOT_AVAILABLE_ERROR;
        }

        return null;
      } catch {
        return INITIAL_PLAYER_NAME_VALIDATION_ERROR;
      }
    },
    [scoreClient],
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full flex-col max-sm:p-3 p-1">
        <Navbar />
        <ErrorBoundary
          name="route-outlet"
          resetKeys={[pathname]}
          fallback={({ reset }) => (
            <main className="page-centered py-10">
              <ErrorFallback
                title="This page could not be rendered."
                description="Try again or navigate to a different section."
                actionLabel="Retry page"
                onAction={reset}
              />
            </main>
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </div>
      <Footer />
      {showInitialPlayerDialog ? (
        <InitialPlayerDialog
          initialName={player.name}
          onConfirm={confirmInitialPlayerName}
          onValidateName={validateInitialPlayerName}
        />
      ) : null}
    </div>
  );
};

export default View;
