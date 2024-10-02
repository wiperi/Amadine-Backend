import { getData, setData } from '@/dataStore';
import { HttpError } from '@/utils/HttpError';
import { Quiz, Question, Answer } from '@/models/Classes';
import { EmptyObject } from '@/models/Types';
import { ERROR_MESSAGES } from '@/utils/errors';
import {
  getNewID,
  isQuizIdOwnedByUser,
  isValidQuizId,
  findQuizById,
  isValidQuizName,
  isValidQuizDescription,
  recursiveFind
} from '@/utils/helper';
/**
 * Update the description of the relevant quiz.
 */
export function adminQuizDescriptionUpdate(authUserId: number, quizId: number, description: string): EmptyObject {
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
  if (quiz) {
    quiz.description = description;
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  }
  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 */
export function adminQuizInfo(
  authUserId: number,
  quizId: number
): {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numofQuestions: number;
  questions: Array<{
    questionId: number;
    question: string;
    duration: number;
    points: number;
    answers: Array<{
      answerId: number;
      answer: string;
      correct: boolean;
      colour: string;
    }>;
  }>;
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
    numofQuestions: quiz.questions.length,
    questions: quiz.questions, // Include the questions array
  };
}

/**
 * Update the name of the relevant quiz.
 */
export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): EmptyObject {
  if (!isValidQuizName(name)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_NAME);
  }

  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  }

  const quiz = findQuizById(quizId);
  if (quiz) {
    quiz.name = name;
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  }

  return {};
}

/**
 * Creates a new quiz if the provided user ID, name, and description are valid.
 */
export function adminQuizCreate(authUserId: number, name: string, description: string): { quizId: number } {
  if (!isValidQuizName(name)) {
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
    quizId: quizId
  };
}

/**
 * Retrieves a list of quizzes created by a specific authenticated user,
 * if the user ID is valid. The quizzes are returned with their IDs and names.
 */
export function adminQuizList(authUserId: number): { quizzes: { quizId: number; name: string }[] } | { error: string } {
  const quizzes = getData().quizzes
    .filter(quiz => quiz.authUserId === authUserId && quiz.active)
    .map(quiz => ({
      quizId: quiz.quizId,
      name: quiz.name
    }));

  return { quizzes: quizzes };
}

/**
 * Make a quiz be inactive if the user is the owner
 * Return an empty object if succeed
 */
export function adminQuizRemove(authUserId: number, quizId: number): EmptyObject {
  const data = getData();
  if (!isValidQuizId(quizId)) {
    throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    throw new HttpError(401, ERROR_MESSAGES.NOT_AUTHORIZED);
  }
  const quiz = findQuizById(quizId);
  if (quiz) {
    quiz.active = false;
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
    setData(data);
    return {};
  }
  throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
}

export function adminQuizTrashView(authUserId: number): { quizzes: Array<{ quizId: number, name: string }> } {
  // TODO: Implement this function
  return { quizzes: [] };
}

export function adminQuizRestore(authUserId: number, quizId: number): EmptyObject {
  // TODO: Implement this function
  return {};
}

export function adminQuizTrashEmpty(authUserId: number, quizIds: number[]): EmptyObject {
  // TODO: Implement this function
  return {};
}

export function adminQuizTransfer(authUserId: number, quizId: number, userEmail: string): EmptyObject {
  // TODO: Implement this function
  return {};
}

type ParamQuestionBody = {
  question: string;
  duration: number;
  points: number;
  answers: Array<{ answer: string, correct: boolean }>;
}

export function adminQuizQuestionCreate(authUserId: number, quizId: number, questionBody: ParamQuestionBody): { questionId: number } {
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
  if (quiz.questions.reduce((acc, question) => acc + question.duration, 0) + questionBody.duration > 180) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
  }
  if (questionBody.answers.some(answer => questionBody.answers.filter(a => a.answer === answer.answer).length > 1)) {
    throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION);
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
    questionBody.answers.map((answer, index) => new Answer(getNewID('answer'), answer.answer, answer.correct))
  );

  quiz.questions.push(question);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData();

  return { questionId: questionId };
}

export function adminQuizQuestionUpdate(authUserId: number, quizId: number, questionId: number, questionBody: ParamQuestionBody): EmptyObject {
  // TODO: Implement this function
  if (!quizId || recursiveFind(questionBody, undefined)) {
    throw new HttpError(400, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
  }
  return {};
}

export function adminQuizQuestionDelete(authUserId: number, quizId: number, questionId: number): EmptyObject {
  // TODO: Implement this function
  return {};
}

export function adminQuizQuestionMove(authUserId: number, quizId: number, questionId: number, newPosition: number): EmptyObject {
  // const quiz = findQuizById(quizId);
  // if (!quiz) {
  //   throw new HttpError(403, ERROR_MESSAGES.INVALID_QUIZ_ID);
  // }

  // if (quiz.authUserId !== authUserId) {
  //   throw new HttpError(403, ERROR_MESSAGES.NOT_AUTHORIZED);
  // }

  // if (newPosition < 0 || newPosition > (quiz.questions.length - 1)) {
  //   throw new HttpError(400, ERROR_MESSAGES.INVALID_POSITION);
  // }

  // const question = quiz.questions.find(question => question.questionId === questionId);
  // const currentPosition = quiz.questions.indexOf(question);

  // if (!question) {
  //   throw new HttpError(400, ERROR_MESSAGES.INVALID_QUESTION_ID);
  // }

  // if (currentPosition === newPosition) {
  //   throw new HttpError(400, ERROR_MESSAGES.SAME_POSITION);
  // }

  // quiz.questions.splice(currentPosition, 1);
  // quiz.questions.splice(newPosition, 0, question);

  return {};
}

export function adminQuizQuestionDuplicate(authUserId: number, quizId: number, questionId: number): { newQuestionId: number } {
  // TODO: Implement this function
  return { newQuestionId: 0 };
}
