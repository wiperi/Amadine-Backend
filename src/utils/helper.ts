import { getData } from '@/dataStore';
import isEmail from 'validator/lib/isEmail';
import { User, Quiz, QuizSession, Player, UserSession } from '@/models/Classes';
import { ERROR_MESSAGES } from '@/utils/errors';
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { QuizSessionState } from '@/models/Enums';
import { QuestionResult, RankedPlayer } from '@/models/Types';

/**
 * Hashes a string using bcrypt.
 */
export async function hash(str: string): Promise<string> {
  return await bcrypt.hash(str, 1);
}

/**
 * Compares a string with a hashed value.
 */
export async function hashCompare(str: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(str, hash);
}

/**
 * Executes a function, if success, return the response
 * if error, catch it and pass to next middleware
 *
 * @param fn - The function to execute.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next function.
 * @returns The JSON response if the function executes successfully.
 * @throws Passes any caught error to the next middleware.
 */
export async function tryCatch(fn: any, req: Request, res: Response, next: NextFunction) {
  try {
    return res.json(await fn());
  } catch (error) {
    next(error);
  }
}

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
export function getNewID(
  type?: 'user' | 'quiz' | 'question' | 'answer' | 'user session' | 'quiz session' | 'player'
): number {
  const numberInRange = (start: number, end: number) => {
    return Math.floor(Math.random() * (end - start) + start);
  };

  const getUniqueID = (idGenerator: () => number, dataSet: any[]) => {
    id = idGenerator();
    while (
      dataSet.some(item => {
        // Check if any property has a name contains 'id' and the value is the same as the id
        return Object.keys(item).some(key => {
          return key.toLowerCase().includes('id') && item[key] === id;
        });
      })
    ) {
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
      console.log(
        'This Id type is deprecated, you should use a specific type like user, quiz, question, etc.'
      );
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
          for (const answer of question.getAnswersSlice()) {
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

  return password.length >= 8 && numberRequirement && letterRequirement;
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
 * Validates the quiz name based on several criteria:
 * - The name must be alphanumeric and can include spaces.
 * - The name length must be between 3 and 30 characters.
 * - The name must be unique for the authenticated user, considering active quizzes.
 *
 * @param authUserId - The ID of the authenticated user.
 * @param name - The name of the quiz to validate.
 * @param quizId - (Optional) The ID of the quiz being edited, to exclude it from uniqueness check.
 * @returns `true` if the quiz name is valid, otherwise `false`.
 */
export function isValidQuizName(
  authUserId: number,
  name: string,
  quizId: number | undefined
): boolean {
  // regex for alphanumeric and spaces
  const regex = /^[a-z0-9\s]+$/i;
  if (!regex.test(name)) {
    return false;
  }

  if (name.length < 3 || name.length > 30) {
    return false;
  }

  const quizzes = getData().quizzes;
  if (
    quizId &&
    quizzes.some(
      q =>
        q.name === name && q.active === true && q.authUserId === authUserId && q.quizId !== quizId
    )
  ) {
    return false;
  } else if (
    !quizId &&
    quizzes.some(q => q.name === name && q.active === true && q.authUserId === authUserId)
  ) {
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
  return userList.some(user => user.userId === id);
}

export const find = {
  user: (userId: number): User | undefined => getData().users.find(user => user.userId === userId),
  quiz: (quizId: number): Quiz | undefined =>
    getData().quizzes.find(quiz => quiz.quizId === quizId),
  quizSession: (sessionId: number): QuizSession | undefined =>
    getData().quizSessions.find(session => session.sessionId === sessionId),
  userSession: (sessionId: number): UserSession | undefined =>
    getData().userSessions.find(session => session.sessionId === sessionId),
  player: (playerId: number): Player | undefined =>
    getData().players.find(player => player.playerId === playerId),
};

/**
 * Checks if the provided quizId is valid.
 *
 * @param quizId
 * @returns return true if the quizId refers to a active quiz, otherwise false.
 */
export function isValidQuizId(quizId: number): boolean {
  const quizList = getData().quizzes;
  return quizList.some(quiz => quiz.quizId === quizId && quiz.active);
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
  return quizList.some(
    quiz => quiz.quizId === quizId && quiz.authUserId === authUserId && quiz.active
  );
}

export function getActiveQuizSession(quizId: number): number[] {
  const data = getData();

  const quizSessions = data.quizSessions.filter(session => session.quizId === quizId);

  return quizSessions
    .filter(session => session.state() !== QuizSessionState.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);
}

export function getInactiveQuizSession(quizId: number): number[] {
  const data = getData();

  const quizSessions = data.quizSessions.filter(session => session.quizId === quizId);

  return quizSessions
    .filter(session => session.state() === QuizSessionState.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);
}

export function isValidImgUrl(imgUrl: string): boolean {
  if (!imgUrl.endsWith('jpg') && !imgUrl.endsWith('jpeg') && !imgUrl.endsWith('png')) {
    return false;
  }

  if (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) {
    return false;
  }

  return true;
}

export function isQuizHasOngoingSessions(quizId: number): boolean {
  return (
    getData().quizSessions.filter(s => s.quizId === quizId && s.state() !== QuizSessionState.END)
      .length > 0
  );
}

export function removeProperties<T extends object, K extends keyof T>(
  obj: T,
  ...propertiesToRemove: K[]
): Omit<T, K> {
  const entries = Object.entries(obj) as [keyof T, T[keyof T]][];
  const filteredEntries = entries.filter(([key]) => !propertiesToRemove.includes(key as K));
  return Object.fromEntries(filteredEntries) as Omit<T, K>;
}

export function isPlayerNameUnique(name: string, sessionId: number): boolean {
  return !getData().players.find(p => p.name === name && p.quizSessionId === sessionId);
}

export function getRandomNumberNoRepeat(length: number): string {
  const numberPick = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return numberPick
    .sort(() => Math.random() - 0.5)
    .slice(0, length)
    .join('');
}

export function getRandomLetterNoRepeat(length: number): string {
  const letterPick = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return letterPick
    .sort(() => Math.random() - 0.5)
    .slice(0, length)
    .join('');
}

// In player join, when name entered is empty, generated randomly satisfied:
//    1. 5 letters + 3 numbers
//    2. no repetitions of numbers and characters within the same name
export function getRandomName(): string {
  return getRandomLetterNoRepeat(5) + getRandomNumberNoRepeat(3);
}

export function isValidMessageBody(msg: string): boolean {
  return !(msg.length < 1 || msg.length > 100);
}

export function rankPlayerInSession (sessionId: number): RankedPlayer[] | [] {
  const data = getData();
  const rankedPlayers: RankedPlayer[] = [];
  for (const player of data.players) {
    if (player.quizSessionId === sessionId) {
      const rankedPlayer: RankedPlayer = {
        name: player.name,
        score: player.totalScore
      }
      rankedPlayers.push(rankedPlayer);
    }
  }

  return rankedPlayers.sort((a, b) => b.score - a.score);
}

export function getQuestionResult (quizSession: QuizSession, questionPosition: number, player: Player): QuestionResult {
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
