import { NOTES, noteAtPitch } from './music';

const INTERVALS = ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];

export function positionKey(position) {
  return `${position.stringId}:${position.fret}`;
}

export function getPositions(strings, frets, rootNote) {
  const rootPitchClass = (NOTES.indexOf(rootNote) + 9) % 12;
  const positions = [];
  strings.forEach((string, stringIndex) => {
    [0, ...frets].forEach(fret => {
      const pitch = string.pitch + fret;
      positions.push({
        stringId: string.id,
        stringIndex,
        fret,
        pitch,
        note: noteAtPitch(pitch),
        interval: INTERVALS[((pitch - rootPitchClass) % 12 + 12) % 12],
      });
    });
  });
  return positions;
}

// Find a continuous scale fingering. Each layer is the next scale pitch;
// the cheapest route favors nearby frets and adjacent-string crossings.
export function buildRun(positions, notesInScale, start, end) {
  if (!start || !end) return { steps: [], error: '' };
  if (start.pitch === end.pitch) {
    return { steps: [], error: 'Those roots are the same pitch. Choose a root in a different octave for an ascending or descending run.' };
  }
  if (!notesInScale.includes(start.note) || !notesInScale.includes(end.note)) {
    return { steps: [], error: 'Include the root in your selected notes before building a run.' };
  }
  if (notesInScale.length < 2) {
    return { steps: [], error: 'Choose a scale or select more notes to connect the roots.' };
  }

  const direction = Math.sign(end.pitch - start.pitch);
  const stringDirection = Math.sign(end.stringIndex - start.stringIndex);
  const minString = Math.min(start.stringIndex, end.stringIndex);
  const maxString = Math.max(start.stringIndex, end.stringIndex);
  let layer = [{ position: start, cost: 0, previous: null }];

  for (let pitch = start.pitch + direction; direction * (end.pitch - pitch) >= 0; pitch += direction) {
    if (!notesInScale.includes(noteAtPitch(pitch))) continue;
    const candidates = pitch === end.pitch ? [end] : positions.filter(position => (
      position.pitch === pitch && position.stringIndex >= minString && position.stringIndex <= maxString
    ));
    const nextLayer = [];

    candidates.forEach(position => {
      let best = null;
      layer.forEach(previous => {
        const stringMove = position.stringIndex - previous.position.stringIndex;
        const fretMove = Math.abs(position.fret - previous.position.fret);
        // Stay on the same string or cross one string toward the destination.
        // Larger position changes are spread over the run instead of one jump.
        if (Math.abs(stringMove) > 1 || stringMove * stringDirection < 0 || fretMove > 5) return;
        const openPenalty = position.fret === 0 && start.fret > 0 && end.fret > 0 ? 2 : 0;
        // Prefer the hand positions around the roots, rather than detouring
        // down the neck just to save a small amount of travel on one crossing.
        const positionPenalty = 2 * Math.max(
          0,
          Math.min(start.fret, end.fret) - position.fret,
          position.fret - Math.max(start.fret, end.fret) - 3,
        );
        const cost = previous.cost + fretMove + Math.abs(stringMove) * 1.25 + openPenalty + positionPenalty;
        if (!best || cost < best.cost) best = { position, cost, previous };
      });
      if (best) nextLayer.push(best);
    });

    if (!nextLayer.length) {
      return { steps: [], error: 'No gradual scale run connects these roots in the visible frets. Show more frets or choose another root.' };
    }
    layer = nextLayer;
  }

  const steps = [];
  let current = layer[0];
  while (current) {
    steps.unshift(current.position);
    current = current.previous;
  }
  return { steps, error: '' };
}

export function suggestRun(positions, notesInScale, rootNote, startFret) {
  const roots = positions.filter(position => position.note === rootNote);
  let best = null;
  roots.forEach(start => {
    roots.filter(end => end.pitch === start.pitch + 12).forEach(end => {
      const { steps } = buildRun(positions, notesInScale, start, end);
      if (!steps.length) return;
      const frets = steps.map(step => step.fret);
      const score = Math.max(...frets) - Math.min(...frets) +
        Math.abs(start.fret - (startFret + 4)) * 0.5 - start.stringIndex * 0.1;
      if (!best || score < best.score) best = { start, end, score };
    });
  });
  return best;
}
