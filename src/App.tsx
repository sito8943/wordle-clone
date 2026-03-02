import { useWordle } from './hooks/useWordle';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';

function App() {
  const { answer, guesses, current, gameOver, won, message, handleKey } =
    useWordle();

  return (
    <div className="app">
      <header className="app-header">
        WORDLE
      </header>

      {message && (
        <div className="app-toast">
          {message}
        </div>
      )}

      <main className="app-main">
        <Board guesses={guesses} current={current} gameOver={gameOver} />

        {gameOver && (
          <div className="game-result">
            {won
              ? `You got it in ${guesses.length}!`
              : `The word was: ${answer}`}
          </div>
        )}

        <Keyboard guesses={guesses} onKey={handleKey} />
      </main>
    </div>
  );
}

export default App;
