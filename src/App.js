import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


// This is the parent parent parent!
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScale: "",
      currentScaleKey: "a",
      currentStrings: ['e', 'b', 'g', 'd', 'a', 'e'],
      startFret: 1,
      totalFrets: 18,
      notesInScale: [],
      notes: [
        { key: 0, noteLabel: 'a' },
        { key: 1, noteLabel: 'a#' },
        { key: 2, noteLabel: 'b' },
        { key: 3, noteLabel: 'c' },
        { key: 4, noteLabel: 'c#' },
        { key: 5, noteLabel: 'd' },
        { key: 6, noteLabel: 'd#' },
        { key: 7, noteLabel: 'e' },
        { key: 8, noteLabel: 'f' },
        { key: 9, noteLabel: 'f#' },
        { key: 10, noteLabel: 'g' },
        { key: 11, noteLabel: 'g#' }
      ],
      noteCount: 11
    };
  }

  increaseStringStartNote(stringIndex) {

    var currentStringArray = this.state.currentStrings;
    var currentNote = currentStringArray[stringIndex];
    var noteToKey = this.convertNoteToKey(currentNote)

    noteToKey++;

    if (noteToKey > this.state.noteCount) { noteToKey = 0;}

    var newNote = this.convertKeyToNote(noteToKey)

    currentStringArray[stringIndex] = newNote;

    this.setState({ currentStrings: currentStringArray });
  }

  decreaseStringStartNote(stringIndex) {

    var currentStringArray = this.state.currentStrings;
    var currentNote = currentStringArray[stringIndex];
    var noteToKey = this.convertNoteToKey(currentNote)

    noteToKey--;

    if (noteToKey < 0) { noteToKey = this.state.noteCount;}

    var newNote = this.convertKeyToNote(noteToKey)

    currentStringArray[stringIndex] = newNote;

    this.setState({ currentStrings: currentStringArray });
  }

  convertNoteToKey = function(testNote) {
    var noteKey = "?";

    this.state.notes.map((note) => {
        if (testNote == note.noteLabel) { 
          noteKey = note.key; 
        }
      }
    );
    
    return noteKey;
  };

  convertKeyToNote = function(testKey) {
    var noteLabel = "?";
    this.state.notes.map((note) => {
        if (testKey == note.key) { 
          noteLabel = note.noteLabel; 
        }
      }
    );
    
    return noteLabel;
  };

  toggleNoteInScale(note) {
    
    var index = this.state.notesInScale.indexOf(note);
    var currentNotesInScale = this.state.notesInScale;

    if (index > -1) {
        //remove note
        currentNotesInScale.splice(index, 1);
    }
    else {
      // add note
      currentNotesInScale.push(note);   
    }

    this.setState({notesInScale: currentNotesInScale});
  }

  lowerStartFret() {
    var currentStartFret = this.state.startFret;

    currentStartFret--;

    if (currentStartFret < 1) { currentStartFret = 1;}
    this.setState({startFret: currentStartFret});
  }

  increaseStartFret() {
    var currentStartFret = this.state.startFret;

    currentStartFret++;

    this.setState({startFret: currentStartFret});
  }

  lowerTotalFrets() {
    var currentTotalFrets = this.state.totalFrets;

    currentTotalFrets--;

    if (currentTotalFrets < 1) { currentTotalFrets = 1;}
    this.setState({totalFrets: currentTotalFrets});
  }

  increaseTotalFrets() {
    var currentTotalFrets = this.state.totalFrets;

    currentTotalFrets++;

    this.setState({totalFrets: currentTotalFrets});
  }

  addStringToTop() {
    var currentStrings = this.state.currentStrings;
    currentStrings.unshift("a");
    this.setState({currrentStrings: currentStrings});
  }

  addStringToBottom() {
    var currentStrings = this.state.currentStrings;
    currentStrings.push("a");
    this.setState({currrentStrings: currentStrings});
  }

  removeTopString() {
    var currentStrings = this.state.currentStrings;
    currentStrings.splice(0, 1);
    this.setState({currrentStrings: currentStrings});
  }

  removeBottomString() {
    var currentStrings = this.state.currentStrings;
    currentStrings.splice(-1, 1);
    this.setState({currrentStrings: currentStrings});
  }

  setScale = (e) => {
    // if (e.target.value) {
    //   console.log("here", e.target.value);
      this.setState({currentScale: e.target.value, notesInScale: []}, () => {
        this.calcScale();
      });
  };

  calcScale = () => {
    let scale = this.state.currentScale;

console.log("scale : ", scale);

    if (scale) {



      let scaleItems = scale.split(",");

      let startKey = parseInt(this.convertNoteToKey(this.state.currentScaleKey));
      this.toggleNoteInScale(this.convertKeyToNote(startKey));

      scaleItems.map((aScaleInc) => {
        let nextNote = parseInt(startKey) + parseInt(aScaleInc);

        if (nextNote >= 12 ) nextNote = nextNote - 12;

        this.toggleNoteInScale(this.convertKeyToNote(nextNote));

        startKey = nextNote;
      });

    }
  };

  changeScaleKey = (e) => {
    this.setState({currentScaleKey: e.target.value, notesInScale: []}, () => {
      this.calcScale();
    });
  };

  render() {

    const stringList = this.state.currentStrings.map((aString, key) =>
      <AGuitarString stringIndex={key} startFret={this.state.startFret} decreaseStringStartNote={this.decreaseStringStartNote.bind(this)} increaseStringStartNote={this.increaseStringStartNote.bind(this)} toggleNoteInScale={this.toggleNoteInScale.bind(this)}  startNote={aString} fretCount={this.state.totalFrets} notesInScale={this.state.notesInScale} />
    );

    return (
      <div className="App">
        <div className="toolBar">

          <div className="toolBarItem">
            <select value={this.state.currentScaleKey} onChange={this.changeScaleKey}>
              <option></option>
              {this.state.notes.map(note => {
                return (
                  <option>
                    {note.noteLabel}
                  </option>
                );
              })}
            </select>
            <select onChange={this.setScale} value={this.state.currentScale}>
              <option value="">Scale</option>
              <option
                value="3,2,2,3"
              >
                Pentatonic
              </option>
            </select>
          </div>
          <div className="toolBarItem">
            <button onClick={this.lowerStartFret.bind(this)} className="toolBarItemButton">-</button>
            <div className="toolBarItemLabel">Start Fret: {this.state.startFret}</div>
            <button onClick={this.increaseStartFret.bind(this)}  className="toolBarItemButton">+</button>
          </div>

          <div className="toolBarItem">
            <button onClick={this.lowerTotalFrets.bind(this)} className="toolBarItemButton">-</button>
            <div className="toolBarItemLabel">Total Frets: {this.state.totalFrets}</div>
            <button onClick={this.increaseTotalFrets.bind(this)}  className="toolBarItemButton">+</button>
          </div>
          <div className="toolBarItem">
            <div className="toolBarItemLabel">Add String</div>
            <button onClick={this.addStringToTop.bind(this)}  className="toolBarItemButton">Top</button>
            <button onClick={this.addStringToBottom.bind(this)} className="toolBarItemButton">Bottom</button>
          </div>
          <div className="toolBarItem">
            <div className="toolBarItemLabel">Remove String</div>
            <button onClick={this.removeTopString.bind(this)}  className="toolBarItemButton">Top</button>
            <button onClick={this.removeBottomString.bind(this)} className="toolBarItemButton">Bottom</button>
          </div>

        </div>
        {stringList}
        <AFretBoardLabel startFret={this.state.startFret} fretCount={this.state.totalFrets} />
      </div>
    );
  }
  
}

