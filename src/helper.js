import { getData, setData } from "./dataStore.js";
import { ERROR_MESSAGES } from "../src/errors.js";
import isEmail from 'validator/lib/isEmail.js';

export function getNewID() {
  return 42;
}

/**
 * validate password, password must be at least 8 characters long
 * and contain at least one number and one letter
 * @param {string} password
 * @returns {boolean}
 */

export function isvalidPassword(password) {
  const numberRequirement = /[0-9]/.test(password);
  const letterRequirement = /[a-zA-Z]/.test(password);

  return (password.length >= 8 && numberRequirement && letterRequirement);  
}

export function invalidEmail(email) {
  return false;
}

export function isvalidUserName(userName) {
  const name_devide = userName.split(' ');
  if (name_devide.length < 2) {
    return false;
  }

  const NameFirst = name_devide[0];
  const NameLast = name_devide.slice(1).join(' ');
  const nameRegex = /^[a-zA-Z\s'-]+$/;

  if (NameFirst.length < 2 || NameFirst.length > 20) {
    return false;
  }

  if (!nameRegex.test(NameFirst)) {
    return false;
  }

  if (NameLast.length < 2 || NameLast.length > 20) {
    return false;
  }

  if (!nameRegex.test(NameLast)) {
    return false;
  }

  return true;

}

export function invalidQuizName(quizName) {
  return false;
}

export function invalidQuizDescription(quizDescription) {
  return false;
}


