import { useWordle } from './hooks/useWordle';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';

function App() {
  const { answer, guesses, current, gameOver, won, message, handleKey } =
    useWordle();

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-3 py-3 sm:px-4 sm:py-4">
        <header className="border-b border-neutral-300 py-4 text-center text-3xl font-black tracking-[0.28em] text-black sm:py-5">
          WORDLE
        </header>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed left-1/2 top-5 z-10 -translate-x-1/2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            {message}
          </div>
        )}

        <main className="flex flex-1 flex-col">
          <section className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
            <Board guesses={guesses} current={current} gameOver={gameOver} />

            {gameOver && (
              <p className="text-center text-base font-semibold text-neutral-800 sm:text-lg">
                {won
                  ? `You got it in ${guesses.length}!`
                  : `The word was: ${answer}`}
              </p>
            )}
          </section>

          <Keyboard guesses={guesses} onKey={handleKey} />
        </main>
      </div>
    </div>
  );
}

export default App;
