import { getData } from './dataStore';
import isEmail from 'validator/lib/isEmail';
import { User, Quiz } from './dataStore';

/**
 * Generates a random 12-digit ID that is not already in use.
 *
 * @returns return a random 12-digit number
 */
export function getNewID(): number {
  let id: number = Math.floor((Math.random() * (9 * Math.pow(10, 11))) + Math.pow(10, 11));
  const data = getData();
  while (data.users.some(user => user.userId === id) || data.quizzes.some(quiz => quiz.quizId === id)) {
    id = Math.floor((Math.random() * (9 * Math.pow(10, 11))) + Math.pow(10, 11));
  }
  return id;
}

/**
 * Validate password, password must be at least 8 characters long
 * and contain at least one number and one letter
 *
 * @param password
 * @returns return true if password is correct
 */
export function isValidPassword(password: string): boolean {
  const numberRequirement = /[0-9]/.test(password);
  const letterRequirement = /[a-zA-Z]/.test(password);

  return (password.length >= 8 && numberRequirement && letterRequirement);
}

/**
 * Check email format.
 *
 * @param email
 * @returns return true if email is correct
 */
export function isValidEmail(email: string): boolean {
  return isEmail(email);
}

/**
 * Checks if the provided email is not used by any user.
 *
 * @param email
 * @returns return true if the email is not used by any user, otherwise false.
 */
export function isUnusedEmail(email: string): boolean {
  return getData().users.every(user => user.email !== email);
}

/**
 * check the format and length of the userName
 *
 * @param userName
 * @returns return true if userName is correct
 */
export function isValidUserName(userName: string): boolean {
  const nameRegex = /^[a-zA-Z\s'-]+$/;

  if (userName.length < 2 || userName.length > 20) {
    return false;
  }

  if (!nameRegex.test(userName)) {
    return false;
  }

  return true;
}

/**
 * check if the provided quiz name is in a valid format
 *
 * @param quizName
 * @returns return whether quiz name is valid
 */
export function isValidQuizName(quizName: string): boolean {
  // regex for alphanumeric and spaces
  const regex = /^[a-z0-9\s]+$/i;
  if (!regex.test(quizName)) {
    return false;
  }

  if (quizName.length < 3 || quizName.length > 30) {
    return false;
  }

  const quizList = getData().quizzes;
  if (quizList.some((quiz) => quiz.name === quizName && quiz.active === true)) {
    return false;
  }

  return true;
}

/**
 * check if the provided quiz description is valid
 * invalid cases:
 *  1. quiz description is more than 100 characters in length
 *
 * @param quizDescription
 * @returns return whether quiz description is valid
 */
export function isValidQuizDescription(quizDescription: string): boolean {
  return quizDescription.length <= 100;
}

/**
 * Checks if the given user ID is valid by verifying its presence in the user list.
 *
 * @param id
 * @returns Returns true if the user ID is found in the user list, otherwise false.
 */
export function isValidUserId(id: number): boolean {
  const userList = getData().users;
  return userList.some((user) => user.userId === id);
}

export function findUserById(userId: number): User | undefined {
  return getData().users.find(user => user.userId === userId);
}

/**
 * Checks if the provided quizId is valid.
 *
 * @param quizId
 * @returns return true if the quizId refers to a active quiz, otherwise false.
 */
export function isValidQuizId(quizId: number): boolean {
  const quizList = getData().quizzes;
  return quizList.some((quiz) => quiz.quizId === quizId && quiz.active);
}

/**
 * Checks if a quiz with the given quizId is owned by the user with the given authUserId and is active.
 *
 * @param quizId
 * @param authUserId
 * @returns return true if the quiz is owned by the user and is active, otherwise false.
 */
export function isQuizIdOwnedByUser(quizId: number, authUserId: number): boolean {
  const quizList = getData().quizzes;
  return quizList.some((quiz) => quiz.quizId === quizId && quiz.authUserId === authUserId && quiz.active);
}

export function findQuizById(quizId: number): Quiz | undefined {
  return getData().quizzes.find(quiz => quiz.quizId === quizId);
}
