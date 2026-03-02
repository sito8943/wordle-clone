export type TileStatus = 'correct' | 'present' | 'absent';

export function checkGuess(guess: string, answer: string): TileStatus[] {
  const result: TileStatus[] = Array(5).fill('absent');
  const answerChars = answer.split('');
  const guessChars = guess.split('');

  // First pass: mark correct positions
  guessChars.forEach((letter, i) => {
    if (letter === answerChars[i]) {
      result[i] = 'correct';
      answerChars[i] = '#';
    }
  });

  // Second pass: mark present letters
  guessChars.forEach((letter, i) => {
    if (result[i] === 'correct') return;
    const idx = answerChars.indexOf(letter);
    if (idx !== -1) {
      result[i] = 'present';
      answerChars[idx] = '#';
    }
  });

  return result;
}
