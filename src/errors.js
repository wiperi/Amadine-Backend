const ERROR_MESSAGES = {
  // email
  INVALID_EMAIL: 'Invalid email format or duplicated email',
  EMAIL_NOT_EXIST: 'Email address does not exist.',
  // name
  INVALID_NAME: 'Invalid name format',
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