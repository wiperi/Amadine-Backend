# Data Model

## Example Data Store State
```json
{
  "users": [
    {
      "numSuccessfulLogins": 2,
      "numFailedPasswordsSinceLastLogin": 0,
      "oldPasswords": [],
      "userId": 6867318917,
      "email": "test@test.com",
      "password": "Password123!",
      "nameFirst": "John",
      "nameLast": "Doe"
    }
  ],
  "quizzes": [
    {
      "timeCreated": 1727876047,
      "timeLastEdited": 1727876047,
      "active": true,
      "questions": [],
      "thumbnailUrl": "",
      "authUserId": 1,
      "quizId": 45081635485,
      "name": "Test Quiz",
      "description": "This is a test quiz"
    }
  ],
  "userSessions": [
    {
      "sessionId": 613610381134,
      "authUserId": 6867318917,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY4NjczMTg5MTcsImlhdCI6MTcyNzg3NTk5MX0.WZeWHExleXeeQ3KFX0WWYgwCGJJGE2VXCgJdmwrG7N8"
    },
    {
      "sessionId": 976139452081,
      "authUserId": 6867318917,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY4NjczMTg5MTcsImlhdCI6MTcyNzg3NTk5MX0.WZeWHExleXeeQ3KFX0WWYgwCGJJGE2VXCgJdmwrG7N8"
    }
  ],
  "quizSessions": [],
  "players": []
}
```
## Short description of the Data Model


![Data Model Diagram](./docs/dataStructrueDiagram.png)

This simplified UML diagram illustrates the relationships between the main entities in our data model:

- Users: Represent registered users of the system
- Quizzes: Contain information about quizzes created by users
- UserSessions: Track active user login sessions
- QuizSessions: Represent ongoing or completed quiz gameplay sessions
- Players: Store information about participants in quiz sessions

The diagram shows the connections between these entities and their key attributes, providing a visual overview of the data structure used in the application.



