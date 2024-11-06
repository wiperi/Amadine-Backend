const errMessages = {
  user: {
    emailFormatOrDuplicated: 'Invalid email format or duplicated email',
    emailNotExist: 'Email address does not exist.',
    usedEmail: 'Email address already in use.',
    invalidName: 'Invalid name format',
    idNotExist: 'authUserId does not exist.',
    invalidPassword: 'Invalid password format',
    wrongPassword: 'Password is not correct for the given email.',
    wrongOldPassword: 'Given old password is not correct.',
    newPasswordSameAsOld: 'New password cannot be the same as the old password.',
    passwordAlreadyUsed: 'New password cannot be the same as any of used passwords.',
    notAuthorized: 'Not authorized',
  },
  quiz: {
    invalidId: 'Invalid quizId',
    nameConflict:
      'Quiz ID refers to a quiz that has a name that is already used by the target user.',
    invalidDescription: 'Invalid description format',
    inactive: 'Quiz is inactive',
    noQuestions: 'Quiz do not have any questions',
    tooManySessions: 'Quiz has too many sessions',
    notInEndState: 'There are some session for quiz are not in END state',
  },
  question: {
    invalidId: 'Invalid questionId',
    invalid: 'Invalid question format',
    invalidPosition: 'Position is out of range',
    samePosition: 'Position is the same as the current position',
    invalidDuration: 'sum of the question durations in the quiz exceeds 3 minutes',
    answerIdsInvalid: 'Answer IDs are not valid for this particular question',
    duplicateAnswerIds: 'Duplicate answer IDs provided',
    emptyAnswerIds: 'No answer IDs provided',
  },
  quizSession: {
    invalidId: 'Invalid session id',
    notBelongToQuiz: 'Quiz session does not belong to this quiz',
    invalidAction: 'Action provided is not a valid Action enum',
    notInLobbyState: 'Session is not in LOBBY state',
    stateInvalid: 'SESSION_STATE_INVALID',
    questionNotOpen: 'Quiz session is not in QUESTION_OPEN state. You cannot submit answers.',
    invalidPosition: (position: number, min: number, max: number) =>
      `Question position ${position} should be in the range of ${min} to ${max}`,
    questionNotCurrent: (position: number, current: number) =>
      `Session is not currently on question ${position}. Current question is ${current}`,
  },
  player: {
    usedName: 'Name already used by another user',
    notFound: (id: number) => `Player ${id} not found`,
  },
  other: {
    invalidIdType: 'Invalid ID type',
    missingRequiredFields: 'Request missing required fields',
    missingToken: 'Request missing token',
    invalidToken: 'Request token is invalid',
    invalidAutoStartNum: 'autoStartNum is a number greater than 50 or less than 0',
    invalidUrl: 'Invalid image URL',
  },
};

export default errMessages;
