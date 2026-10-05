import { createNoteQuestion } from './noteQuiz';
import { NOTES, noteAtPitch } from './music';
import { positionKey } from './runs';

const strings = [{ id: 8, pitch: 63 }, { id: 12, pitch: 38 }];

it('asks about the current tuning and fret window with four distinct choices', () => {
  for (let index = 0; index < 100; index += 1) {
    const { position, options } = createNoteQuestion(strings, 7, 5);
    expect(position.fret === 0 || (position.fret >= 7 && position.fret <= 11)).toBe(true);
    expect(position.stringId).toBe(strings[position.stringIndex].id);
    expect(position.note).toBe(noteAtPitch(strings[position.stringIndex].pitch + position.fret));
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options).toContain(position.note);
    expect(options.every(note => NOTES.includes(note))).toBe(true);
  }
});

it('does not repeat the last position, even with just one visible fret on one string', () => {
  let previous = createNoteQuestion(strings.slice(0, 1), 1, 1).position;
  for (let index = 0; index < 20; index += 1) {
    const { position } = createNoteQuestion(strings.slice(0, 1), 1, 1, previous);
    expect(positionKey(position)).not.toBe(positionKey(previous));
    previous = position;
  }
});

it('returns no question when there are no strings', () => {
  expect(createNoteQuestion([], 1, 18)).toBe(null);
});
