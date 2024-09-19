# Data Model

## Example Data Store State
```javascript
let data = {
  users: [
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
  quizzes: [
    {
      authUserId: 616425961674,
      quizId: 174712181430,
      name: '1093 class',
      description: 'I love sasa',
      timeCreated: 1234567890,
      timeLastEdited: 1234567890,
      active: true,
    }
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
|authUserId | number | 12 digit random integer |
|numSuccessfulLogins|number |times of succssful login|
|numFailedPasswordsSinceLastLogin|number|times of failed login|
|quizId|number|12 digit random integer|
|name|sting|Name of quiz|
|decription|string|description of Quiz|
|timeCreated|number| unix timestamp in seconds |
|timeLastEdited|number|unix timestamp in seconds|

