// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import fs from 'fs';
import path from 'path';

/// //////////////////////////////////////////////////////////////////
// Classes
/// //////////////////////////////////////////////////////////////////

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

/// //////////////////////////////////////////////////////////////////
// Classes below are working in progress, never used
/// //////////////////////////////////////////////////////////////////

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

  private generateColour(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  addAnswer(answerId: number, answer: string, correct: boolean): Answer {
    const newAnswer = new Answer(answerId, answer, this.generateColour(), correct);
    this.answers.push(newAnswer);
    return newAnswer;
  }

  constructor(questionId: number, question: string, duration: number, points: number) {
    this.questionId = questionId;
    this.question = question;
    this.duration = duration;
    this.points = points;
  }
}

class Answer {
  answerId: number;

  answer: string;
  colour: string; // ramdomly generated when question is created
  correct: boolean;

  constructor(answerId: number, answer: string, colour: string, correct: boolean) {
    this.answerId = answerId;
    this.answer = answer;
    this.correct = correct;
    this.colour = colour;
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

export enum QuizSessionState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum PlayerAction {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
}

/// //////////////////////////////////////////////////////////////////
// DataStore
/// //////////////////////////////////////////////////////////////////

type DataStore = {
  users: User[];
  quizzes: Quiz[];
}

let data: DataStore = {
  users: [
    // {
    //   userId: 616425961674,
    //   email: 'cheongmail@gmail.com',
    //   password: 'nicepassword',
    //   nameFirst: 'Cheong',
    //   nameLast: 'Zhang',
    //   numSuccessfulLogins: 3,
    //   numFailedPasswordsSinceLastLogin: 4,
    //   oldPasswords: ['MyOldPass1234'],
    // }
  ],
  quizzes: [
    // {
    //   authUserId: '616425961674',
    //   quizId: '174712181430',
    //   name: '1093 class',
    //   description: 'I love sasa',
    //   timeCreated: 1627312,
    //   timeLastEdited: 128372,
    //   active: true,
    // }
  ]
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

const DATA_FILE_PATH = path.join(__dirname, 'data.json');

// Use get() to access the data
function getData(): DataStore {
  return data;
}

/**
 * Save current data to json file. If newData is provided, overwrite the current data with newData.
 */
function setData(newData?: DataStore): void {
  if (newData) {
    data = newData;
  }
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
}

/**
 * Load data from json file.
 */
function loadData(): void {
  data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf8'));
}

export { getData, setData, loadData };
