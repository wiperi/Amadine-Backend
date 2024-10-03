import { QuizSessionState, Color } from './Enums';

export class User {
  userId: number;

  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number = 1;
  numFailedPasswordsSinceLastLogin: number = 0;
  oldPasswords: string[] = [];

  constructor(userId: number, email: string, password: string, nameFirst: string, nameLast: string) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.nameFirst = nameFirst;
    this.nameLast = nameLast;
  }
}

export class Quiz {
  authUserId: number;
  quizId: number;

  name: string;
  description: string;
  timeCreated: number = Math.floor(Date.now() / 1000);
  timeLastEdited: number = Math.floor(Date.now() / 1000);
  active: boolean = true;
  questions: Question[] = [];
  thumbnailUrl: string = '';

  constructor(authUserId: number, quizId: number, name: string, description: string) {
    this.authUserId = authUserId;
    this.quizId = quizId;
    this.name = name;
    this.description = description;
  }
}

export class UserSession {
  sessionId: number;
  authUserId: number;

  token: string;
  deviceInfo?: string;

  constructor(sessionId: number, authUserId: number, token: string, deviceInfo?: string) {
    this.sessionId = sessionId;
    this.authUserId = authUserId;
    this.token = token;
    this.deviceInfo = deviceInfo;
  }
}

export class Question {
  // Position matters in quiz
  questionId: number;

  question: string;
  duration: number;
  points: number;

  private answers: Answer[] = [];
  private unusedColors: Color[] = Object.values(Color); // used to assign unique colours to answers

  private getRandomUniqueColor(): Color {
    if (this.unusedColors.length <= 0) {
      throw new Error(`Can not create more answers. Current number of answers: ${this.answers.length}`)
    }
    const randomIndex = Math.random() * this.unusedColors.length;
    return this.unusedColors.splice(randomIndex, 1)[0];
  }

  /**
   * Return a copy of seleciton of answers
   * 
   * @param start The beginning index of the specified portion of the array. If start is undefined, then the slice begins at index 0.
   * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'. If end is undefined, then the slice extends to the end of the array.
   * @returns 
   */
  getAnswersSlice(start?: number, end?: number): Answer[] {
    return this.answers.slice(start, end);
  }

  setAnswers(answers: Answer[]): void {
    answers.forEach(answer => {
      answer.colour = this.getRandomUniqueColor();
    });
    this.answers = answers
  }

  addAnswer(answer: Answer): void {
    answer.colour = this.getRandomUniqueColor();
    this.answers.push(answer);
  }

  deleteAnswer(answerId: number): void {
    this.answers = this.answers.filter(answer => answer.answerId !== answerId);
  }

  constructor(questionId: number, question: string, duration: number, points: number, answers: Answer[]) {
    this.questionId = questionId;
    this.question = question;
    this.duration = duration;
    this.points = points;
    
    answers.forEach(answer => {
      answer.colour = this.getRandomUniqueColor();
    });
    this.answers = answers;
  }
}

export class Answer {
  answerId: number;

  answer: string;
  correct: boolean;

  colour: Color;

  constructor(answerId: number, answer: string, correct: boolean) {
    this.answerId = answerId;
    this.answer = answer;
    this.correct = correct;
  }
}

export class QuizSession {
  sessionId: number;
  quizId: number;

  messages: Message[] = [];
  state: QuizSessionState = QuizSessionState.LOBBY;
  atQuestion: number = 1; // Question index starting from 1
  timeCreated: number = Math.floor(Date.now() / 1000);

  constructor(sessionId: number, quizId: number) {
    this.sessionId = sessionId;
    this.quizId = quizId;
  }
}

export class Player {
  playerId: number; // Must be globally unique
  quizSessionId: number;

  name: string;

  constructor(playerId: number, quizSessionId: number, name: string) {
    this.playerId = playerId;
    this.quizSessionId = quizSessionId;
    this.name = name;
  }
}

export class Message {
  playerId: number;
  playerName: string;
  messageBody: string;
  timeSent: number = Math.floor(Date.now() / 1000);

  constructor(playerId: number, playerName: string, messageBody: string) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.messageBody = messageBody;
  }
}
