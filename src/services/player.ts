import { getData } from '@/dataStore';
import { QuizSession, Player, Message } from '@/models/Classes';
import { QuizSessionState } from '@/models/Enums';
import { EmptyObject, MessagesReturned, QuestionResultReturned } from '@/models/Types';
import { ERROR_MESSAGES } from '@/utils/errors';
import { getNewID, getRandomName, isPlayerNameUnique } from '@/utils/helper';
import { HttpError } from '@/utils/HttpError';
import { find, isValidMessageBody } from '@/utils/helper';
import errMessages from '@/utils/errorsV2';

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
    throw new HttpError(400, errMessages.player.notFound(playerId));
  }

  // Session is not in QUESTION_OPEN state
  const quizSession = find.quizSession(player.quizSessionId);
  if (!quizSession) {
    throw new HttpError(400, errMessages.quizSession.notFound(player.quizSessionId));
  }

  if (quizSession.state() !== QuizSessionState.QUESTION_OPEN) {
    throw new HttpError(400, errMessages.quizSession.questionNotOpen);
  }

  // If question position is not valid for the session this player is in
  if (questionPosition <= 0 || questionPosition > quizSession.metadata.questions.length) {
    throw new HttpError(
      400,
      errMessages.quizSession.invalidPosition(
        questionPosition,
        1,
        quizSession.metadata.questions.length
      )
    );
  }

  // If session is not currently on this question
  if (quizSession.atQuestion !== questionPosition) {
    throw new HttpError(
      400,
      errMessages.quizSession.questionNotCurrent(questionPosition, quizSession.atQuestion)
    );
  }

  // Answer IDs are not valid for this particular question
  const questionIndex = questionPosition - 1;
  const question = quizSession.metadata.questions[questionIndex];
  if (!question.getAnswersSlice().some(a => answerIds.includes(a.answerId))) {
    throw new HttpError(400, errMessages.question.answerIdsInvalid);
  }

  // There are duplicate answer IDs provided
  const answerIdsSet = new Set(answerIds);
  if (answerIds.length !== answerIdsSet.size) {
    throw new HttpError(400, errMessages.question.duplicateAnswerIds);
  }

  // Less than 1 answer ID was submitted
  if (answerIds.length < 1) {
    throw new HttpError(400, errMessages.question.emptyAnswerIds);
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

export function playerPostMessage(playerId: number, message: string): EmptyObject {
  const player = find.player(playerId);
  if (!player) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_PLAYER_ID);
  }

  if (!isValidMessageBody(message)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_MESSAGE_BODY);
  }

  const quizSession = find.quizSession(player.quizSessionId);

  const msg = new Message(playerId, player.name, message);

  quizSession.messages.push(msg);

  return {};
}

export function playerGetMessage(playerId: number): { messages: MessagesReturned[] } {
  const player = find.player(playerId);
  if (!player) {
    throw new HttpError(400, ERROR_MESSAGES.PLAYER_NOT_FOUND);
  }

  const quizSession = find.quizSession(player.quizSessionId);
  const messages = quizSession.messages;
  messages.sort((a, b) => a.timeSent - b.timeSent);
  return {
    messages: messages.map(m => ({
      messageBody: m.messageBody,
      playerId: m.playerId,
      playerName: m.playerName,
      timeSent: m.timeSent,
    })),
  };
}

export function playerGetQuestionResult(
  playerId: number,
  questionPosition: number
): QuestionResultReturned {
  // If player ID does not exist
  const player = find.player(playerId);
  if (!player) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_PLAYER_ID);
  }
  // If question position is not valid for the session this player is in
  const quizSession = find.quizSession(player.quizSessionId);
  if (questionPosition <= 0 || questionPosition > quizSession.metadata.questions.length) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_POSITION);
  }
  // Session is not in ANSWER_SHOW state
  if (quizSession.state() !== QuizSessionState.ANSWER_SHOW) {
    throw new HttpError(400, ERROR_MESSAGES.SESSION_STATE_INVALID);
  }
  // If session is not currently on this question
  if (quizSession.atQuestion !== questionPosition) {
    throw new HttpError(400, ERROR_MESSAGES.SAME_POSITION);
  }

  const data = getData();
  const questionIndex = questionPosition - 1;
  const question = quizSession.metadata.questions[questionIndex];
  const questionId = question.questionId;

  const players = data.players.filter(p => p.quizSessionId === player.quizSessionId);

  const playersCorrectList = players
    .filter(p => p.submits.some(s => s.questionId === questionId && s.isRight))
    .map(p => p.name);

  const averageAnswerTime =
    players.reduce(
      (acc, p) => acc + p.submits.find(s => s.questionId === questionId)?.timeSpent,
      0
    ) / players.length;
  const percentCorrect = playersCorrectList.length / players.length;

  return {
    questionId,
    playersCorrectList,
    averageAnswerTime,
    percentCorrect,
  };
}
