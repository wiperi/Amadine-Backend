// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import { User, UserSession, Quiz, QuizSession, Player } from './models/Classes';
import fs from 'fs';
import path from 'path';

type DataStore = {
  users: User[];
  quizzes: Quiz[];
  userSessions: UserSession[];
  quizSessions: QuizSession[];
  players: Player[];
}

let data: DataStore = {
  users: [],
  quizzes: [],
  userSessions: [],
  quizSessions: [],
  players: [],
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
