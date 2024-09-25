import { getData } from "../dataStore";

/**
 * Reset the state of the application back to the start.
 *
 * @returns {Object} - An empty object.
 */
export function clear () {
  getData().users = [];
  getData().quizzes = [];
  return {};
}