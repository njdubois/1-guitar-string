import { NOTES } from './music';
import { getPositions, positionKey } from './runs';

function shuffle(items) {
  const shuffled = items.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export function createNoteQuestion(strings, startFret, fretCount, previousPosition) {
  const frets = Array.from({ length: fretCount }, (_, index) => startFret + index);
  const positions = getPositions(strings, frets);
  if (!positions.length) return null;

  const candidates = previousPosition && positions.length > 1
    ? positions.filter(position => positionKey(position) !== positionKey(previousPosition))
    : positions;
  const position = candidates[Math.floor(Math.random() * candidates.length)];
  const alternatives = shuffle(NOTES.filter(note => note !== position.note)).slice(0, 3);
  return { position, options: shuffle([position.note, ...alternatives]) };
}
