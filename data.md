# Data Model

## Example Data Store State
```javascript
let data = {
  // TODO: insert your data structure that contains 
  // users + quizzes here
  Users: [
    {
      email = 'cheongmail@gmail.com',
      password = 'nicepassword',
      nameFirst = 'Cheong' 
      nameLast = 'Zhang'
      authUserId = 10,
      numSuccessfulLogins = 3,
      numFailedPasswordsSinceLastLogin = 4
    },
    {
      email = 'tingmail@gmail.com',
      password =  'tingpassword',
      nameFirst = 'Ting', 
      nameLast = 'Bai',
      authUserId = 20,
      numSuccessfulLogins = 4,
      numFailedPasswordsSinceLastLogin = 5
    }
  ]

  Quizs: [
    {
      authUserId = 10,
      quizId = 110,
      name = '1093 class', 
      description = 'I love sasa'
      timeCreated = 1683125870, 
      timeLastEdited = 1683125880,
    },
    {
      authUserId = 20,
      quizId = 120,
      name = '1093 class',
      description = 'nice JS', 
      timeCreated = 1683125870, 
      timeLastEdited = 1683125880,
    }
  ]
}
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

