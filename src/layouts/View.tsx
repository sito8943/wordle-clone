import { useCallback, useState } from "react";
import { Outlet } from "react-router";
import { InitialPlayerDialog, Navbar } from "../components";
import { usePlayer } from "../providers";

const PLAYER_STORAGE_KEY = "player";

const shouldAskForInitialPlayerName = (): boolean => {
  try {
    return localStorage.getItem(PLAYER_STORAGE_KEY) === null;
  } catch {
    return false;
  }
};

const View = () => {
  const { player, updatePlayer } = usePlayer();
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

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-screen w-full flex-col max-sm:p-3 p-1">
        <Navbar />
        <Outlet />
      </div>
      {showInitialPlayerDialog ? (
        <InitialPlayerDialog
          initialName={player.name}
          onConfirm={confirmInitialPlayerName}
        />
      ) : null}
    </div>
  );
};

export default View;
