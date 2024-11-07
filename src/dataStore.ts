/// //////////////////////////////////////////////////////////////////
// UNCOVERAGE CODE THAT CAN NOT BE TESTED
//
// Location: line 46
// Reason: it is out of the scope of this project, it is used to relink the
// prototype of the objects after loading data from json file
/// //////////////////////////////////////////////////////////////////

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import {
  User,
  UserSession,
  Quiz,
  QuizSession,
  Player,
  Question,
  Answer,
  Message,
} from './models/Classes';
import fs from 'fs';
import path from 'path';
import { StateMachine } from './models/StateMachine';

type DataStore = {
  users: User[];
  quizzes: Quiz[];
  userSessions: UserSession[];
  quizSessions: QuizSession[];
  players: Player[];
};

let data: DataStore = {
  users: [],
  quizzes: [],
  userSessions: [],
  quizSessions: [],
  players: [],
};

/**
 * Load data from json file.
 */
function loadData(): void {
  const rawData: any = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf8'));

  // Reconstruct the objects
  rawData.users.forEach((u: any) => Object.setPrototypeOf(u, User.prototype));
  rawData.userSessions.forEach((us: any) => Object.setPrototypeOf(us, UserSession.prototype));
  rawData.quizzes.forEach(
    (q: any) =>
      Object.setPrototypeOf(q, Quiz.prototype) &&
      q.questions.forEach(
        (q: any) =>
          Object.setPrototypeOf(q, Question.prototype) &&
          q.answers.forEach((a: any) => Object.setPrototypeOf(a, Answer.prototype))
      )
  );
  rawData.quizSessions.forEach((qs: any) => {
    Object.setPrototypeOf(qs, QuizSession.prototype);
    Object.setPrototypeOf(qs.stateMachine, StateMachine.prototype);
    Object.setPrototypeOf(qs.metadata, Quiz.prototype);
    qs.messages.forEach((m: any) => Object.setPrototypeOf(m, Message.prototype));
  });

  rawData.players.forEach((p: any) => Object.setPrototypeOf(p, Player.prototype));

  data = rawData;
}
export const quizSessionTimers: Map<number, ReturnType<typeof setTimeout>> = new Map();

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

export { getData, setData, loadData };
