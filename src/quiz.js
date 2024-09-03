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

//Get all of the relevant information about the current quiz.
function adminQuizInfo(authUserId, quizId){
  return{ 
    quizId: 1, 
    name: 'My Quiz', 
    timeCreated: 1683125870, 
    timeLastEdited: 1683125871, 
    description: 'This is my quiz', 
  };
}