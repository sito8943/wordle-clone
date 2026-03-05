export type PlayerContextType = {
  player: {
    name: string;
    score: number;
  };
  updatePlayer: (name: string) => void;
  increaseScore: (points: number) => void;
};
