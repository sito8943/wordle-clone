export type PlayerContextType = {
  player: {
    name: string;
    score: number;
  };
  updateLocal: () => void;
  updatePlayer: (name: string) => void;
  increaseScore: (points: number) => void;
};
