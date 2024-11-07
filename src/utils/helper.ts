import { getData } from '@/dataStore';
import isEmail from 'validator/lib/isEmail';
import { User, Quiz, QuizSession, Player } from '@/models/Classes';
import { ERROR_MESSAGES } from '@/utils/errors';
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { QuizSessionState } from '@/models/Enums';
import { QuestionResultReturned, PlayerReturned } from '@/models/Types';

/// //////////////////////////////////////////////////////////////////
// START: UNCOVERAGE CODE THAT CAN NOT BE TESTED
/// //////////////////////////////////////////////////////////////////

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

/// //////////////////////////////////////////////////////////////////
// END: UNCOVERAGE CODE THAT CAN NOT BE TESTED
/// //////////////////////////////////////////////////////////////////

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

export const find = {
  user: (userId: number): User | undefined => getData().users.find(user => user.userId === userId),
  quiz: (quizId: number): Quiz | undefined =>
    getData().quizzes.find(quiz => quiz.quizId === quizId),
  quizSession: (sessionId: number): QuizSession | undefined =>
    getData().quizSessions.find(session => session.sessionId === sessionId),
  // userSession: (sessionId: number): UserSession | undefined =>
  //   getData().userSessions.find(session => session.sessionId === sessionId),
  player: (playerId: number): Player | undefined =>
    getData().players.find(player => player.playerId === playerId),
  players: (sessionId: number): Player[] =>
    getData().players.filter(player => player.quizSessionId === sessionId),
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
    .filter(session => session.state !== QuizSessionState.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);
}

export function getInactiveQuizSession(quizId: number): number[] {
  const data = getData();

  const quizSessions = data.quizSessions.filter(session => session.quizId === quizId);

  return quizSessions
    .filter(session => session.state === QuizSessionState.END)
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
    getData().quizSessions.filter(s => s.quizId === quizId && s.state !== QuizSessionState.END)
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

export function rankPlayerInSession(sessionId: number): PlayerReturned[] {
  return getData()
    .players.filter(p => p.quizSessionId === sessionId)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map(p => ({ name: p.name, score: p.totalScore }));
}

export function getQuestionResult(
  quizSession: QuizSession,
  questionPosition: number
): QuestionResultReturned {
  const data = getData();
  const questionIndex = questionPosition - 1;
  const question = quizSession.metadata.questions[questionIndex];
  const questionId = question.questionId;
  const quizSessionId = quizSession.sessionId;

  const playersInSession = data.players.filter(p => p.quizSessionId === quizSessionId);

  // Filter correct players
  // Select the correct submit from submits
  // Sort by time submitted
  // Update score
  // Update total score
  // Sort by name
  // Calculate average answer time
  // Calculate percent correct

  const numPlayers = playersInSession.length;
  let totalAnswerTime = 0;
  let numCorrectPlayer = 0;
  const playersCorrectList: string[] = [];
  type Submit = (typeof Player.prototype.submits)[number];
  const map = new Map<Player, Submit>();

  playersInSession
    .filter(p => {
      const sub = p.submits.find(s => s.questionId === questionId);

      // Answered
      if (!sub) return false;
      totalAnswerTime += sub.timeSpent;

      // Answered correctly
      if (!sub.isRight) return false;

      numCorrectPlayer++;
      map.set(p, sub);
      return true;
    })
    // Sort by time submitted
    .sort((a, b) => map.get(a)!.timeSubmitted - map.get(b)!.timeSubmitted)
    .filter((p, index) => {
      // Score has already been calculated, skip
      if (map.get(p).score !== 0) return true;

      // Update score
      const score = Math.round(question.points / (index + 1));
      map.get(p).score = score;
      p.totalScore += score;
      // console.log(`${p.name} got ${score} pts, new total score is ${p.totalScore}`); // debug
      return true;
    })
    // Sort by name
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(p => {
      playersCorrectList.push(p.name);
      return true;
    });

  return {
    questionId,
    playersCorrectList,
    averageAnswerTime: Math.round(totalAnswerTime / numPlayers),
    percentCorrect: Math.round((numCorrectPlayer / numPlayers) * 100),
  };
}
export function getQuizSessionResultCSV(quizId: number, sessionId: number): string {
  const data = getData();
  const quizSession = find.quizSession(sessionId);
  const playersInSession = data.players.filter(p => p.quizSessionId === sessionId);
  const questions = quizSession.metadata.questions;
  const playerScores = playersInSession.map(player => {
    const scores = questions.map((question, index) => {
      const submit = player.submits.find(s => s.questionId === question.questionId);
      return {
        score: submit ? submit.score : 0,
        timeSpent: submit ? submit.timeSpent : 0,
      };
    });
    return {
      name: player.name,
      scores,
    };
  });
  const playerRanks = questions.map((question, questionIndex) => {
    const scores = playerScores.map(player => ({
      name: player.name,
      score: player.scores[questionIndex].score,
    }));
    scores.sort((a, b) => b.score - a.score);

    return scores.map((player, index) => ({
      name: player.name,
      rank: player.score > 0 ? index + 1 : 0,
    }));
  });
  const csvData = playerScores.map(player => {
    const row: { Player: string; [key: string]: number | string } = { Player: player.name };
    player.scores.forEach((score, index) => {
      row[`question${index + 1}score`] = score.score;
      row[`question${index + 1}rank`] = playerRanks[index].find(r => r.name === player.name).rank;
    });
    return row;
  });
  csvData.sort((a, b) => a.Player.localeCompare(b.Player));
  const fields = ['Player'];
  questions.forEach((_, index) => {
    fields.push(`question${index + 1}score`, `question${index + 1}rank`);
  });

  const csvRows = [];
  csvRows.push(fields.join(','));
  csvData.forEach(row => {
    const values = fields.map(field => row[field]);
    csvRows.push(values.join(','));
  });
  const csv = csvRows.join('\n');

  return csv;
}
