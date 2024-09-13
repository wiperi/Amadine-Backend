import { getData } from "./dataStore";

/**
 * Reset the state of the application back to the start.
 *
 * @returns {Object} - An empty object.
 */
export function clear () {
  getData().user = [];
  getData().quiz = [];
  return {};
}