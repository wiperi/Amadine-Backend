import { getData, setData } from '@/dataStore';
import { HttpError } from '@/utils/HttpError';
import { Quiz, Question, Answer, QuizSession } from '@/models/Classes';
import {
  ReturnedQuizView,
  EmptyObject,
  ParamQuestionBody,
  ParamQuestionBodyV2,
  QuizReturnedV2,
  QuizReturned,
} from '@/models/Types';
import { ERROR_MESSAGES } from '@/utils/errors';
import {
  getNewID,
  isQuizIdOwnedByUser,
  isValidQuizId,
  findQuizById,
  isValidQuizName,
  isValidQuizDescription,
  recursiveFind,
  getInactiveQuizSession,
  getActiveQuizSession,
  isValidImgUrl,
  isQuizHasOngoingSessions,
  removeProperties,
} from '@/utils/helper';
import { PlayerAction, QuizSessionState } from '@/models/Enums';

/**
 * Update the description of the relevant quiz.
 */
export function adminQuizDescriptionUpdate(
  authUserId: number,
  quizId: number,
  description: string
): EmptyObject {
  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }
  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  if (!isValidQuizDescription(description)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_DESCRIPTION);
  }

  const quiz = findQuizById(quizId);
  quiz.description = description;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();

  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 */
export function adminQuizInfo(
  authUserId: number,
  quizId: number
): QuizReturned {
  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const quiz = findQuizById(quizId);

  const returnedQuestions = quiz.questions.map(question => ({
    ...removeProperties(question, 'thumbnailUrl'),
    answers: question.getAnswersSlice(),
  }));

  const res = removeProperties(quiz, 'thumbnailUrl', 'questions', 'active', 'authUserId');

  return {
    ...res,
    questions: returnedQuestions,
    duration: quiz.duration(),
    numQuestions: quiz.questions.length,
  };
}

/**
 * Update the name of the relevant quiz.
 */
export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): EmptyObject {
  if (!isValidQuizName(authUserId, name, quizId)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_NAME);
  }

  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const quiz = findQuizById(quizId);
  quiz.name = name;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();

  return {};
}

/**
 * Creates a new quiz if the provided user ID, name, and description are valid.
 */
export function adminQuizCreate(
  authUserId: number,
  name: string,
  description: string
): { quizId: number } {
  if (!isValidQuizName(authUserId, name, undefined)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_NAME);
  }
  if (!isValidQuizDescription(description)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_DESCRIPTION);
  }
  const quizId = getNewID('quiz');
  const data = getData();
  data.quizzes.push(new Quiz(authUserId, quizId, name, description));
  setData(data);
  return {
    quizId: quizId,
  };
}

/**
 * Retrieves a list of quizzes created by a specific authenticated user,
 * if the user ID is valid. The quizzes are returned with their IDs and names.
 */
export function adminQuizList(authUserId: number): { quizzes: ReturnedQuizView[] } {
  const quizzes = getData()
    .quizzes.filter(quiz => quiz.authUserId === authUserId && quiz.active)
    .map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name,
    }));

  return { quizzes: quizzes };
}

/**
 * Make a quiz be inactive if the user is the owner
 * Return an empty object if succeed
 */
export function adminQuizRemove(authUserId: number, quizId: number): EmptyObject {
  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const quiz = findQuizById(quizId);
  quiz.active = false;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();

  return {};
}

export function adminQuizTrashView(authUserId: number): { quizzes: ReturnedQuizView[] } {
  const trash: ReturnedQuizView[] = getData()
    .quizzes.filter(quiz => quiz.authUserId === authUserId && !quiz.active)
    .map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name,
    }));

  return { quizzes: trash };
}

export function adminQuizRestore(authUserId: number, quizId: number): EmptyObject {
  const quiz = findQuizById(quizId);
  if (!quiz) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }
  if (quiz.authUserId !== authUserId) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }
  if (quiz.active) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isValidQuizName(authUserId, quiz.name, undefined)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_NAME);
  }
  quiz.active = true;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();
  return {};
}

export function adminQuizTrashEmpty(authUserId: number, quizIds: number[]): EmptyObject {
  const data = getData();

  for (const quizId of quizIds) {
    const quiz = findQuizById(quizId);
    if (!quiz) {
      throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
    }
    if (quiz.authUserId !== authUserId) {
      throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
    }
    if (quiz.active) {
      throw new HttpError(400, ERROR_MESSAGES.INVALID_QUIZ_ID);
    }
  }

  data.quizzes = data.quizzes.filter(quiz => !quizIds.includes(quiz.quizId));
  setData(data);

  return {};
}

