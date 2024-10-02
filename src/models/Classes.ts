import { QuizSessionState, Colour } from './Enums';

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
  answers: Answer[] = [];

  constructor(questionId: number, question: string, duration: number, points: number, answers: Answer[]) {
    this.questionId = questionId;
    this.question = question;
    this.duration = duration;
    this.points = points;
    this.answers = answers;
  }
}

export class Answer {
  answerId: number;

  answer: string;
  correct: boolean;

  colour: Colour = this.getRandomColor(); // randomly generated when answer is created

  private getRandomColor(): Colour {
    const colors = Object.values(Colour);
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

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
