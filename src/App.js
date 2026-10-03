import React, { Component } from 'react';
import Fretboard from './components/Fretboard';
import Toolbar from './components/Toolbar';
import { NOTES, SCALES, getScaleNotes, noteAtPitch } from './music';
import './App.css';

class App extends Component {
  state = {
    currentScale: '',
    currentScaleKey: 'a',
    currentStrings: [64, 59, 55, 50, 45, 40].map((pitch, id) => ({ id, pitch, note: noteAtPitch(pitch) })),
    startFret: 1,
    totalFrets: 18,
    notesInScale: [],
  };

  nextStringId = 6;

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
        // Preserve hand-selected notes when there is no preset to recalculate.
        notesInScale: scale ? getScaleNotes(note, scale.intervals) : state.notesInScale,
      };
    });
  };

  render() {
    const { currentScale, currentScaleKey, currentStrings, startFret, totalFrets, notesInScale } = this.state;

    return (
      <main className="App">
        <header className="appHeader">
          <p className="brand">Guitar Strings</p>
          <h1>Fretboard</h1>
          <p className="appDescription">Choose a scale or click notes to make your own.</p>
        </header>
        <section className="workspace" aria-label="Scale explorer">
          <Toolbar
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
          <div className="boardHeader">
            <h2>Your fretboard</h2>
            <span className="boardMeta">
              {currentStrings.length} {currentStrings.length === 1 ? 'string' : 'strings'}
              {' · '}Frets {startFret}–{startFret + totalFrets - 1}
            </span>
          </div>
          <Fretboard
            strings={currentStrings}
            startFret={startFret}
            fretCount={totalFrets}
            notesInScale={notesInScale}
            rootNote={currentScaleKey}
            onNoteToggle={this.toggleNoteInScale}
            onTuningChange={this.changeStringTuning}
          />
          <div className="boardFooter">
            <span className="selectedLabel">Selected notes</span>
            <div className="selectedNotes" aria-live="polite" aria-atomic="true">
              {notesInScale.length > 0
                ? notesInScale.map(note => <span key={note} className="selectedNote">{note}</span>)
                : <span className="emptySelection">No notes selected yet</span>}
            </div>
          </div>
        </section>
        <p className="appHint">Choose a scale, then practice a run between two root notes. String 1 is the top row.</p>
      </main>
    );
  }
}

export default App;
