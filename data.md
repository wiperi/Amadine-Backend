# Data Model

## Example Data Store State
```javascript
export class user {
  /**
   * creates an instance of a user.
   * 
   * @constructor
   * @param {number} userid - the unique identifier for the user.
   * @param {string} email - the email address of the user.
   * @param {string} password - the password for the user.
   * @param {string} namefirst - the first name of the user.
   * @param {string} namelast - the last name of the user.
   */
  constructor(userid, email, password, namefirst, namelast) {
    this.userid = userid;
    this.email = email;
    this.password = password;
    this.namefirst = namefirst;
    this.namelast = namelast;
    this.numsuccessfullogins = 1;
    this.numfailedpasswordssincelastlogin = 0;
    /**
     * @type {array<string>}
     */
    this.oldpasswords = [];
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
    this.timeCreated = Date.now();
    this.timeLastEdited = Date.now();
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
```
## Short description of the Data Model

Here you should describe what each property of data model object does.

| Property | Type | Description |
| -------- | ---- | ----------- |
| email    | string| User's email|
|password  |string |User's password|
|nameFirst |string |User's firstname|
|nameLast |string |User's Lastname|
|authUserId | number | User's ID|
|numSuccessfulLogins|number |times of succssful login|
|numFailedPasswordsSinceLastLogin|number|times of failed login|
|quizId|number|ID of quizs|
|name|sting|Name of quiz|
|decription|string|description of Quiz|
|timeCreated|number| created timestamp |
|timeLastEdited|number|Edited timestamp|