export function adminQuizTransfer(
  authUserId: number,
  quizId: number,
  userEmail: string
): EmptyObject {
  // TODO: Implement this function
  // const newAuthUserId = data.users.find(user => user.email === userEmail).userId;
  // findQuizById(quizId).authUserId = newAuthUserId;
  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }
  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }
  const data = getData();
  const targetuser = data.users.find(user => user.email === userEmail);
  if (!targetuser) {
    throw new HttpError(400, ERROR_MESSAGES.EMAIL_NOT_EXIST);
  }
  if (targetuser.userId === authUserId) {
    throw new HttpError(400, ERROR_MESSAGES.USED_EMAIL);
  }
  const quiz = findQuizById(quizId);
  const hasSameName = data.quizzes.some(
    q => q.authUserId === targetuser.userId && q.name === quiz.name
  );
  if (hasSameName) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_NAME_CONFLICT);
  }
  quiz.authUserId = targetuser.userId;
  setData(data);
  return {};
}

export function adminQuizQuestionCreate(
  authUserId: number,
  quizId: number,
  questionBody: ParamQuestionBody
): { questionId: number } {
  // TODO: extract questionBody check to a helper function

  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }
  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.duration <= 0) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  const quiz = findQuizById(quizId);
  if (
    quiz.questions.reduce((acc, question) => acc + question.duration, 0) + questionBody.duration >
    180
  ) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  // check duplicate answer
  const answerSet = new Set();
  for (const answer of questionBody.answers) {
    if (answerSet.has(answer.answer)) {
      throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
    }
    answerSet.add(answer.answer);
  }
  if (!questionBody.answers.some(answer => answer.correct)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }

  // Generate a new question ID
  const questionId = getNewID('question');

  // Create the Question instance with answers
  const question = new Question(
    questionId,
    questionBody.question,
    questionBody.duration,
    questionBody.points,
    questionBody.answers.map(
      answer => new Answer(getNewID('answer'), answer.answer, answer.correct)
    )
  );

  quiz.questions.push(question);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();

  return { questionId: questionId };
}

export function adminQuizQuestionUpdate(
  authUserId: number,
  quizId: number,
  questionId: number,
  questionBody: ParamQuestionBody
): EmptyObject {
  if (recursiveFind(questionBody, undefined)) {
    throw new HttpError(403, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
  }

  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const quiz = findQuizById(quizId);

  const question = quiz.questions.find(q => q.questionId === questionId);
  if (!question) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION_ID);
  }
  // TODO: Implement this helper function
  // if (!isValidQuestion(questionBody)) {};
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.duration <= 0) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  const answerSet = new Set();
  for (const answer of questionBody.answers) {
    if (answerSet.has(answer.answer)) {
      throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
    }
    answerSet.add(answer.answer);
  }
  if (!questionBody.answers.some(answer => answer.correct)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  const totalDuration = quiz.questions.reduce((accumulator, question) => {
    if (question.questionId === questionId) {
      return accumulator + questionBody.duration;
    }
    return accumulator + question.duration;
  }, 0);

  if (totalDuration > 180) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_DURATION);
  }
  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.points = questionBody.points;

  question.setAnswers(
    questionBody.answers.map(
      answer => new Answer(getNewID('answer'), answer.answer, answer.correct)
    )
  );
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();

  return {};
}

export function adminQuizQuestionDelete(
  authUserId: number,
  quizId: number,
  questionId: number
): EmptyObject {
  const quiz = findQuizById(quizId);
  if (!quiz || !quiz.active) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (quiz.authUserId !== authUserId) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  if (!question) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION_ID);
  }
  const currentPosition = quiz.questions.indexOf(question);
  quiz.questions.splice(currentPosition, 1);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();
  return {};
}

export function adminQuizQuestionMove(
  authUserId: number,
  quizId: number,
  questionId: number,
  newPosition: number
): EmptyObject {
  const quiz = findQuizById(quizId);
  if (!quiz) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (quiz.authUserId !== authUserId) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  if (newPosition < 0 || newPosition > quiz.questions.length - 1) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_POSITION);
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  const currentPosition = quiz.questions.indexOf(question);

  if (!question) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION_ID);
  }

  if (currentPosition === newPosition) {
    throw new HttpError(400, ERROR_MESSAGES.SAME_POSITION);
  }

  quiz.questions.splice(currentPosition, 1);
  quiz.questions.splice(newPosition, 0, question);

  return {};
}

