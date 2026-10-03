import React, { Component } from 'react';

const fretRange = props => `${props.startFret}–${props.startFret + props.fretCount - 1}`;
const keyName = props => `${props.rootNote.toUpperCase()}${props.keyDescription ? ` ${props.keyDescription}` : ''}`;

export default class FretboardStatus extends Component {
  state = { message: '', keyRevision: 0, shapeRevision: 0, positionRevision: 0 };

  componentDidUpdate(previousProps) {
    const props = this.props;
    const keyChanged = previousProps.rootNote !== props.rootNote || previousProps.keyDescription !== props.keyDescription;
    const shapeChanged = previousProps.selectionId !== props.selectionId;
    const positionChanged = fretRange(previousProps) !== fretRange(props);
    const modeChanged = previousProps.mode !== props.mode;
    if (!keyChanged && !shapeChanged && !positionChanged && !modeChanged) return;

    const changes = [];
    if (modeChanged) {
      changes.push(`${keyName(props)}${props.selectionLabel ? ` · ${props.selectionLabel}` : ''}.`);
    } else {
      if (keyChanged) changes.push(`Key: ${keyName(previousProps)} → ${keyName(props)}.`);
      if (shapeChanged && props.selectionLabel) {
        const selectionChange = previousProps.selectionLabel !== props.selectionLabel
          ? `${previousProps.selectionLabel} → ${props.selectionLabel}`
          : `${props.selectionLabel} · ${props.selectionDetail}`;
        changes.push(`${props.selectionKind}: ${selectionChange}.`);
        if (!keyChanged) changes.push(`Key stays ${keyName(props)}.`);
      }
    }
    if (positionChanged) {
      const distance = props.startFret - previousProps.startFret;
      const direction = distance === 0 ? '' : ` (${distance > 0 ? 'up' : 'down'} ${Math.abs(distance)} ${Math.abs(distance) === 1 ? 'fret' : 'frets'})`;
      changes.push(`View: frets ${fretRange(previousProps)} → ${fretRange(props)}${direction}.`);
    }
    this.setState(state => ({
      message: changes.join(' '),
      keyRevision: state.keyRevision + (keyChanged ? 1 : 0),
      shapeRevision: state.shapeRevision + (shapeChanged ? 1 : 0),
      positionRevision: state.positionRevision + (positionChanged ? 1 : 0),
    }));
  }

  render() {
    const { rootNote, keyDescription, mode, selectionKind, selectionLabel, selectionDetail, stringCount } = this.props;
    const { message, keyRevision, shapeRevision, positionRevision } = this.state;
    return (
      <div className="boardStatus">
        <dl className="boardReadout">
          <div className="boardReadoutKey">
            <dt>Key / root</dt>
            <dd>
              <strong key={keyRevision} className={keyRevision ? 'readoutChanged' : ''}>{rootNote.toUpperCase()}</strong>
              <span>{keyDescription || 'Custom notes'}</span>
            </dd>
          </div>
          {selectionLabel && <div>
            <dt>{selectionKind}</dt>
            <dd key={shapeRevision} className={shapeRevision ? 'readoutChanged' : ''}><strong>{selectionLabel}</strong></dd>
            <dd className="boardReadoutDetail">{selectionDetail}</dd>
          </div>}
          <div>
            <dt>Fret window</dt>
            <dd key={positionRevision} className={positionRevision ? 'readoutChanged' : ''}><strong>{fretRange(this.props)}</strong></dd>
            <dd className="boardReadoutDetail">{stringCount} {stringCount === 1 ? 'string' : 'strings'} · Open strings at left</dd>
          </div>
        </dl>
        <p className="boardChangeMessage" role="status" aria-live="polite" aria-atomic="true">
          {message || (mode === 'caged'
            ? `Changing the form keeps the key at ${keyName(this.props)}.`
            : 'Outlined notes mark the selected root.')}
        </p>
      </div>
    );
  }
}
