import React from 'react';
import { noteAtPitch, pitchLabel } from '../music';
import { positionKey } from '../runs';

export default function GuitarString({
  string, stringNumber, frets, notesInScale, rootNote, onNoteToggle, onTuningChange,
  practicing, steps, activeStep, startKey, onRootPick, onStepChange,
}) {
  const renderNote = fret => {
    const pitch = string.pitch + fret;
    const note = noteAtPitch(pitch);
    const position = { stringId: string.id, stringIndex: stringNumber - 1, fret, pitch, note };
    const key = positionKey(position);
    const root = note === rootNote;
    const selected = notesInScale.includes(note);
    const stepIndex = steps.findIndex(step => positionKey(step) === key);
    const active = practicing && stepIndex >= 0 && stepIndex === activeStep;
    const showNote = !practicing || !steps.length || stepIndex >= 0;
    const interactive = !practicing || (steps.length ? stepIndex >= 0 : root);
    const classes = [
      'aFret', fret === 0 ? 'stringLabel' : 'stringFretNote',
      selected ? 'noteInScale' : 'noteNotInScale',
      root && (selected || practicing) ? 'rootNote' : '',
      practicing && !steps.length && key === startKey ? 'chosenRoot' : '',
      practicing && !steps.length && !root ? 'runContextNote' : '',
      active ? 'activeRunNote' : '',
    ].join(' ');

    return (
      <button
        key={fret}
        type="button"
        className={classes}
        data-run-current={active ? 'true' : undefined}
        aria-label={`String ${stringNumber}, ${fret === 0 ? 'open' : `fret ${fret}`}${showNote ? `, ${pitchLabel(pitch)}${root ? ', root' : ''}` : ''}${stepIndex >= 0 ? `, step ${stepIndex + 1}` : ''}`}
        aria-pressed={practicing ? active || (!steps.length && key === startKey) : selected}
        aria-disabled={!interactive}
        tabIndex={interactive ? 0 : -1}
        onClick={() => {
          if (!practicing) onNoteToggle(note);
          else if (steps.length && stepIndex >= 0) onStepChange(stepIndex);
          else if (!steps.length && root) onRootPick(position);
        }}
      >
        <span className={`noteDot${showNote ? '' : ' hiddenNote'}`} aria-hidden={!showNote}>
          {showNote ? note : ''}
          {practicing && stepIndex >= 0 && <span className="runOrder" aria-hidden="true">{stepIndex + 1}</span>}
        </span>
      </button>
    );
  };

  return (
    <div className="aFretBoardString" role="group" aria-label={`String ${stringNumber}, tuned to ${pitchLabel(string.pitch)}`}>
      <button type="button" className="aFret stringMenu" aria-label={`Lower string ${stringNumber} tuning by one semitone`} onClick={() => onTuningChange(string.id, -1)}>
        <span aria-hidden="true">←</span>
      </button>
      <button type="button" className="aFret stringMenu" aria-label={`Raise string ${stringNumber} tuning by one semitone`} onClick={() => onTuningChange(string.id, 1)}>
        <span aria-hidden="true">→</span>
      </button>
      {renderNote(0)}
      {frets.map(renderNote)}
    </div>
  );
}
