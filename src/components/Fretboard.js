import React, { Component } from 'react';
import GuitarString from './GuitarString';
import RunPractice from './RunPractice';
import { pitchLabel } from '../music';
import { buildRun, getPositions, positionKey, suggestRun } from '../runs';

function FretLabels({ frets = [], controls = false }) {
  return (
    <div className={`aFretBoardString fretLabels${controls ? ' stringControls' : ''}`} aria-hidden="true">
      {controls ? <React.Fragment>
        <span className="aFret stringMenu" />
        <span className="aFret stringMenu" />
        <span className="aFret aFretLabel stringLabel">0</span>
      </React.Fragment> : frets.map(fret => (
        <span key={fret} className={`aFret aFretLabel stringFretNote ${[0, 3, 5, 7, 9].includes(fret % 12) ? 'fretMarker' : ''}`}>
          {fret}
        </span>
      ))}
    </div>
  );
}

function configuration(props) {
  return JSON.stringify([
    props.rootNote, props.notesInScale, props.startFret, props.fretCount,
    props.strings.map(string => [string.id, string.pitch]),
    props.chordDiagram && [props.chordDiagram.id, props.chordDiagram.base, props.chordDiagram.showScale],
  ]);
}

export default class Fretboard extends Component {
  state = { practicing: false, startKey: null, endKey: null, activeStep: 0, message: '', reversedSteps: null, chordNoteKey: null, pan: null };
  board = React.createRef();
  panFrame = null;

  componentDidMount() {
    if (this.props.startWithRun) {
      const { strings, startFret, fretCount, rootNote } = this.props;
      const frets = Array.from({ length: fretCount }, (_, index) => startFret + index);
      this.suggest(getPositions(strings, frets, rootNote));
    }
  }

  getSnapshotBeforeUpdate(previousProps, previousState) {
    if (previousProps.startFret === this.props.startFret && previousProps.fretCount === this.props.fretCount) return null;
    const board = this.board.current;
    const cell = board.querySelector('.fretLabels .stringFretNote');
    if (!cell) return null;
    return {
      startFret: previousState.pan ? previousState.pan.startFret : previousProps.startFret,
      endFret: previousState.pan ? previousState.pan.endFret : previousProps.startFret + previousProps.fretCount - 1,
      cellWidth: cell.getBoundingClientRect().width,
      scrollLeft: board.scrollLeft,
      availableWidth: board.clientWidth,
    };
  }

