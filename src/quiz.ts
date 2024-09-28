import { getData, Question, Quiz, setData } from './dataStore';
import { ERROR_MESSAGES } from './errors';
import {
  getNewID,
  isValidUserId,
  isQuizIdOwnedByUser,
  isValidQuizId,
  findQuizById,
  isValidQuizName,
  isValidQuizDescription
} from './helper';
import { HttpError } from './dataStore';
import { set } from 'yaml/dist/schema/yaml-1.1/set';
/**
 * Update the description of the relevant quiz.
 */
export function adminQuizDescriptionUpdate(authUserId: number, quizId: number, description: string): Record<string, never> | { error: string } {
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  if (!isValidQuizId(quizId)) {
    return { error: ERROR_MESSAGES.INVALID_QUIZ_ID };
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    return { error: ERROR_MESSAGES.NOT_AUTHORIZED };
  }

  if (!isValidQuizDescription(description)) {
    return { error: ERROR_MESSAGES.INVALID_DESCRIPTION };
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
export function adminQuizInfo(authUserId: number, quizId: number): {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
} | { error: string } {
  if (!isValidUserId(authUserId)) {
    throw new HttpError(401, ERROR_MESSAGES.INVALID_TOKEN);
  }

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
    description: quiz.description
  };
}

/**
 * Update the name of the relevant quiz.
 */
export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): Record<string, never> | { error: string } {
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  if (!isValidQuizId(quizId)) {
    return { error: ERROR_MESSAGES.INVALID_QUIZ_ID };
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    return { error: ERROR_MESSAGES.NOT_AUTHORIZED };
  }

  if (!isValidQuizName(name)) {
    return { error: ERROR_MESSAGES.INVALID_NAME };
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
export function adminQuizCreate(authUserId: number, name: string, description: string): { quizId: number } | { error: string } {
  if (!isValidUserId(authUserId)) {
    throw new HttpError(401, ERROR_MESSAGES.USED_EMAIL);
  }
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
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

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
export function adminQuizRemove(authUserId: number, quizId: number): Record<string, never> | { error: string } {
  if (!isValidUserId(authUserId)) {
    return { error: ERROR_MESSAGES.UID_NOT_EXIST };
  }

  if (!isValidQuizId(quizId)) {
    return { error: ERROR_MESSAGES.INVALID_QUIZ_ID };
  }

  if (!isQuizIdOwnedByUser(quizId, authUserId)) {
    return { error: ERROR_MESSAGES.NOT_AUTHORIZED };
  }
  const quiz = findQuizById(quizId);
  if (quiz) {
    quiz.active = false;
  }
  return {};
}
