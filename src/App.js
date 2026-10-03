import React, { Component } from 'react';
import Fretboard from './components/Fretboard';
import FretboardStatus from './components/FretboardStatus';
import Toolbar from './components/Toolbar';
import CagedLesson from './components/CagedLesson';
import TriadExplorer from './components/TriadExplorer';
import { getTriadSelection, INVERSIONS, triadDefinition } from './triads';
import { adjacentShape, getCagedShape, isStandardTuning, STANDARD_TUNING } from './caged';
import { NOTES, SCALES, getScaleNotes, noteAtPitch } from './music';
import './App.css';

class App extends Component {
  state = {
    currentScale: '',
    currentScaleKey: 'a',
    currentStrings: STANDARD_TUNING.map((pitch, id) => ({ id, pitch, note: noteAtPitch(pitch) })),
    startFret: 1,
    totalFrets: 18,
    notesInScale: [],
    viewMode: 'explore',
    cagedShape: 'E',
    cagedOctave: 0,
    cagedShowScale: false,
    startWithRun: false,
    triadType: 'major',
    triadFirstString: 0,
    triadInversion: 'all',
    triadIndex: 0,
  };

  nextStringId = 6;

  componentDidUpdate(previousProps, previousState) {
    if (this.state.viewMode !== 'triads') return;
    const tuning = state => JSON.stringify(state.currentStrings.map(string => [string.id, string.pitch]));
    if (tuning(previousState) !== tuning(this.state)) {
      this.selectTriad({});
    }
  }

  triadUpdate = (state, changes, focus = true) => {
    const selection = getTriadSelection({ ...state, triadIndex: 0, ...changes });
    const fretted = selection.shape ? selection.shape.tones.filter(tone => tone.fret > 0).map(tone => tone.fret) : [];
    const startFret = fretted.length ? Math.max(1, Math.min(...fretted) - 1) : 1;
    const fitsWindow = selection.shape && selection.shape.tones.every(tone => (
      tone.fret === 0 || (tone.fret >= state.startFret && tone.fret < state.startFret + state.totalFrets)
    ));
    return {
      ...changes,
      triadFirstString: selection.firstString,
      triadIndex: selection.index,
      ...(selection.shape && (focus || !fitsWindow) ? {
        startFret,
        totalFrets: Math.max(6, state.totalFrets, selection.shape.maxFret - startFret + 1),
      } : {}),
    };
  };

  selectTriad = changes => {
    this.setState(state => this.triadUpdate(state, changes));
  };

  cagedWindow = (state, shape) => ({
    startFret: Math.max(1, shape.minFret - 1),
    totalFrets: Math.max(6, state.totalFrets),
  });

  changeView = viewMode => {
    this.setState(state => ({
      viewMode,
      startWithRun: false,
      ...(viewMode === 'caged' ? this.cagedWindow(state, getCagedShape(state.currentScaleKey, state.cagedShape, state.cagedOctave)) : {}),
      ...(viewMode === 'triads' ? this.triadUpdate(state, { triadIndex: state.triadIndex }) : {}),
    }));
  };

  selectCagedShape = (cagedShape, cagedOctave = 0) => {
    this.setState(state => ({
      cagedShape,
      cagedOctave,
      ...this.cagedWindow(state, getCagedShape(state.currentScaleKey, cagedShape, cagedOctave)),
    }));
  };

  moveCagedShape = direction => {
    this.setState(state => {
      const shape = getCagedShape(state.currentScaleKey, state.cagedShape, state.cagedOctave);
      const next = adjacentShape(state.currentScaleKey, shape, direction);
      return next ? {
        cagedShape: next.id,
        cagedOctave: next.octave,
        ...this.cagedWindow(state, next),
      } : null;
    });
  };

  toggleCagedScale = () => {
    this.setState(state => ({ cagedShowScale: !state.cagedShowScale }));
  };

  restoreStandardTuning = () => {
    const currentStrings = STANDARD_TUNING.map(pitch => ({ id: this.nextStringId++, pitch, note: noteAtPitch(pitch) }));
    this.setState({ currentStrings });
  };

  practiceCagedShape = () => {
    this.setState(state => {
      const shape = getCagedShape(state.currentScaleKey, state.cagedShape, state.cagedOctave);
      const scale = SCALES.find(item => item.id === 'major-pentatonic');
      return {
        viewMode: 'explore',
        startWithRun: true,
        currentScale: scale.id,
        notesInScale: getScaleNotes(state.currentScaleKey, scale.intervals),
        startFret: Math.max(1, shape.minFret - 1),
        totalFrets: Math.max(5, shape.maxFret - shape.minFret + 3),
      };
    });
  };

