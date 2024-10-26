import { getData } from '@/dataStore';
import { QuizSession, Player } from '@/models/Classes';
import { QuizSessionState } from '@/models/Enums';
import { ERROR_MESSAGES } from '@/utils/errors';
import { findQuizSessionById, getNewID, getRandomName, isPlayerNameUnique } from '@/utils/helper';
import { HttpError } from '@/utils/HttpError';
import { EmptyObject } from '@/models/Types';
import { find } from '@/utils/helper';

export function PlayerJoinSession(sessionId: number, name: string): { playerId: number } {
  if (!isPlayerNameUnique(name, sessionId)) {
    throw new HttpError(400, ERROR_MESSAGES.PLAYER_NAME_ALREADY_USED);
  }

  const quizSession: QuizSession = findQuizSessionById(sessionId);

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
    throw new Error('Player not found');
  }

  // Session is not in QUESTION_OPEN state
  const quizSession = find.quizSession(player.quizSessionId);
  if (!quizSession) {
    throw new Error('Quiz session not found');
  }

  if (quizSession.state() !== QuizSessionState.QUESTION_OPEN) {
    throw new Error('Quiz session is not in QUESTION_OPEN state');
  }

  // If question position is not valid for the session this player is in
  if (questionPosition <= 0 || questionPosition > quizSession.metadata.questions.length) {
    throw new Error('Question position is out of range');
  }

  // If session is not currently on this question
  if (quizSession.atQuestion !== questionPosition) {
    throw new Error('Session is not currently on this question');
  }

  // Answer IDs are not valid for this particular question
  const question = quizSession.metadata.questions[questionPosition - 1];
  if (!question.getAnswersSlice().some(a => answerIds.includes(a.answerId))) {
    throw new Error('Answer IDs not exist in this particular question');
  }

  // There are duplicate answer IDs provided
  const answerIdsSet = new Set(answerIds);
  if (answerIds.length !== answerIdsSet.size) {
    throw new Error('Duplicate answer IDs provided');
  }

  // Less than 1 answer ID was submitted
  if (answerIds.length < 1) {
    throw new Error('No answer IDs provided');
  }

  // Calculate time spent
  const timeSpent = Math.floor(Date.now() / 1000) - quizSession.timeCurrentQuestionStarted;

  // Check if user is wrong, if user submit any answer that is not correct
  const userIsWrong = question.getAnswersSlice().some(a => answerIdsSet.has(a.answerId) && (!a.correct));

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