class AGuitarString extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notes: [
        { key: 0, noteLabel: 'a' },
        { key: 1, noteLabel: 'a#' },
        { key: 2, noteLabel: 'b' },
        { key: 3, noteLabel: 'c' },
        { key: 4, noteLabel: 'c#' },
        { key: 5, noteLabel: 'd' },
        { key: 6, noteLabel: 'd#' },
        { key: 7, noteLabel: 'e' },
        { key: 8, noteLabel: 'f' },
        { key: 9, noteLabel: 'f#' },
        { key: 10, noteLabel: 'g' },
        { key: 11, noteLabel: 'g#' }
      ],
      noteCount: 11
    };
  }

  handleNoteClick(note) {
    this.props.toggleNoteInScale(note);
  }

  handleNoteDecreaseClick(stringIndex) {
    this.props.decreaseStringStartNote(stringIndex)
  }

  handleNoteIncreaseClick(stringIndex) {
    this.props.increaseStringStartNote(stringIndex)
  }

  convertNoteToKey = function(testNote) {
    var noteKey = "?";

    this.state.notes.map((note) => {
        if (testNote == note.noteLabel) { 
          noteKey = note.key; 
        }
      }
    );
    
    return noteKey;
  }

  convertKeyToNote = function(testKey) {
    var noteLabel = "?";

    this.state.notes.map((note) => {
        if (testKey == note.key) { 
          noteLabel = note.noteLabel; 
        }
      }
    );
    
    return noteLabel;
  }

  getStringNotes = function(startNote, fretCount, startFret, notesInScale) {
    var stringNotes = [];

  // key is a traditional programming, array "key"
  // but Note is the "note" the string makes when played at the current fret.
  // Know the differences here!

    var openStringKey = this.convertNoteToKey(startNote);
    var startNoteKey = openStringKey + (startFret)
    
    // startNoteKey may be higher than the number of notes available
    if (startNoteKey > this.state.noteCount) {
      // startNoteKey is over the total count of notes available.
      // lets get the remainder to insure we start at the right note.

      // we use the length of the notes array instead of noteCount to insure we get to a "0"
      // and get the array's first element, index 0.
      
      startNoteKey = startNoteKey - this.state.notes.length;
    }    

    for (var currentFret = startFret; currentFret <= (( startFret + fretCount ) - 1); currentFret++) {
      
      // get current note
      var currentNote = this.convertKeyToNote(startNoteKey);
      
      //Add Note To String
      stringNotes.push(
        <div className="aFret stringFretNote" onClick={this.handleNoteClick.bind(this, currentNote)}>
          <div className={ (notesInScale.indexOf(currentNote) > -1 ? 'noteInScale' : 'noteNoteInScale') }>
            {currentNote}
          </div>
        </div>
      );
      
      startNoteKey++;
      if (startNoteKey > this.state.noteCount) {
        startNoteKey=0;
      }
    }

    return stringNotes;
  }

  render() {
    return (
      <div>
        <div className="aFretBoardString">
          <div className="aFret stringMenu" onClick={this.handleNoteDecreaseClick.bind(this,this.props.stringIndex)}>
            <i class="fas fa-arrow-left"></i>
          </div>

          <div className="aFret stringMenu" onClick={this.handleNoteIncreaseClick.bind(this,this.props.stringIndex)}>
            <i class="fas fa-arrow-right"></i>
          </div>

          <div className="aFret stringLabel" onClick={this.handleNoteClick.bind(this, this.props.startNote)}>
            <div className={ (this.props.notesInScale.indexOf(this.props.startNote) > -1 ? 'noteInScale' : 'noteNoteInScale') }>
              {this.props.startNote}
            </div>
          </div>

          {this.getStringNotes(this.props.startNote, this.props.fretCount, this.props.startFret, this.props.notesInScale)}
        </div>
      </div>
    );
  }
  
}

class AFretBoardLabel extends React.Component {

  getStringLabel = function(fretCount, startFret) {
    var stringNotes = [];

    if (startFret < 1) { startFret = 1; }

    //add Space for string Menu
    stringNotes.push(
      <div className="aFret stringMenu"></div>
    );
    stringNotes.push(
      <div className="aFret stringMenu"></div>
    );

    stringNotes.push(<div className="aFret aFretLabel stringLabel">0</div>);

    for (var currentFret = startFret; currentFret <= (( startFret + fretCount ) - 1); currentFret++) {
      //Add Note To String
      stringNotes.push(<div className="aFret aFretLabel stringFretNote">{currentFret}</div>);
    }

    return stringNotes;
  }

  render() {
    return (
      <div className="aFretBoardString">
          {this.getStringLabel(this.props.fretCount, this.props.startFret)}
      </div>
    );
  };
}

export default App;