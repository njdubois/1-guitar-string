import React from 'react';
import { INVERSIONS, TRIAD_TYPES, triadDefinition } from '../triads';

export default function TriadExplorer({ rootNote, strings, typeId, inversion, selection, onSettingsChange, onPositionChange, onFocus }) {
  const { firstString, voicings, index, shape } = selection;
  const definition = triadDefinition(rootNote, typeId);
  const stringSets = Array.from({ length: Math.max(0, strings.length - 2) }, (_, offset) => offset);

  return (
    <section className="triadExplorer" aria-labelledby="triad-title">
      <div className="triadIntro">
        <h2 id="triad-title">Three notes. A whole chord.</h2>
        <p>A triad has a root, a third and a fifth. An inversion changes which tone is lowest. Select a string group to see compact shapes up to fret 24.</p>
      </div>
      <div className="triadControls">
        <label className="controlField">
          <span className="controlLabel">Chord type</span>
          <select value={typeId} onChange={event => onSettingsChange({ triadType: event.target.value })}>
            {TRIAD_TYPES.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
          </select>
        </label>
        <label className="controlField">
          <span className="controlLabel">Strings · top to bottom</span>
          <select disabled={!stringSets.length} value={firstString} onChange={event => onSettingsChange({ triadFirstString: Number(event.target.value) })}>
            {!stringSets.length && <option value={0}>Add at least three strings</option>}
            {stringSets.map(offset => <option key={offset} value={offset}>Strings {offset + 1}–{offset + 3} · {strings.slice(offset, offset + 3).map(string => string.note.toUpperCase()).join('–')}</option>)}
          </select>
        </label>
        <label className="controlField">
          <span className="controlLabel">Inversion</span>
          <select value={inversion} onChange={event => onSettingsChange({ triadInversion: event.target.value })}>
            <option value="all">All inversions</option>
            {INVERSIONS.map((label, position) => <option key={label} value={position}>{label}</option>)}
          </select>
        </label>
      </div>
      <div className="triadSummary" aria-live="polite">
        <h3>{rootNote.toUpperCase()} {definition.label.toLowerCase()} · {definition.degrees.join(' – ')}</h3>
        <p>{definition.chordLabels.join(' · ')}{shape ? ` · ${INVERSIONS[shape.inversion]} · ${shape.bass.label} (${shape.bass.degree}) in the bass` : ''}</p>
      </div>
      {shape ? (
        <React.Fragment>
          <div className="triadNavigation">
            <div className="practiceActions">
              <button type="button" className="practiceButton" disabled={index === 0} onClick={() => onPositionChange(index - 1)}>← Lower position</button>
              <button type="button" className="practiceButton" disabled={index === voicings.length - 1} onClick={() => onPositionChange(index + 1)}>Higher position →</button>
              <button type="button" className="clearButton" onClick={onFocus}>Show triad in view</button>
            </div>
            <span className="boardMeta">Position {index + 1} of {voicings.length} · Frets {shape.minFret}–{shape.maxFret}</span>
          </div>
          <ul className="triadToneList" aria-label="Notes to play">
            {shape.tones.map(tone => <li key={tone.stringId}><span>String {tone.stringIndex + 1}, fret {tone.fret}</span><strong>{tone.label}</strong><span className="triadDegree">{tone.degree}</span></li>)}
          </ul>
          <p className="practiceHint">Play these three notes together, then pick them one at a time. Move to the next position and find the root again.</p>
        </React.Fragment>
      ) : <p className="practiceHint">{strings.length < 3 ? 'Add at least three strings to view triads.' : 'No compact, close-position triad fits this tuning and inversion through fret 24. Try another string group or inversion.'}</p>}
      <details className="triadExplanation">
        <summary>What do the inversions mean?</summary>
        <p>Root position puts the root lowest; first inversion puts the third lowest; second inversion puts the fifth lowest. All three keep the same chord tones.</p>
        <a href="https://www.justinguitar.com/guitar-lessons/triad-chord-grips-im-151" target="_blank" rel="noopener noreferrer">Learn more about triad grips ↗</a>
      </details>
    </section>
  );
}
