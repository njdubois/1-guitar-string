import React from 'react';
import { NOTES, SCALES } from '../music';

function Stepper({ label, value, onChange }) {
  return (
    <div className="controlField">
      <span className="controlLabel">{label}</span>
      <div className="stepper" role="group" aria-label={label}>
        <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value === 1} onClick={() => onChange(-1)}>−</button>
        <span className="stepperValue">{value}</span>
        <button type="button" aria-label={`Increase ${label.toLowerCase()}`} onClick={() => onChange(1)}>+</button>
      </div>
    </div>
  );
}

function StringControl({ label, action, disabled, onChange }) {
  return (
    <div className="controlField">
      <span className="controlLabel">{label}</span>
      <div className="segmentedControl" role="group" aria-label={label}>
        <button type="button" aria-label={`${action} top string`} disabled={disabled} onClick={() => onChange('top')}>Top</button>
        <button type="button" aria-label={`${action} bottom string`} disabled={disabled} onClick={() => onChange('bottom')}>Bottom</button>
      </div>
    </div>
  );
}

export default function Toolbar({
  currentScale, currentScaleKey, startFret, totalFrets, hasStrings, hasSelectedNotes,
  onScaleChange, onKeyChange, onClear, onStartFretChange, onTotalFretsChange,
  onAddString, onRemoveString,
  lessonMode,
}) {
  return (
    <div className="toolbar" role="group" aria-label="Fretboard controls">
      <div className="scaleControls">
        <label className="controlField keyField">
          <span className="controlLabel">Key</span>
          <select value={currentScaleKey} onChange={event => onKeyChange(event.target.value)}>
            {NOTES.map(note => <option key={note} value={note}>{note.toUpperCase()}</option>)}
          </select>
        </label>
        {!lessonMode && <React.Fragment><label className="controlField scaleField">
          <span className="controlLabel">Scale</span>
          <select value={currentScale} onChange={event => onScaleChange(event.target.value)}>
            <option value="">{hasSelectedNotes && !currentScale ? 'Custom scale' : 'Choose a scale'}</option>
            {SCALES.map(scale => <option key={scale.id} value={scale.id}>{scale.title}</option>)}
          </select>
        </label>
        <button type="button" onClick={onClear} className="clearButton" disabled={!hasSelectedNotes && !currentScale}>Clear</button>
        </React.Fragment>}
      </div>
      <div className="neckControls">
        <Stepper label="Start fret" value={startFret} onChange={onStartFretChange} />
        <Stepper label="Total frets" value={totalFrets} onChange={onTotalFretsChange} />
        <StringControl label="Add string" action="Add" onChange={onAddString} />
        <StringControl label="Remove string" action="Remove" disabled={!hasStrings} onChange={onRemoveString} />
      </div>
    </div>
  );
}
