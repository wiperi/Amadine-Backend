/**
 * Update the description of the relevant quiz.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @param {string} description - The description of the quiz.
 * @returns {Object} - An empty object.
 */
function adminQuizDescriptionUpdate (authUserId, quizId, description) {
  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 * 
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @returns {Object} - Object with quizId, name, timeCreated,
 *                     timeLastEdited and description
 */
function adminQuizInfo(authUserId, quizId){
  return{ 
    quizId: 1, 
    name: 'My Quiz', 
    timeCreated: 1683125870, 
    timeLastEdited: 1683125871, 
    description: 'This is my quiz', 
  };
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @param {string} name - name of Quiz which should be updated.
 * @returns {} - An empty object. 
 */
function adminQuizNameUpdate(authUserId, quizId, name){
  return{};
}


/**
 * 
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} name - name of Quiz which should be updated.
 * @param {string} description - The ID of the authenticated user.
 * @returns 
 */
function adminQuizCreate (authUserId, name, description) {
  return {
    quizId: 2,
  };
}

/**
 * Retrieves the quiz list for an admin user.
 * 
 * @param {number} authUserId - The ID of the authenticated user.
 * @property {Array} quizzes - The array of quizzes.
 * @property {number} quizzes.quizId - The ID of the quiz.
 * @property {string} quizzes.name - The name of the quiz.
 * @returns {Object} - An object containing the list of quizzes.
 */
function adminQuizList(authUserId) {
  return { quizzes: [{ quizId: 1, name: 'My Quiz', }] }
}

/**
 * 
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of quiz.
 * @returns 
 */
function adminQuizRemove(authUserId, quizId) {
  return {};
}