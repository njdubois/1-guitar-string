import { NOTES, getScaleNotes, noteAtPitch } from './music';
import { triadDefinition } from './triads';

export const STANDARD_TUNING = [64, 59, 55, 50, 45, 40];

// Frets run from string 1 (high E) to string 6 (low E).
// null means that string is not part of this chord voicing.
export const CAGED_SHAPES = [
  { id: 'C', root: 'c', frets: [0, 1, 0, 2, 3, null] },
  { id: 'A', root: 'a', frets: [0, 2, 2, 2, 0, null] },
  { id: 'G', root: 'g', frets: [3, 0, 0, 0, 2, 3] },
  { id: 'E', root: 'e', frets: [0, 0, 1, 2, 2, 0] },
  { id: 'D', root: 'd', frets: [2, 3, 2, 0, null, null] },
];

export function isStandardTuning(strings) {
  return strings.length === STANDARD_TUNING.length && strings.every((string, index) => string.pitch === STANDARD_TUNING[index]);
}

export function shapeBase(rootNote, shapeId, octave = 0) {
  const shape = CAGED_SHAPES.find(item => item.id === shapeId);
  return (NOTES.indexOf(rootNote) - NOTES.indexOf(shape.root) + 12) % 12 + octave * 12;
}

export function getCagedShape(rootNote, shapeId, octave = 0) {
  const shape = CAGED_SHAPES.find(item => item.id === shapeId);
  const base = shapeBase(rootNote, shapeId, octave);
  const { chordNotes, chordLabels } = triadDefinition(rootNote, 'major');
  const tones = [];
  shape.frets.forEach((fret, stringIndex) => {
    if (fret === null) return;
    const actualFret = base + fret;
    const note = noteAtPitch(STANDARD_TUNING[stringIndex] + actualFret);
    const degreeIndex = chordNotes.indexOf(note);
    tones.push({ stringIndex, fret: actualFret, note, degree: ['R', '3', '5'][degreeIndex], label: chordLabels[degreeIndex] });
  });
  return {
    id: shapeId,
    octave,
    base,
    tones,
    chordNotes,
    chordLabels,
    pentatonicNotes: getScaleNotes(rootNote, [2, 2, 3, 2, 3]),
    minFret: Math.min(...tones.map(tone => tone.fret)),
    maxFret: Math.max(...tones.map(tone => tone.fret)),
  };
}

export function adjacentShape(rootNote, shape, direction) {
  const index = CAGED_SHAPES.findIndex(item => item.id === shape.id);
  const next = CAGED_SHAPES[(index + direction + CAGED_SHAPES.length) % CAGED_SHAPES.length];
  const firstBase = shapeBase(rootNote, next.id);
  const octave = direction > 0
    ? Math.floor((shape.base - firstBase) / 12) + 1
    : Math.ceil((shape.base - firstBase) / 12) - 1;
  return octave < 0 ? null : getCagedShape(rootNote, next.id, octave);
}
