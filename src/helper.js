import { getData, setData } from "./dataStore.js";
import { ERROR_MESSAGES } from "./errors.js";
import isEmail from 'validator/lib/isEmail.js';


export function getNewID() {
  return 42;
}
export function invalidPassword(password) {

  return false
}

export function invalidEmail(email) {
  return false;
}

export function invalidUserName(userName) {
  return false;
}

export function invalidQuizName(quizName) {
  return false;
}

export function invalidQuizDescription(quizDescription) {
  return false;
}