  changeStringTuning = (stringId, semitones) => {
    this.setState(state => ({
      currentStrings: state.currentStrings.map(string => (
        string.id === stringId
          ? { ...string, pitch: string.pitch + semitones, note: noteAtPitch(string.pitch + semitones) }
          : string
      )),
    }));
  };

  toggleNoteInScale = note => {
    this.setState(state => ({
      currentScale: '',
      notesInScale: state.notesInScale.includes(note)
        ? state.notesInScale.filter(selectedNote => selectedNote !== note)
        : [...state.notesInScale, note],
    }));
  };

  changeStartFret = amount => {
    this.setState(state => ({ startFret: Math.max(1, state.startFret + amount) }));
  };

  changeTotalFrets = amount => {
    this.setState(state => ({ totalFrets: Math.max(1, state.totalFrets + amount) }));
  };

  addString = position => {
    const id = this.nextStringId++;
    this.setState(state => {
      const neighbor = position === 'top' ? state.currentStrings[0] : state.currentStrings[state.currentStrings.length - 1];
      // Add the nearest A above or below the existing edge string.
      const pitch = !neighbor ? 45 : position === 'top'
        ? 9 + 12 * (Math.floor((neighbor.pitch - 9) / 12) + 1)
        : 9 + 12 * (Math.ceil((neighbor.pitch - 9) / 12) - 1);
      const string = { id, pitch, note: 'a' };
      return {
        currentStrings: position === 'top'
          ? [string, ...state.currentStrings]
          : [...state.currentStrings, string],
      };
    });
  };

  removeString = position => {
    this.setState(state => ({
      currentStrings: position === 'top'
        ? state.currentStrings.slice(1)
        : state.currentStrings.slice(0, -1),
    }));
  };

  setScale = scaleId => {
    const scale = SCALES.find(preset => preset.id === scaleId);
    this.setState(state => ({
      currentScale: scale ? scale.id : '',
      notesInScale: scale ? getScaleNotes(state.currentScaleKey, scale.intervals) : [],
    }));
  };

  clearScale = () => {
    this.setState({ currentScale: '', notesInScale: [] });
  };

  changeScaleKey = note => {
    if (!NOTES.includes(note)) return;

    this.setState(state => {
      const scale = SCALES.find(preset => preset.id === state.currentScale);
      return {
        currentScaleKey: note,
        ...(state.viewMode === 'triads'
          ? this.triadUpdate(state, { currentScaleKey: note }, false)
          : {}),
        ...(state.viewMode === 'caged' ? {
          cagedOctave: 0,
          ...this.cagedWindow(state, getCagedShape(note, state.cagedShape)),
        } : {}),
        // Preserve hand-selected notes when there is no preset to recalculate.
        notesInScale: scale ? getScaleNotes(note, scale.intervals) : state.notesInScale,
      };
    });
  };