export function adminQuizQuestionDuplicate(
  authUserId: number,
  quizId: number,
  questionId: number
): { newQuestionId: number } {
  const quiz = findQuizById(quizId);
  if (!quiz || !quiz.active) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (quiz.authUserId !== authUserId) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  if (!question) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION_ID);
  }

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  const newQuestionId = getNewID('question');
  const questions = findQuizById(quizId).questions;

  const newQuestion = Object.assign(
    {},
    questions.find(q => q.questionId === questionId),
    { questionId: newQuestionId }
  );
  Object.setPrototypeOf(newQuestion, Question.prototype);
  questions.splice(1 + questions.findIndex(q => q.questionId === questionId), 0, newQuestion);

  return { newQuestionId: newQuestionId };
}

export function adminQuizSessionUpdate(
  authUserId: number,
  quizId: number,
  sessionId: number,
  action: string
): EmptyObject {
  const data = getData();

  // Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist
  const quiz = findQuizById(quizId);
  if (!quiz) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!quiz.active) {
    throw new HttpError(403, ERROR_MESSAGES.QUIZ_INACTIVE);
  }

  if (quiz.authUserId !== authUserId) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  // Session Id does not refer to a valid session within this quiz
  const session = data.quizSessions.find(session => session.sessionId === sessionId);
  if (!session) {
    throw new HttpError(403, ERROR_MESSAGES.QUIZ_SESSION_NOT_EXIST);
  }

  if (session.quizId !== quizId) {
    throw new HttpError(403, ERROR_MESSAGES.QUIZ_SESSION_NOT_IN_QUIZ);
  }

  // Action provided is not a valid Action enum
  if (!(action in PlayerAction)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_ACTION);
  }

  // Action enum cannot be applied in the current state (see spec for details)
  try {
    session.dispatch(action as PlayerAction);
  } catch (error) {
    throw new HttpError(400, error.message);
  }

  return {};
}

export function adminQuizSessionStart(
  authUserId: number,
  quizId: number,
  autoStartNum: number
): { newSessionId: number } {
  const data = getData();
  const quiz = findQuizById(quizId);
  if (!quiz) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }
  if (quiz.authUserId !== authUserId) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }
  if (autoStartNum > 50 || autoStartNum < 0) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_AUTO_START_NUM);
  }
  if (quiz.questions.length === 0) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_NO_QUESTIONS);
  }
  if (!quiz.active) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_INACTIVE);
  }
  const activeSessions = data.quizSessions.filter(
    s => s.quizId === quizId && s.state() !== QuizSessionState.END
  );
  if (activeSessions.length >= 10) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_TOO_MANY_SESSIONS);
  }

  const newSessionId = getNewID('quiz session');
  const newSession = new QuizSession(newSessionId, quiz, autoStartNum);

  data.quizSessions.push(newSession);
  if (autoStartNum === 0) {
    newSession.dispatch(PlayerAction.NEXT_QUESTION);
  }
  setData(data);

  return { newSessionId: newSessionId };
}

export function adminQuizSessionsActivity(
  authUserId: number,
  quizId: number
): {
  activeSessions: number[];
  inactiveSessions: number[];
} {
  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const activeSessions = getActiveQuizSession(quizId);
  const inactiveSessions = getInactiveQuizSession(quizId);
  return {
    activeSessions,
    inactiveSessions,
  };
}

export function adminQuizSessionGetStatus(
  authUserId: number,
  quizId: number,
  quizSessionId: number
): { state: QuizSessionState; atQuestion: number; players: string[]; metadata: QuizReturnedV2 } {
  const data = getData();
  const quiz = findQuizById(quizId);
  if (!quiz) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }
  if (quiz.authUserId !== authUserId) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }
  const quizSession = data.quizSessions.find(s => s.sessionId === quizSessionId);
  if (!quizSession) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_SESSION_ID);
  }
  const players = data.players.filter(player => player.quizSessionId === quizSessionId);
  const playerNames = players.map(player => player.name);
  // metadata should be deep copied without active and authUserId
  const metadata = removeProperties(quiz, 'active', 'authUserId');

  return {
    state: quizSession.state(),
    atQuestion: quizSession.atQuestion,
    players: playerNames,
    metadata: {
      ...metadata,
      numQuestions: quiz.questions.length,
      duration: quiz.duration(),
      questions: quiz.questions.map(question => ({
        ...question,
        answers: question.getAnswersSlice(),
      })),
    },
  };
}

