const ERROR_MESSAGES = {
  // ID Gen
  INVALID_ID_TYPE: 'Invalid ID type',
  // Email
  INVALID_EMAIL_FORMAT: 'Invalid email format or duplicated email',
  EMAIL_NOT_EXIST: 'Email address does not exist.',
  USED_EMAIL: 'Email address already in use.',
  // Name
  INVALID_NAME: 'Invalid name format',
  QUIZ_NAME_CONFLICT: 'Quiz ID refers to a quiz that has a name that is already used by the target user.',
  // Description
  INVALID_DESCRIPTION: 'Invalid description format',
  // Quiz ID
  INVALID_QUIZ_ID: 'Invalid quizId',
  // Question ID
  INVALID_QUESTION_ID: 'Invalid questionId',
  // Question
  INVALID_QUESTION: 'Invalid question format',
  // Not Authorized
  NOT_AUTHORIZED: 'Not authorized',
  // Auth User ID
  UID_NOT_EXIST: 'authUserId does not exist.',
  // Password
  INVALID_PASSWORD: 'Invalid password format',
  WRONG_PASSWORD: 'Password is not correct for the given email.',
  WRONG_OLD_PASSWORD: 'Given old password is not correct.',
  NEW_PASSWORD_SAME_AS_OLD: 'New password cannot be the same as the old password.',
  PASSWORD_ALREADY_USED: 'New password cannot be the same as any of used passwords.',
  // Bad Request
  MISSING_REQUIRED_FIELDS: 'Request missing required fields',
  // Token
  MISSING_TOKEN: 'Request missing token',
  INVALID_TOKEN: 'Request token is invalid',
  // Position
  INVALID_POSITION: 'Position is out of range',
  SAME_POSITION: 'Position is the same as the current position',
  // Duration
  INVALID_DURATION: 'If this question were to be updated, the sum of the question durations in the quiz exceeds 3 minutes'
};

export { ERROR_MESSAGES };
