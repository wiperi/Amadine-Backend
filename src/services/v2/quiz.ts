import { getData, setData } from '@/dataStore';
import { HttpError } from '@/utils/HttpError';
import { Question, Answer } from '@/models/Classes';
import { EmptyObject, ParamQuestionBodyV2 } from '@/models/Types';
import { ERROR_MESSAGES } from '@/utils/errors';
import {
  getNewID,
  isQuizIdOwnedByUser,
  isValidQuizId,
  findQuizById,
  recursiveFind,
  isValidImgUrl,
  isSessionForQuizInEndState,
} from '@/utils/helper';

/**
 * Get all of the relevant information about the current quiz.
 */
export function adminQuizInfoV2(
  authUserId: number,
  quizId: number
): {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnailUrl: string;
} {
  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const quiz = findQuizById(quizId);

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.questions.length,
    questions: quiz.questions, // Include the questions array
    duration: quiz.questions.reduce((acc, question) => acc + question.duration, 0),
    thumbnailUrl: quiz.thumbnailUrl
  };
}

/**
 * Make a quiz be inactive if the user is the owner
 * Return an empty object if succeed
 */
export function adminQuizRemoveV2(authUserId: number, quizId: number): EmptyObject {
  if (!isSessionForQuizInEndState(quizId)) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_NOT_IN_END_STATE);
  }

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

export function adminQuizTransferV2(
  authUserId: number,
  quizId: number,
  userEmail: string
): EmptyObject {
  if (!isSessionForQuizInEndState(quizId)) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_NOT_IN_END_STATE);
  }
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

// TODO: update question class then add field thumbnail for this fuction
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
    // questionBody.thumbnailUrl,
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
  if (!isSessionForQuizInEndState(quizId)) {
    throw new HttpError(400, ERROR_MESSAGES.QUIZ_NOT_IN_END_STATE);
  }

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
