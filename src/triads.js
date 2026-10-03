import { NOTES, noteAtPitch, transposeNote } from './music';

export const TRIAD_TYPES = [
  { id: 'major', label: 'Major', intervals: [0, 4, 7], degrees: ['R', '3', '5'] },
  { id: 'minor', label: 'Minor', intervals: [0, 3, 7], degrees: ['R', '♭3', '5'] },
  { id: 'diminished', label: 'Diminished', intervals: [0, 3, 6], degrees: ['R', '♭3', '♭5'] },
  { id: 'augmented', label: 'Augmented', intervals: [0, 4, 8], degrees: ['R', '3', '♯5'] },
];

export const INVERSIONS = ['Root position', 'First inversion', 'Second inversion'];

// Keep the root/third/fifth letter names, including enharmonic spellings
// such as E-sharp for the raised fifth of A augmented.
function spellTone(rootNote, semitones, degreeIndex) {
  const letters = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
  const naturalPitches = [0, 2, 4, 5, 7, 9, 11];
  const letterIndex = (letters.indexOf(rootNote[0]) + degreeIndex * 2) % 7;
  const pitchClass = (NOTES.indexOf(rootNote) + 9 + semitones) % 12;
  const difference = ((pitchClass - naturalPitches[letterIndex] + 18) % 12) - 6;
  const accidental = difference >= 0 ? '♯'.repeat(difference) : '♭'.repeat(-difference);
  return letters[letterIndex].toUpperCase() + accidental;
}

export function triadDefinition(rootNote, typeId) {
  const type = TRIAD_TYPES.find(item => item.id === typeId);
  return {
    ...type,
    chordNotes: type.intervals.map(interval => transposeNote(rootNote, interval)),
    chordLabels: type.intervals.map((interval, index) => spellTone(rootNote, interval, index)),
  };
}

export function getTriadVoicings(strings, firstString, rootNote, typeId) {
  const definition = triadDefinition(rootNote, typeId);
  const selectedStrings = strings.slice(firstString, firstString + 3);
  if (selectedStrings.length !== 3) return [];

  const candidates = selectedStrings.map((string, offset) => {
    const positions = [];
    for (let fret = 0; fret <= 24; fret++) {
      const pitch = string.pitch + fret;
      const note = noteAtPitch(pitch);
      const degreeIndex = definition.chordNotes.indexOf(note);
      if (degreeIndex !== -1) positions.push({
        stringIndex: firstString + offset,
        stringId: string.id,
        fret,
        pitch,
        note,
        degreeIndex,
        degree: definition.degrees[degreeIndex],
        label: definition.chordLabels[degreeIndex],
      });
    }
    return positions;
  });

  const voicings = [];
  candidates[0].forEach(first => candidates[1].forEach(second => candidates[2].forEach(third => {
    const tones = [first, second, third];
    if (new Set(tones.map(tone => tone.degreeIndex)).size !== 3) return;
    const minFret = Math.min(...tones.map(tone => tone.fret));
    const maxFret = Math.max(...tones.map(tone => tone.fret));
    const ordered = tones.slice().sort((a, b) => a.pitch - b.pitch);
    // Close-position voicings fit inside one octave. Keep fretted reaches compact;
    // an open string does not add to the fretting-hand stretch.
    const fretted = tones.filter(tone => tone.fret > 0).map(tone => tone.fret);
    const reach = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
    if (ordered[2].pitch - ordered[0].pitch >= 12 || reach > 4) return;
    voicings.push({
      id: `${rootNote}:${typeId}:${firstString}:${tones.map(tone => tone.fret).join('-')}`,
      base: minFret,
      tones,
      minFret,
      maxFret,
      inversion: ordered[0].degreeIndex,
      bass: ordered[0],
      chordNotes: definition.chordNotes,
      chordLabels: definition.chordLabels,
      chordDegrees: definition.degrees,
      showScale: false,
    });
  })));
  return voicings.sort((a, b) => a.maxFret - b.maxFret || a.minFret - b.minFret || a.bass.pitch - b.bass.pitch);
}

export function getTriadSelection(state) {
  const firstString = Math.max(0, Math.min(state.triadFirstString, state.currentStrings.length - 3));
  const voicings = getTriadVoicings(state.currentStrings, firstString, state.currentScaleKey, state.triadType)
    .filter(voicing => state.triadInversion === 'all' || voicing.inversion === Number(state.triadInversion));
  const index = Math.min(state.triadIndex, Math.max(0, voicings.length - 1));
  return { firstString, voicings, index, shape: voicings[index] || null };
}
