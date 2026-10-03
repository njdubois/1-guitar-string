import React from 'react';
import { pitchLabel } from '../music';

export default function RunPractice({ strings, steps, activeStep, onStepChange, onReverse, onChooseRoots }) {
  const current = steps[activeStep];
  const first = steps[0];
  const last = steps[steps.length - 1];
  const description = step => `${pitchLabel(step.pitch)}, string ${step.stringIndex + 1}, fret ${step.fret}`;

  return (
    <section className="runPractice" aria-label="Root-to-root run">
      <div className="runHeading">
        <div>
          <h3>{pitchLabel(first.pitch)} → {pitchLabel(last.pitch)}</h3>
          <p>{last.pitch > first.pitch ? 'Ascending' : 'Descending'} scale run · {steps.length} notes · Play left to right</p>
        </div>
        <div className="practiceActions">
          <button type="button" className="practiceButton" onClick={onReverse}>Reverse run</button>
          <button type="button" className="clearButton" onClick={onChooseRoots}>Choose other roots</button>
        </div>
      </div>
      <div className="runTab" role="group" aria-label="Guitar tab in playing order" tabIndex={0}>
        <div className="tabLabels" aria-hidden="true">
          <span className="tabStepNumber">Step</span>
          {strings.map((string, index) => <span key={string.id} className="tabStringLabel">{index + 1} · {string.note.toUpperCase()}</span>)}
          <span className="tabInterval">Interval</span>
        </div>
        {steps.map((step, index) => (
          <button
            key={`${step.stringId}:${step.fret}`}
            type="button"
            className={`tabColumn${index === activeStep ? ' activeTabColumn' : ''}`}
            aria-label={`Step ${index + 1}: ${description(step)}, ${step.interval === 'R' ? 'root' : `interval ${step.interval}`}`}
            aria-pressed={index === activeStep}
            onClick={() => onStepChange(index)}
          >
            <span className="tabStepNumber" aria-hidden="true">{index + 1}</span>
            {strings.map(string => (
              <span key={string.id} className="tabString" aria-hidden="true">
                {string.id === step.stringId && <span className={step.interval === 'R' ? 'tabFret rootTabFret' : 'tabFret'}>{step.fret}</span>}
              </span>
            ))}
            <span className="tabInterval" aria-hidden="true">{step.interval}</span>
          </button>
        ))}
      </div>
      <div className="runTransport">
        <div className="practiceActions">
          <button type="button" className="practiceButton" disabled={activeStep === 0} onClick={() => onStepChange(activeStep - 1)}>← Previous</button>
          <button type="button" className="practiceButton" disabled={activeStep === steps.length - 1} onClick={() => onStepChange(activeStep + 1)}>Next →</button>
        </div>
        <p className="currentRunNote" aria-live="polite">
          <strong>{activeStep + 1} / {steps.length}</strong> · {description(current)} · {current.interval === 'R' ? 'Root' : `Interval ${current.interval}`}
        </p>
      </div>
      <p className="practiceHint">Follow the numbers, one note at a time. Land on the final root, then try the run in reverse.</p>
    </section>
  );
}
