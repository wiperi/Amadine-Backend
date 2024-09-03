// Update the description of the relevant quiz.
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

//Update the name of the relevant quiz.
function adminQuizNameUpdate(authUserId, quizId, name){
  return{};
}