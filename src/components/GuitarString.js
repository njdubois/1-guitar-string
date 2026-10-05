import React from 'react';
import { noteAtPitch, pitchLabel } from '../music';
import { positionKey } from '../runs';

export default function GuitarString({
  string, stringNumber, frets, notesInScale, rootNote, onNoteToggle, onTuningChange,
  practicing, steps, activeStep, startKey, onRootPick, onStepChange,
  chordDiagram, chordNoteKey, onChordNotePick, visibleStart, visibleEnd, controls = false, quiz,
}) {
  const renderNote = fret => {
    const pitch = string.pitch + fret;
    const note = noteAtPitch(pitch);
    const position = { stringId: string.id, stringIndex: stringNumber - 1, fret, pitch, note };
    const key = positionKey(position);
    const quizTarget = quiz && key === positionKey(quiz.position);
    const root = note === rootNote;
    const chordTone = chordDiagram && chordDiagram.tones.find(tone => tone.stringIndex === stringNumber - 1 && tone.fret === fret);
    const scaleContext = chordDiagram && chordDiagram.showScale && chordDiagram.pentatonicNotes.includes(note) && fret >= Math.max(0, chordDiagram.minFret - 1) && fret <= chordDiagram.maxFret + 1;
    const mutedString = chordDiagram && !chordDiagram.showScale && fret === 0 && !chordDiagram.tones.some(tone => tone.stringIndex === stringNumber - 1);
    const selected = !quiz && (chordDiagram ? Boolean(chordTone) : notesInScale.includes(note));
    const stepIndex = steps.findIndex(step => positionKey(step) === key);
    const active = practicing && stepIndex >= 0 && stepIndex === activeStep;
    const showNote = quiz ? quizTarget && Boolean(quiz.result) : chordDiagram ? Boolean(chordTone || scaleContext) : !practicing || !steps.length || stepIndex >= 0;
    const inWindow = fret === 0 || (fret >= visibleStart && fret <= visibleEnd);
    const interactive = !quiz && inWindow && (chordDiagram ? showNote : !practicing || (steps.length ? stepIndex >= 0 : root));
    const classes = [
      'aFret', fret === 0 ? 'stringLabel' : 'stringFretNote',
      selected ? 'noteInScale' : 'noteNotInScale',
      root && (selected || practicing || (chordDiagram && showNote)) ? 'rootNote' : '',
      practicing && !steps.length && key === startKey ? 'chosenRoot' : '',
      practicing && !steps.length && !root ? 'runContextNote' : '',
      active ? 'activeRunNote' : '',
      chordDiagram ? 'chordCell' : '',
      chordTone ? 'diagramChordTone' : '',
      chordDiagram && key === chordNoteKey ? 'activeChordNote' : '',
      quiz ? 'quizCell' : '',
      quizTarget ? 'quizTarget' : '',
      quizTarget && quiz.result ? `quizTarget${quiz.result === 'correct' ? 'Correct' : 'Wrong'}` : '',
    ].join(' ');

    return (
      <button
        key={fret}
        type="button"
        className={classes}
        data-run-current={active ? 'true' : undefined}
        data-quiz-target={quizTarget ? 'true' : undefined}
        data-string-number={quiz && fret === 0 ? stringNumber : undefined}
        aria-label={quiz ? `String ${stringNumber}, ${fret === 0 ? 'open' : `fret ${fret}`}${quizTarget ? `, ${quiz.result ? `${note.toUpperCase()}, ${quiz.result}` : 'note to identify'}` : ''}` : mutedString ? `String ${stringNumber}, omitted from chord` : `String ${stringNumber}, ${fret === 0 ? 'open' : `fret ${fret}`}${showNote ? `, ${chordTone && chordTone.label ? chordTone.label : pitchLabel(pitch)}${root ? ', root' : ''}` : ''}${chordTone ? `, chord tone ${chordTone.degree}` : ''}${stepIndex >= 0 ? `, step ${stepIndex + 1}` : ''}`}
        aria-pressed={chordDiagram ? key === chordNoteKey : practicing ? active || (!steps.length && key === startKey) : selected}
        aria-disabled={!interactive}
        tabIndex={interactive ? 0 : -1}
        onClick={() => {
          if (!interactive) return;
          if (chordDiagram) {
            onChordNotePick(position);
          } else if (!practicing) onNoteToggle(note);
          else if (steps.length && stepIndex >= 0) onStepChange(stepIndex);
          else if (!steps.length && root) onRootPick(position);
        }}
      >
        <span className={`noteDot${showNote || mutedString || quizTarget ? '' : ' hiddenNote'}`} aria-hidden={!showNote}>
          {mutedString ? '×' : showNote ? chordTone ? (
            <React.Fragment>
              <span className="chordNoteName">{chordTone.label || note}</span>
              <span className="chordInterval">{chordTone.degree}</span>
            </React.Fragment>
          ) : note : ''}
          {practicing && stepIndex >= 0 && <span className="runOrder" aria-hidden="true">{stepIndex + 1}</span>}
        </span>
      </button>
    );
  };

  return (
    <div className={`aFretBoardString${controls ? ' stringControls' : ''}`} role="group" aria-label={`String ${stringNumber}, ${controls ? 'tuning and open note' : 'fretted notes'}${quiz ? '' : `, tuned to ${pitchLabel(string.pitch)}`}`}>
      {controls ? <React.Fragment>
        <button type="button" className="aFret stringMenu" aria-label={`Lower string ${stringNumber} tuning by one semitone`} onClick={() => onTuningChange(string.id, -1)}>
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" className="aFret stringMenu" aria-label={`Raise string ${stringNumber} tuning by one semitone`} onClick={() => onTuningChange(string.id, 1)}>
          <span aria-hidden="true">→</span>
        </button>
        {renderNote(0)}
      </React.Fragment> : frets.map(renderNote)}
    </div>
  );
}
