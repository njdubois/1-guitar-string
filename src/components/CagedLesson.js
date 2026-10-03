import React from 'react';
import { adjacentShape, CAGED_SHAPES } from '../caged';

export default function CagedLesson({ rootNote, shape, showScale, supported, onShapeChange, onMove, onScaleToggle, onFocus, onRestoreTuning, onPractice }) {
  const previous = adjacentShape(rootNote, shape, -1);
  const next = adjacentShape(rootNote, shape, 1);
  const sharedRoots = shape.tones.filter(tone => tone.degree === 'R' && next.tones.some(other => other.degree === 'R' && other.stringIndex === tone.stringIndex && other.fret === tone.fret));
  const chordName = `${rootNote.toUpperCase()} major`;

  return (
    <section className="cagedLesson" aria-labelledby="caged-title">
      <div className="cagedIntro">
        <div>
          <p className="brand">Learn the neck</p>
          <h2 id="caged-title">One chord. Five familiar shapes.</h2>
          <p>CAGED uses the open C, A, G, E and D chord shapes as a map. Move each shape so its roots land on your chosen key. Every shape below plays <strong>{chordName}</strong>.</p>
        </div>
        <details className="cagedExplanation">
          <summary>How this helps your playing</summary>
          <p>The letter names the shape; the root names the chord. An E shape moved to A is an A major chord.</p>
          <p>Follow the roots through the repeating C → A → G → E → D sequence. Neighboring shapes share root locations, giving you landmarks between positions.</p>
          <p>Start with the root, third and fifth. Add nearby major-pentatonic notes to build a short phrase, then land back on a root. This lesson begins with major chords; minor shapes are a separate step.</p>
          <a href="https://www.daddario.com/globalassets/pdfs/guitar/caged_system.pdf" target="_blank" rel="noopener noreferrer">Reference: Wolf Marshall’s CAGED guide ↗</a>
        </details>
      </div>
      {!supported ? (
        <div className="cagedTuningNotice">
          <p>These shapes use six strings in standard tuning: E–A–D–G–B–E, low to high.</p>
          <button type="button" className="practiceButton" onClick={onRestoreTuning}>Use standard six-string tuning</button>
        </div>
      ) : (
        <React.Fragment>
          <div className="cagedShapeButtons" role="group" aria-label="CAGED chord shape">
            {CAGED_SHAPES.map(item => (
              <button type="button" key={item.id} aria-pressed={item.id === shape.id} onClick={() => onShapeChange(item.id)}>
                <strong>{item.id}</strong><span>shape</span>
              </button>
            ))}
          </div>
          <div className="cagedShapeHeading">
            <div aria-live="polite">
              <h3>{chordName} · {shape.id} shape</h3>
              <p>{shape.base === 0 ? 'Open shape' : `Open shape moved up ${shape.base} frets`} · Frets {shape.minFret}–{shape.maxFret}</p>
            </div>
            <div className="practiceActions">
              <button type="button" className="practiceButton" disabled={!previous} onClick={() => onMove(-1)}>← Previous shape</button>
              <button type="button" className="practiceButton" onClick={() => onMove(1)}>Next up the neck →</button>
            </div>
          </div>
          <div className="cagedOptions">
            <label><input type="checkbox" checked={showScale} onChange={onScaleToggle} /> Add nearby major-pentatonic notes</label>
            <button type="button" className="clearButton" onClick={onFocus}>Show shape in view</button>
          </div>
          <p className="cagedConnection">Next: <strong>{next.id} shape</strong>. Shared {rootNote.toUpperCase()} {sharedRoots.length === 1 ? 'root' : 'roots'}: {sharedRoots.map(tone => `string ${tone.stringIndex + 1}, fret ${tone.fret}`).join(' · ')}.</p>
          <button type="button" className="practiceButton" onClick={onPractice}>Practice a major-pentatonic run here →</button>
        </React.Fragment>
      )}
    </section>
  );
}
