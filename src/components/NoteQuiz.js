import React, { Component } from 'react';
import Fretboard from './Fretboard';
import { createNoteQuestion } from '../noteQuiz';

function configuration(props) {
  return JSON.stringify([
    props.startFret, props.fretCount,
    props.strings.map(string => [string.id, string.pitch]),
  ]);
}

export default class NoteQuiz extends Component {
  state = {
    question: createNoteQuestion(this.props.strings, this.props.startFret, this.props.fretCount),
    answer: null,
    correct: 0,
    answered: 0,
  };
  nextQuestionTimer = null;
  answerLocked = false;
  answers = React.createRef();

  componentDidMount() {
    this.revealAnswers();
  }

  componentDidUpdate(previousProps) {
    if (configuration(previousProps) !== configuration(this.props)) {
      this.nextQuestion();
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.nextQuestionTimer);
  }

  revealAnswers = () => {
    if (!this.answers.current || window.innerWidth > 640) return;
    const overflow = this.answers.current.getBoundingClientRect().bottom - window.innerHeight;
    if (overflow > 0) window.scrollBy(0, overflow + 12);
  };

  nextQuestion = () => {
    window.clearTimeout(this.nextQuestionTimer);
    this.nextQuestionTimer = null;
    const { strings, startFret, fretCount } = this.props;
    this.setState(state => ({
      question: createNoteQuestion(strings, startFret, fretCount, state.question && state.question.position),
      answer: null,
    }), () => { this.answerLocked = false; });
  };

  chooseAnswer = note => {
    const { question } = this.state;
    if (this.answerLocked || !question || !question.options.includes(note)) return;
    this.answerLocked = true;
    this.setState(state => ({
      answer: note,
      correct: state.correct + (note === question.position.note ? 1 : 0),
      answered: state.answered + 1,
    }), this.revealAnswers);
    this.nextQuestionTimer = window.setTimeout(this.nextQuestion, 1000);
  };

  render() {
    const { strings, startFret, fretCount, onTuningChange } = this.props;
    const { question, answer, correct, answered } = this.state;
    const result = answer === null ? null : answer === question.position.note ? 'correct' : 'wrong';
    const location = question && `String ${question.position.stringIndex + 1}, ${question.position.fret === 0 ? 'open string' : `fret ${question.position.fret}`}`;

    return (
      <section className="noteQuiz" aria-label="Fretboard note game">
        <div className="quizHeader">
          <div>
            <h2>Name that note</h2>
            <p>Tap a note. Next question in 1 second.</p>
          </div>
          <p className="quizScore"><strong>{correct} / {answered}</strong> correct</p>
        </div>
        {question ? <React.Fragment>
          <p className="quizLocation">{location}</p>
          <Fretboard
            strings={strings}
            startFret={startFret}
            fretCount={fretCount}
            notesInScale={[]}
            quiz={{ position: question.position, result }}
            onTuningChange={onTuningChange}
          />
          <div className="quizAnswers" ref={this.answers}>
            <div className="quizOptions" role="group" aria-label="Choose the note">
              {question.options.map(note => {
                const optionResult = answer === null ? '' : note === question.position.note ? ' quizAnswerCorrect' : note === answer ? ' quizAnswerWrong' : '';
                return (
                  <button
                    key={note}
                    type="button"
                    className={`quizAnswer${optionResult}`}
                    aria-label={`${note.toUpperCase()}${optionResult ? note === question.position.note ? ', correct answer' : ', incorrect answer' : ''}`}
                    aria-disabled={answer !== null}
                    onClick={() => this.chooseAnswer(note)}
                  >
                    {note.toUpperCase()}
                  </button>
                );
              })}
            </div>
            <p className={`quizFeedback${result ? ` quizFeedback${result === 'correct' ? 'Correct' : 'Wrong'}` : ''}`} role="status" aria-live="polite" aria-atomic="true">
              {result === 'correct' ? `Correct! ${question.position.note.toUpperCase()}.` : result === 'wrong' ? `Incorrect. The note is ${question.position.note.toUpperCase()}.` : 'Which note is it?'}
            </p>
          </div>
        </React.Fragment> : <p className="emptyBoard">Add a string above to start the note game.</p>}
      </section>
    );
  }
}