  render() {
    const { currentScale, currentScaleKey, currentStrings, startFret, totalFrets, notesInScale } = this.state;
    const { viewMode, cagedShape, cagedOctave, cagedShowScale } = this.state;
    const learningCaged = viewMode === 'caged';
    const viewingTriads = viewMode === 'triads';
    const chordMode = learningCaged || viewingTriads;
    const standardTuning = isStandardTuning(currentStrings);
    const shape = getCagedShape(currentScaleKey, cagedShape, cagedOctave);
    const triadSelection = getTriadSelection(this.state);
    const chordDiagram = learningCaged ? { ...shape, showScale: cagedShowScale, chordDegrees: ['R', '3', '5'] } : viewingTriads ? triadSelection.shape : null;
    const showBoard = learningCaged ? standardTuning : viewingTriads ? Boolean(triadSelection.shape) : true;
    const scale = SCALES.find(item => item.id === currentScale);
    const keyDescription = learningCaged ? 'major' : viewingTriads
      ? triadDefinition(currentScaleKey, this.state.triadType).label.toLowerCase()
      : scale ? scale.title.toLowerCase() : '';

    return (
      <main className="App">
        <header className="appHeader">
          <p className="brand">Guitar Strings</p>
          <h1>Fretboard</h1>
          <p className="appDescription">Explore scales, connect chord shapes, and find your next phrase.</p>
        </header>
        <div className="viewSwitcher" role="group" aria-label="Fretboard view">
          <button type="button" aria-pressed={viewMode === 'explore'} onClick={() => this.changeView('explore')}>Explore & practice</button>
          <button type="button" aria-pressed={learningCaged} onClick={() => this.changeView('caged')}>Learn CAGED</button>
          <button type="button" aria-pressed={viewingTriads} onClick={() => this.changeView('triads')}>Triads</button>
        </div>
        <section className="workspace" aria-label="Scale explorer">
          <Toolbar
            lessonMode={chordMode}
            currentScale={currentScale}
            currentScaleKey={currentScaleKey}
            startFret={startFret}
            totalFrets={totalFrets}
            hasStrings={currentStrings.length > 0}
            hasSelectedNotes={notesInScale.length > 0}
            onScaleChange={this.setScale}
            onKeyChange={this.changeScaleKey}
            onClear={this.clearScale}
            onStartFretChange={this.changeStartFret}
            onTotalFretsChange={this.changeTotalFrets}
            onAddString={this.addString}
            onRemoveString={this.removeString}
          />
          {learningCaged && (
            <CagedLesson
              rootNote={currentScaleKey}
              shape={shape}
              showScale={cagedShowScale}
              supported={standardTuning}
              onShapeChange={this.selectCagedShape}
              onMove={this.moveCagedShape}
              onScaleToggle={this.toggleCagedScale}
              onFocus={() => this.selectCagedShape(cagedShape, cagedOctave)}
              onRestoreTuning={this.restoreStandardTuning}
              onPractice={this.practiceCagedShape}
            />
          )}
          {viewingTriads && (
            <TriadExplorer
              rootNote={currentScaleKey}
              strings={currentStrings}
              typeId={this.state.triadType}
              inversion={this.state.triadInversion}
              selection={triadSelection}
              onSettingsChange={this.selectTriad}
              onPositionChange={triadIndex => this.selectTriad({ triadIndex })}
              onFocus={() => this.selectTriad({ triadIndex: triadSelection.index })}
            />
          )}
          {showBoard && <React.Fragment>
            <div className="boardHeader">
              <h2>{chordMode ? 'Find the roots, then connect the chord tones' : 'Your fretboard'}</h2>
            </div>
            <FretboardStatus
              mode={viewMode}
              rootNote={currentScaleKey}
              keyDescription={keyDescription}
              selectionKind={learningCaged ? 'CAGED form' : 'Triad voicing'}
              selectionId={learningCaged ? `${shape.id}:${shape.octave}` : viewingTriads ? triadSelection.shape.id : ''}
              selectionLabel={learningCaged ? `${shape.id} shape` : viewingTriads ? `Position ${triadSelection.index + 1}` : ''}
              selectionDetail={learningCaged ? `Chord frets ${shape.minFret}–${shape.maxFret}` : viewingTriads ? `${INVERSIONS[triadSelection.shape.inversion]} · Frets ${triadSelection.shape.minFret}–${triadSelection.shape.maxFret}` : ''}
              startFret={startFret}
              fretCount={totalFrets}
              stringCount={currentStrings.length}
            />
            <Fretboard
              key={viewMode}
              chordDiagram={chordDiagram}
              startWithRun={this.state.startWithRun}
              strings={currentStrings}
              startFret={startFret}
              fretCount={totalFrets}
              notesInScale={notesInScale}
              rootNote={currentScaleKey}
              onNoteToggle={this.toggleNoteInScale}
              onTuningChange={this.changeStringTuning}
            />
            <div className="boardFooter">
              <span className="selectedLabel">{chordMode ? 'Chord tones' : 'Selected notes'}</span>
              <div className="selectedNotes" aria-live="polite" aria-atomic="true">
                {chordDiagram ? chordDiagram.chordNotes.map((note, index) => (
                  <span key={note} className="selectedNote">{chordDiagram.chordDegrees[index]} · {chordDiagram.chordLabels ? chordDiagram.chordLabels[index] : note}</span>
                )) : notesInScale.length > 0
                  ? notesInScale.map(note => <span key={note} className="selectedNote">{note}</span>)
                  : <span className="emptySelection">No notes selected yet</span>}
              </div>
            </div>
          </React.Fragment>}
        </section>
        <p className="appHint">{chordMode ? 'R = root. ♭ lowers an interval; ♯ raises it. Markers show chord intervals, not finger numbers. String 1 is the top row.' : 'Choose a scale, then practice a run between two root notes. String 1 is the top row.'}</p>
      </main>
    );
  }
}

export default App;
