// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY

export class User {
  userId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  oldPasswords: string[];

  constructor(userId: number, email: string, password: string, nameFirst: string, nameLast: string) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.nameFirst = nameFirst;
    this.nameLast = nameLast;
    this.numSuccessfulLogins = 1;
    this.numFailedPasswordsSinceLastLogin = 0;
    this.oldPasswords = [];
  }
}

export class Quiz {
  authUserId: number;
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  active: boolean;

  constructor(authUserId: number, quizId: number, name: string, description: string) {
    this.authUserId = authUserId;
    this.quizId = quizId;
    this.name = name;
    this.description = description;
    this.timeCreated = Math.floor(Date.now() / 1000);
    this.timeLastEdited = Math.floor(Date.now() / 1000);
    this.active = true;
  }
}

type DataStore = {
  users: User[];
  quizzes: Quiz[];
}

let data: DataStore = {
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
    //   authUserId: '616425961674',
    //   quizId: '174712181430',
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
function getData(): DataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore): void {
  data = newData;
}

export { getData, setData };
