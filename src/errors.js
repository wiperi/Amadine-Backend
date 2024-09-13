const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email format or duplicated email',
  INVALID_NAME: 'Invalid name format',
  INVALID_PASSWORD: 'Invalid password format',
  EMAIL_FORMAT: 'Invalid email format',
  NAME_FIRST_LENGTH: 'NameFirst need more than 1 characters and less than 21 characters.',
  NAME_FIRST_FORMAT: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.',
  NAME_LAST_LENGTH: 'NameLast need more than 1 characters and less than 21 characters.',
  NAME_LAST_FORMAT: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.',
  EMAIL_EXISTENCE: 'Email address does not exist.',
  PASSWORD_EXITSTENCE: 'Password is not correct for the given email.',
}

export { ERROR_MESSAGES };