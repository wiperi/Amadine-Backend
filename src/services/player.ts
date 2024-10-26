import { getData } from '@/dataStore';
import { QuizSession, Player, Message } from '@/models/Classes';
import { QuizSessionState } from '@/models/Enums';
import { EmptyObject } from '@/models/Types';
import { ERROR_MESSAGES } from '@/utils/errors';
import {
  findQuizById,
  findQuizSessionById,
  getNewID,
  getRandomName,
  isPlayerNameUnique,
  find,
  isValidEmail,
  isValidMessageBody
} from '@/utils/helper';
import { HttpError } from '@/utils/HttpError';

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

export function PlayerGetQuestionInfo(
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
  const player = getData().players.find(player => player.playerId === playerId);
  if (!player) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_PLAYER_ID);
  }
  // If question position is not valid for the session this player is in
  const quizSession = getData().quizSessions.find(
    quizSession => quizSession.sessionId === player.quizSessionId
  );
  const quizId = quizSession.quizId;
  const quiz = findQuizById(quizId);
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

export function playerPostMessage(playerId: number, message: string): EmptyObject {
  const player = find.player(playerId);
  if (!player) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_PLAYER_ID);
  }

  if (!isValidMessageBody(message)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_MESSAGE_BODY);
  }

  const quizSession = find.quizSession(player.quizSessionId);

  const msg: Message = new Message(playerId, player.name, message);

  quizSession.messages.push(msg);

  return {};
}
