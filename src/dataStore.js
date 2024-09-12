// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY

/**
 * @typedef {{
*   userId: number,
*   email: string,
*   password: string,
*   nameFirst: string,
*   nameLast: string,
*   numSuccessfulLogins: number,
*   numFailedPasswordsSinceLastLogin: number,
*   oldPasswords: Array<string>,
 * }} User
 */

/**
 * @typedef {{
*   authUserId: number,
*   quizId: number,
*   name: string,
*   description: string,
*   timeCreated: number,
*   timeLastEdited: number,
*   active: boolean
* }} Quiz
*/

/**
 * @type {{user: Array<User>, quiz: Array<Quiz>}}
 */
let data = {
  user: [
    {
      userId: 616425961674,
      email: 'cheongmail@gmail.com',
      password: 'nicepassword',
      nameFirst: 'Cheong',
      nameLast: 'Zhang',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 4,
      oldPasswords: ['MyOldPass1234'],
    }
  ],
  quiz: [
    {
      authUserId: 616425961674,
      quizId: 174712181430,
      name: '1093 class',
      description: 'I love sasa',
      timeCreated: 1627312,
      timeLastEdited: 128372,
      active: true,
    }
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
