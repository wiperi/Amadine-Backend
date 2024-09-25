// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY

export class User {
  /**
   * Creates an instance of a user.
   *
   * @constructor
   * @param {number} userId - The unique identifier for the user.
   * @param {string} email - The email address of the user.
   * @param {string} password - The password for the user.
   * @param {string} nameFirst - The first name of the user.
   * @param {string} nameLast - The last name of the user.
   */
  constructor(userId, email, password, nameFirst, nameLast) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.nameFirst = nameFirst;
    this.nameLast = nameLast;
    this.numSuccessfulLogins = 1;
    this.numFailedPasswordsSinceLastLogin = 0;
    /**
     * @type {Array<string>}
     */
    this.oldPasswords = [];
  }
}

export class Quiz {
  /**
   * Creates an instance of Quiz.
   *
   * @constructor
   * @param {string} authUserId - The ID of the authenticated user.
   * @param {string} quizId - The ID of the quiz.
   * @param {string} name - The name of the data store.
   * @param {string} description - The description of the data store.
   */
  constructor(authUserId, quizId, name, description) {
    this.authUserId = authUserId;
    this.quizId = quizId;
    this.name = name;
    this.description = description;
    this.timeCreated = Math.floor(Date.now() / 1000);
    this.timeLastEdited = Math.floor(Date.now() / 1000);
    this.active = true;
  }
}

/**
 * @type {{users: Array<User>, quizzes: Array<Quiz>}}
 */
let data = {
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
    //   authUserId: 616425961674,
    //   quizId: 174712181430,
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

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
}

export { getData, setData };
