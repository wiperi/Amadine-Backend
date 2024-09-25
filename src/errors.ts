const ERROR_MESSAGES = {
  // email
  INVALID_EMAIL_FORMAT: 'Invalid email format or duplicated email',
  EMAIL_NOT_EXIST: 'Email address does not exist.',
  USED_EMAIL: 'Email address already in use.',
  // name
  INVALID_NAME: 'Invalid name format',
  //description
  INVALID_DESCRIPTION: 'Invalid description format',
  // quizId
  INVALID_QUIZ_ID: 'Invalid quizId',
  //not authorized
  NOT_AUTHORIZED: 'Not authorized',
  // authUserId
  UID_NOT_EXIST: 'authUserId does not exist.',
  // password
  INVALID_PASSWORD: 'Invalid password format',
  WRONG_PASSWORD: 'Password is not correct for the given email.',
  WRONG_OLD_PASSWORD: 'Given old password is not correct.',
  NEW_PASSWORD_SAME_AS_OLD: 'New password cannot be the same as the old password.',
  PASSWORD_ALREADY_USED: 'New password cannot be the same as any of used passwords.',
}

export { ERROR_MESSAGES };