import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import NoteQuiz from './NoteQuiz';

describe('note game', () => {
  let container;
  let quiz;
  let originalMatchMedia;
  const props = {
    strings: [{ id: 0, pitch: 64 }],
    startFret: 1,
    fretCount: 5,
    onTuningChange: () => {},
  };
  const answerButton = note => Array.from(container.querySelectorAll('.quizAnswer')).find(button => button.textContent === note.toUpperCase());
  const target = () => container.querySelector('[data-quiz-target="true"]');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    originalMatchMedia = window.matchMedia;
    window.matchMedia = () => ({ matches: true });
    container = document.createElement('div');
    document.body.appendChild(container);
    quiz = ReactDOM.render(<NoteQuiz {...props} />, container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    Math.random.mockRestore();
    window.matchMedia = originalMatchMedia;
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('starts with one blank marker and no exposed fretboard note names', () => {
    expect(container.querySelectorAll('[data-quiz-target="true"]')).toHaveLength(1);
    expect(target().textContent).toBe('');
    expect(target().getAttribute('aria-label')).toBe('String 1, open, note to identify');
    expect(container.querySelectorAll('.quizAnswer')).toHaveLength(4);
    expect(container.querySelector('.practiceControls')).toBe(null);
    expect(container.querySelector('.quizFretboard').textContent).not.toMatch(/[a-g]/i);
  });

  it('shows green feedback, blocks repeat taps, and advances at exactly one second', () => {
    const initialLocation = container.querySelector('.quizLocation').textContent;
    Simulate.click(answerButton('e'));
    expect(target().className).toContain('quizTargetCorrect');
    expect(target().textContent).toBe('e');
    expect(answerButton('e').className).toContain('quizAnswerCorrect');
    expect(container.querySelector('.quizFeedback').textContent).toBe('Correct! E.');
    Simulate.click(answerButton('e'));
    expect(container.querySelector('.quizScore').textContent).toBe('1 / 1 correct');
    jest.runTimersToTime(999);
    expect(container.querySelector('.quizLocation').textContent).toBe(initialLocation);
    jest.runTimersToTime(1);
    expect(container.querySelector('.quizLocation').textContent).not.toBe(initialLocation);
    expect(target().textContent).toBe('');
    expect(container.querySelectorAll('.quizAnswer[aria-disabled="false"]')).toHaveLength(4);
  });

  it('shows the wrong choice in red and reveals the correct answer before advancing', () => {
    const wrongNote = quiz.state.question.options.find(note => note !== 'e');
    Simulate.click(answerButton(wrongNote));
    expect(target().className).toContain('quizTargetWrong');
    expect(target().textContent).toBe('e');
    expect(answerButton(wrongNote).className).toContain('quizAnswerWrong');
    expect(answerButton('e').className).toContain('quizAnswerCorrect');
    expect(container.querySelector('.quizFeedback').textContent).toBe('Incorrect. The note is E.');
    Simulate.click(answerButton('e'));
    expect(container.querySelector('.quizScore').textContent).toBe('0 / 1 correct');
    jest.runTimersToTime(1000);
    expect(target().textContent).toBe('');
    expect(container.querySelector('.quizFeedback').textContent).toBe('Which note is it?');
  });

  it('cancels pending feedback when the tuning or fret window changes', () => {
    Simulate.click(answerButton('e'));
    jest.runTimersToTime(500);
    ReactDOM.render(<NoteQuiz {...props} strings={[{ id: 0, pitch: 62 }]} startFret={8} />, container);
    expect(target().textContent).toBe('');
    const newLocation = container.querySelector('.quizLocation').textContent;
    jest.runTimersToTime(1000);
    expect(container.querySelector('.quizLocation').textContent).toBe(newLocation);
    expect(quiz.state.question.position.note).toBe('a#');
    expect(container.querySelector('.quizScore').textContent).toBe('1 / 1 correct');
  });

  it('handles removing and restoring all strings during feedback', () => {
    Simulate.click(answerButton('e'));
    ReactDOM.render(<NoteQuiz {...props} strings={[]} />, container);
    expect(container.querySelector('.quizAnswer')).toBe(null);
    expect(container.textContent).toContain('Add a string above');
    jest.runTimersToTime(1000);
    ReactDOM.render(<NoteQuiz {...props} />, container);
    expect(target().textContent).toBe('');
    expect(container.querySelectorAll('.quizAnswer')).toHaveLength(4);
  });

  it('cleans up the automatic advance when leaving the game', () => {
    Simulate.click(answerButton('e'));
    const timer = quiz.nextQuestionTimer;
    const clearTimeout = jest.spyOn(window, 'clearTimeout');
    ReactDOM.unmountComponentAtNode(container);
    expect(clearTimeout).toHaveBeenCalledWith(timer);
    clearTimeout.mockRestore();
  });
});