export function adminQuizInfoV2(
  authUserId: number,
  quizId: number
): QuizReturnedV2 {
  const quiz = findQuizById(quizId);

  const returnedQuestions = quiz.questions.map(question => ({
    ...question,
    answers: question.getAnswersSlice(),
  }));

  const res = {
    ...adminQuizInfo(authUserId, quizId),
    questions: returnedQuestions,
    thumbnailUrl: quiz.thumbnailUrl,
  };

  return res;
}

/**
 * Make a quiz be inactive if the user is the owner
 * Return an empty object if succeed
 */
export function adminQuizRemoveV2(authUserId: number, quizId: number): EmptyObject {
  if (isQuizHasOngoingSessions(quizId)) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_NOT_IN_END_STATE);
  }

  return adminQuizRemove(authUserId, quizId);
}

export function adminQuizTransferV2(
  authUserId: number,
  quizId: number,
  userEmail: string
): EmptyObject {
  if (isQuizHasOngoingSessions(quizId)) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_NOT_IN_END_STATE);
  }

  return adminQuizTransfer(authUserId, quizId, userEmail);
}

export function adminQuizQuestionCreateV2(
  authUserId: number,
  quizId: number,
  questionBody: ParamQuestionBodyV2
): { questionId: number } {
  // TODO: extract questionBody check to a helper function

  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }
  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.duration <= 0) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  const quiz = findQuizById(quizId);
  if (
    quiz.questions.reduce((acc, question) => acc + question.duration, 0) + questionBody.duration >
    180
  ) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  // check duplicate answer
  const answerSet = new Set();
  for (const answer of questionBody.answers) {
    if (answerSet.has(answer.answer)) {
      throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
    }
    answerSet.add(answer.answer);
  }
  if (!questionBody.answers.some(answer => answer.correct)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }

  if (!questionBody.thumbnailUrl || !isValidImgUrl(questionBody.thumbnailUrl)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_URL);
  }

  // Generate a new question ID
  const questionId = getNewID('question');

  // Create the Question instance with answers
  const question = new Question(
    questionId,
    questionBody.question,
    questionBody.duration,
    questionBody.points,
    questionBody.answers.map(
      answer => new Answer(getNewID('answer'), answer.answer, answer.correct)
    ),
    questionBody.thumbnailUrl
  );

  quiz.questions.push(question);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();

  return { questionId: questionId };
}

export function adminQuizQuestionUpdateV2(
  authUserId: number,
  quizId: number,
  questionId: number,
  questionBody: ParamQuestionBodyV2
): EmptyObject {
  if (recursiveFind(questionBody, undefined)) {
    throw new HttpError(403, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
  }

  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const quiz = findQuizById(quizId);

  const question = quiz.questions.find(q => q.questionId === questionId);
  if (!question) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION_ID);
  }
  // TODO: Implement this helper function
  // if (!isValidQuestion(questionBody)) {};
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.duration <= 0) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  const answerSet = new Set();
  for (const answer of questionBody.answers) {
    if (answerSet.has(answer.answer)) {
      throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
    }
    answerSet.add(answer.answer);
  }
  if (!questionBody.answers.some(answer => answer.correct)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  const totalDuration = quiz.questions.reduce((accumulator, question) => {
    if (question.questionId === questionId) {
      return accumulator + questionBody.duration;
    }
    return accumulator + question.duration;
  }, 0);

  if (totalDuration > 180) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_DURATION);
  }

  if (!questionBody.thumbnailUrl || !isValidImgUrl(questionBody.thumbnailUrl)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_URL);
  }

  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.thumbnailUrl = questionBody.thumbnailUrl;
  question.points = questionBody.points;

  question.setAnswers(
    questionBody.answers.map(
      answer => new Answer(getNewID('answer'), answer.answer, answer.correct)
    )
  );
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();

  return {};
}

export function adminQuizQuestionDeleteV2(
  authUserId: number,
  quizId: number,
  questionId: number
): EmptyObject {
  if (!isQuizHasOngoingSessions(quizId)) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_NOT_IN_END_STATE);
  }

  return adminQuizQuestionDelete(authUserId, quizId, questionId);
}

export function adminQuizThumbnail(
  quizId: number,
  authUserId: number,
  imgUrl: string
): EmptyObject {
  if (!isValidImgUrl(imgUrl)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_URL);
  }

  const quiz = findQuizById(quizId);
  if (!quiz) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }
  if (quiz.authUserId !== authUserId) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.thumbnailUrl = imgUrl;
  setData();
  return {};
}
