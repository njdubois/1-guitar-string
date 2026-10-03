export const NOTES = ['a', 'a#', 'b', 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#'];

export function noteAtPitch(pitch) {
  return NOTES[((pitch - 9) % 12 + 12) % 12];
}

export function pitchLabel(pitch) {
  return `${noteAtPitch(pitch).toUpperCase()}${Math.floor(pitch / 12) - 1}`;
}

export const SCALES = [
  { id: 'minor-pentatonic', title: 'Minor Pentatonic', intervals: [3, 2, 2, 3, 2] },
  { id: 'major', title: 'Major', intervals: [2, 2, 1, 2, 2, 2, 1] },
  { id: 'major-pentatonic', title: 'Major Pentatonic', intervals: [2, 2, 3, 2, 3] },
  { id: 'natural-minor', title: 'Natural Minor', intervals: [2, 1, 2, 2, 1, 2, 2] },
  { id: 'dorian', title: 'Dorian', intervals: [2, 1, 2, 2, 2, 1, 2] },
];

export function transposeNote(note, semitones) {
  const index = NOTES.indexOf(note);
  if (index === -1 || !Number.isInteger(semitones)) return null;

  return NOTES[((index + semitones) % NOTES.length + NOTES.length) % NOTES.length];
}

export function getScaleNotes(root, intervals) {
  if (!NOTES.includes(root)) return [];

  const notes = [root];
  let offset = 0;
  intervals.forEach(interval => {
    offset += interval;
    const note = transposeNote(root, offset);
    if (note && !notes.includes(note)) notes.push(note);
  });
  return notes;
}