  componentDidUpdate(previousProps, previousState, snapshot) {
    if (configuration(previousProps) !== configuration(this.props)) {
      this.setState(state => ({
        startKey: null,
        endKey: null,
        activeStep: 0,
        message: '',
        reversedSteps: null,
        chordNoteKey: null,
        practicing: state.practicing && this.canPractice(),
      }));
    }
    if (previousProps.startFret !== this.props.startFret) {
      this.panToPosition(snapshot);
    } else if (previousProps.fretCount !== this.props.fretCount && this.state.pan) {
      this.finishPan();
    }
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.panFrame);
  }

  finishPan = () => {
    window.cancelAnimationFrame(this.panFrame);
    this.panFrame = null;
    this.setState({ pan: null }, () => { this.board.current.scrollLeft = 0; });
  };

  panToPosition = snapshot => {
    window.cancelAnimationFrame(this.panFrame);
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!snapshot || reducedMotion || !this.props.strings.length) {
      this.finishPan();
      return;
    }
    // Keep both windows briefly so the fret numbers and notes physically scroll together.
    const startFret = Math.min(snapshot.startFret, this.props.startFret);
    const endFret = Math.max(snapshot.endFret, this.props.startFret + this.props.fretCount - 1);
    const cellWidth = Math.max(52, snapshot.cellWidth, snapshot.availableWidth / this.props.fretCount);
    const from = (snapshot.startFret - startFret + snapshot.scrollLeft / snapshot.cellWidth) * cellWidth;
    const to = (this.props.startFret - startFret) * cellWidth;
    if (Math.abs(to - from) < 1) {
      this.finishPan();
      return;
    }
    this.setState({ pan: { startFret, endFret, cellWidth } }, () => {
      const board = this.board.current;
      board.scrollLeft = from;
      const startedAt = performance.now();
      const duration = 480;
      const move = now => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        board.scrollLeft = from + (to - from) * eased;
        if (progress < 1) this.panFrame = window.requestAnimationFrame(move);
        else this.finishPan();
      };
      this.panFrame = window.requestAnimationFrame(move);
    });
  };

  canPractice = () => this.props.strings.length > 0 &&
    this.props.notesInScale.length > 1 && this.props.notesInScale.includes(this.props.rootNote);

  togglePractice = () => {
    this.setState(state => ({ practicing: !state.practicing, startKey: null, endKey: null, activeStep: 0, message: '', reversedSteps: null }));
  };

  chooseRoots = () => {
    this.setState({ startKey: null, endKey: null, activeStep: 0, message: '', reversedSteps: null });
  };

  chooseRoot = position => {
    const key = positionKey(position);
    this.setState(state => state.startKey
      ? { endKey: key, activeStep: 0, message: '', reversedSteps: null }
      : { startKey: key, endKey: null, activeStep: 0, message: '', reversedSteps: null });
  };

  suggest = positions => {
    const suggestion = suggestRun(positions, this.props.notesInScale, this.props.rootNote, this.props.startFret);
    this.setState(suggestion ? {
      practicing: true,
      startKey: positionKey(suggestion.start),
      endKey: positionKey(suggestion.end),
      reversedSteps: null,
      activeStep: 0,
      message: '',
    } : { practicing: true, message: 'No one-octave run fits this view. Show more frets, or choose two roots yourself.' });
  };

  reverse = steps => {
    // Reverse the chosen fingering exactly, rather than finding a different route.
    this.setState(state => ({
      startKey: state.endKey,
      endKey: state.startKey,
      activeStep: 0,
      reversedSteps: steps.slice().reverse(),
    }));
  };

  changeStep = activeStep => {
    this.setState({ activeStep }, () => {
      const cell = this.board.current.querySelector('[data-run-current="true"]');
      if (cell) cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  };

  render() {
    const { strings, startFret, fretCount, notesInScale, rootNote, onNoteToggle, onTuningChange, chordDiagram } = this.props;
    const { practicing, startKey, endKey, message, reversedSteps } = this.state;
    const frets = Array.from({ length: fretCount }, (_, index) => startFret + index);
    const { pan } = this.state;
    const renderedFrets = pan
      ? Array.from({ length: pan.endFret - pan.startFret + 1 }, (_, index) => pan.startFret + index)
      : frets;
    const positions = getPositions(strings, frets, rootNote);
    const start = positions.find(position => positionKey(position) === startKey && position.note === rootNote);
    const end = positions.find(position => positionKey(position) === endKey && position.note === rootNote);
    const result = buildRun(positions, notesInScale, start, end);
    // A reversed path is reusable only while its endpoints and configuration match.
    const useReversed = reversedSteps && result.steps.length &&
      positionKey(reversedSteps[0]) === startKey && positionKey(reversedSteps[reversedSteps.length - 1]) === endKey &&
      reversedSteps.every(step => positions.some(position => positionKey(position) === positionKey(step) && position.pitch === step.pitch) && notesInScale.includes(step.note));
    const steps = useReversed ? reversedSteps : result.steps;
    const activeStep = Math.min(this.state.activeStep, Math.max(0, steps.length - 1));
    const rootCount = positions.filter(position => position.note === rootNote).length;
    let hint = 'Choose two root positions and follow a numbered scale run between them.';
    if (!this.canPractice()) hint = `Choose a scale with ${rootNote.toUpperCase()} in it, or select the root and at least one other note.`;
    else if (practicing && !rootCount) hint = 'No roots are visible. Show more frets to find a starting root.';
    else if (practicing && !start) hint = `Choose a starting ${rootNote.toUpperCase()} on the board, or try a suggested run. Outlined notes are roots.`;
    else if (practicing && !steps.length) hint = `Starting at ${pitchLabel(start.pitch)}, string ${start.stringIndex + 1}, fret ${start.fret}. Choose a root in another octave to finish.`;
    else if (practicing) hint = 'Play the numbered notes in order. Click a note or tab column to focus on that step.';
    const chordNote = chordDiagram && positions.find(position => positionKey(position) === this.state.chordNoteKey);
    const selectedTone = chordNote && chordDiagram.tones.find(tone => tone.stringIndex === chordNote.stringIndex && tone.fret === chordNote.fret);
    const selectedInterval = selectedTone ? selectedTone.degree : chordNote && chordNote.interval;
    const renderStrings = controls => strings.map((string, index) => (
      <GuitarString
        key={string.id}
        controls={controls}
        string={string}
        stringNumber={index + 1}
        frets={renderedFrets}
        visibleStart={startFret}
        visibleEnd={startFret + fretCount - 1}
        notesInScale={notesInScale}
        rootNote={rootNote}
        onNoteToggle={onNoteToggle}
        onTuningChange={onTuningChange}
        practicing={practicing}
        steps={steps}
        activeStep={activeStep}
        startKey={startKey}
        onRootPick={this.chooseRoot}
        onStepChange={this.changeStep}
        chordDiagram={chordDiagram}
        chordNoteKey={this.state.chordNoteKey}
        onChordNotePick={position => this.setState({ chordNoteKey: positionKey(position) })}
      />
    ));

    return (
      <React.Fragment>
        {chordDiagram ? <div className="practiceControls chordBoardLegend">
          <p className="practiceHint" aria-live="polite">
            {chordNote
              ? `${selectedTone && selectedTone.label ? selectedTone.label : pitchLabel(chordNote.pitch)} · String ${chordNote.stringIndex + 1}, fret ${chordNote.fret} · ${selectedInterval === 'R' ? 'Root: a place to resolve your phrase.' : `Interval ${selectedInterval} above the root.`}`
              : 'Outlined markers are roots. Click a visible note to identify it. × marks a string omitted from the chord.'}
          </p>
        </div> : <div className="practiceControls">
          <div className="practiceActions">
            <button type="button" className="practiceButton" aria-pressed={practicing} disabled={!practicing && !this.canPractice()} onClick={this.togglePractice}>
              {practicing ? 'Edit scale' : 'Practice runs'}
            </button>
            {practicing && <button type="button" className="practiceButton" onClick={() => this.suggest(positions)}>Suggest a run</button>}
            {practicing && start && !steps.length && <button type="button" className="clearButton" onClick={this.chooseRoots}>Reset roots</button>}
          </div>
          <p className="practiceHint" aria-live="polite">{message || result.error || hint}</p>
        </div>}
        {strings.length === 0 && <p className="emptyBoard">Add a string above to start building your fretboard.</p>}
        <div className={`fretboardLayout${practicing ? ' practicingRun' : ''}`} role="group" aria-label="Guitar fretboard">
          <div className="fretboardControls">
            <FretLabels controls />
            {renderStrings(true)}
            <FretLabels controls />
          </div>
          <div ref={this.board} className={`fretboard${pan ? ' fretboardPanning' : ''}`} style={pan ? { '--fret-width': `${pan.cellWidth}px` } : undefined} role="region" aria-label={`${rootNote.toUpperCase()} root, frets ${startFret} through ${startFret + fretCount - 1}`} tabIndex={0}>
            <FretLabels frets={renderedFrets} />
            {renderStrings(false)}
            <FretLabels frets={renderedFrets} />
          </div>
        </div>
        {practicing && steps.length > 0 && (
          <RunPractice
            strings={strings}
            steps={steps}
            activeStep={activeStep}
            onStepChange={this.changeStep}
            onReverse={() => this.reverse(steps)}
            onChooseRoots={this.chooseRoots}
          />
        )}
      </React.Fragment>
    );
  }
}
