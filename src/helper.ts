import { getData } from './dataStore';
import isEmail from 'validator/lib/isEmail';
import { User, Quiz } from './dataStore';
import { ERROR_MESSAGES } from './errors';

/**
 * Recursively searches for a target value within an object or its nested properties.
 *
 * @param obj - The object to search within.
 * @param target - The value to search for.
 * @returns True if the target is found, false otherwise.
 */
export function recursiveFind(obj: any, target: any): boolean {
  if (obj === target) return true;
  for (const key in obj) {
    if (obj[key] === target) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (recursiveFind(obj[key], target)) return true;
    }
  }
  return false;
}

/**
 * Generates a globally unique ID based on the specified type.
 *
 * @param type - The type of ID to generate.
 * @returns A unique ID number.
 * @throws Error if an invalid ID type is provided.
 */
export function getNewID(type?: 'user' | 'quiz' | 'question' | 'answer' | 'user session' | 'quiz session' | 'player'): number {
  const numberInRange = (start: number, end: number) => {
    return Math.floor((Math.random() * (end - start)) + start);
  };

  const getUniqueID = (idGenerator: () => number, dataSet: any[]) => {
    id = idGenerator();
    while (dataSet.some(item => {
      // Check if any property has a name contains 'id' and the value is the same as the id
      return Object.keys(item).some(key => {
        return key.toLowerCase().includes('id') && item[key] === id;
      });
    })) {
      id = idGenerator();
    }
    return id;
  };

  const data = getData();
  let idGenerator: () => number;
  let id: number;
  let dataSet: any[] = [];

  switch (type) {
    case undefined:
      console.log('This Id type is deprecated, you should use a specific type like user, quiz, question, etc.');
      return numberInRange(1, 1000000000);
    case 'user':
      idGenerator = () => numberInRange(1 * Math.pow(10, 9), 10 * Math.pow(10, 9) - 1);
      return getUniqueID(idGenerator, data.users);
    case 'quiz':
      idGenerator = () => numberInRange(1 * Math.pow(10, 10), 5 * Math.pow(10, 10) - 1);
      return getUniqueID(idGenerator, data.quizzes);
    case 'question':
      idGenerator = () => numberInRange(5 * Math.pow(10, 10), 10 * Math.pow(10, 10) - 1);
      dataSet = [];
      for (const quiz of data.quizzes) {
        for (const question of quiz.questions) {
          dataSet.push(question);
        }
      }
      return getUniqueID(idGenerator, dataSet);
    case 'answer':
      idGenerator = () => numberInRange(1 * Math.pow(10, 11), 5 * Math.pow(10, 11) - 1);
      dataSet = [];
      for (const quiz of data.quizzes) {
        for (const question of quiz.questions) {
          for (const answer of question.answers) {
            dataSet.push(answer);
          }
        }
      }
      return getUniqueID(idGenerator, dataSet);
    case 'user session':
      idGenerator = () => numberInRange(5 * Math.pow(10, 11), 10 * Math.pow(10, 11) - 1);
      return getUniqueID(idGenerator, data.userSessions);
    case 'quiz session':
      idGenerator = () => numberInRange(1 * Math.pow(10, 12), 5 * Math.pow(10, 12) - 1);
      return getUniqueID(idGenerator, data.quizSessions);
    case 'player':
      idGenerator = () => numberInRange(5 * Math.pow(10, 12), 10 * Math.pow(10, 12) - 1);
      return getUniqueID(idGenerator, data.players);
    default:
      throw new Error(ERROR_MESSAGES.INVALID_ID_TYPE);
  }
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

export function sleep(milliseconds: number) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
