import { getData } from '@/dataStore';
import { QuizSession, Player } from '@/models/Classes';
import { QuizSessionState } from '@/models/Enums';
import { ERROR_MESSAGES } from '@/utils/errors';
import { getNewID, getRandomName, isPlayerNameUnique } from '@/utils/helper';
import { HttpError } from '@/utils/HttpError';
import { EmptyObject } from '@/models/Types';
import { find } from '@/utils/helper';

export function PlayerJoinSession(sessionId: number, name: string): { playerId: number } {
  if (!isPlayerNameUnique(name, sessionId)) {
    throw new HttpError(400, ERROR_MESSAGES.PLAYER_NAME_ALREADY_USED);
  }

  const quizSession: QuizSession = find.quizSession(sessionId);

  if (!quizSession) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_SESSION_ID);
  }

  if (quizSession.state() !== QuizSessionState.LOBBY) {
    throw new HttpError(400, ERROR_MESSAGES.SESSION_NOT_IN_LOBBY_STATE);
  }

  // if name is empty, then generated with the structure 5letters + 3numbers
  if (!name) {
    name = getRandomName();
  }

  const playerId: number = getNewID('player');

  const player: Player = new Player(playerId, sessionId, name);

  getData().players.push(player);

  return { playerId: playerId };
}

export function adminPlayerSubmitAnswers(
  playerId: number,
  questionPosition: number,
  answerIds: number[]
): EmptyObject {
  // If player ID does not exist
  const player = find.player(playerId);
  if (!player) {
    throw new HttpError(400, 'Player not found');
  }

  // Session is not in QUESTION_OPEN state
  const quizSession = find.quizSession(player.quizSessionId);
  if (!quizSession) {
    throw new HttpError(400, 'Quiz session not found');
  }

  if (quizSession.state() !== QuizSessionState.QUESTION_OPEN) {
    throw new HttpError(400, 'Quiz session is not in QUESTION_OPEN state');
  }

  // If question position is not valid for the session this player is in
  if (questionPosition <= 0 || questionPosition > quizSession.metadata.questions.length) {
    throw new HttpError(400, 'Question position is out of range');
  }

  // If session is not currently on this question
  if (quizSession.atQuestion !== questionPosition) {
    throw new HttpError(400, 'Session is not currently on this question');
  }

  // Answer IDs are not valid for this particular question
  const question = quizSession.metadata.questions[questionPosition - 1];
  if (!question.getAnswersSlice().some(a => answerIds.includes(a.answerId))) {
    throw new HttpError(400, 'Answer IDs not exist in this particular question');
  }

  // There are duplicate answer IDs provided
  const answerIdsSet = new Set(answerIds);
  if (answerIds.length !== answerIdsSet.size) {
    throw new HttpError(400, 'Duplicate answer IDs provided');
  }

  // Less than 1 answer ID was submitted
  if (answerIds.length < 1) {
    throw new HttpError(400, 'No answer IDs provided');
  }

  // Calculate time spent
  const timeSpent = Math.floor(Date.now() / 1000) - quizSession.timeCurrentQuestionStarted;

  // Check if user is wrong, if user submit any answer that is not correct
  const userIsWrong = question
    .getAnswersSlice()
    .some(a => answerIdsSet.has(a.answerId) && !a.correct);

  const submit = player.submits.find(s => s.questionId === question.questionId);

  if (!submit) {
    player.submits.push({
      questionId: question.questionId,
      answerIds,
      timeSpent,
      isRight: !userIsWrong,
    });
  } else {
    submit.answerIds = answerIds;
    submit.timeSpent = timeSpent;
    submit.isRight = !userIsWrong;
  }

  // Update player's total score
  player.totalScore += !userIsWrong ? question.points : 0;

  return {};
}

export function playerGetQuestionInfo(
  playerId: number,
  questionPosition: number
): {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: Pick<
    { answerId: number; answer: string; colour: string },
    'answerId' | 'answer' | 'colour'
  >[];
} {
  // if player id not found
  const player = find.player(playerId);
  if (!player) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_PLAYER_ID);
  }
  // If question position is not valid for the session this player is in
  const quizSession = find.quizSession(player.quizSessionId);
  const quizId = quizSession.quizId;
  const quiz = find.quiz(quizId);
  if (questionPosition < 0 || questionPosition > quiz.questions.length) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_POSITION);
  }

  if (quizSession.atQuestion !== questionPosition) {
    throw new HttpError(400, ERROR_MESSAGES.SAME_POSITION);
  }

  // Session is in LOBBY, QUESTION_COUNTDOWN, FINAL_RESULTS or END state
  const quizSessionState = quizSession.state();
  if (
    quizSessionState === QuizSessionState.LOBBY ||
    quizSessionState === QuizSessionState.QUESTION_COUNTDOWN ||
    quizSessionState === QuizSessionState.FINAL_RESULTS ||
    quizSessionState === QuizSessionState.END
  ) {
    throw new HttpError(400, ERROR_MESSAGES.SESSION_STATE_INVALID);
  }

  const returnedQuestions = quiz.questions[questionPosition - 1];
  const returnedAnswers = returnedQuestions.getAnswersSlice();
  // we don't want to return the correct key
  returnedAnswers.forEach(answer => {
    delete answer.correct;
  });

  return {
    questionId: returnedQuestions.questionId,
    question: returnedQuestions.question,
    duration: returnedQuestions.duration,
    thumbnailUrl: returnedQuestions.thumbnailUrl,
    points: returnedQuestions.points,
    answers: returnedAnswers,
  };
}
