/**
 * Register a user with an email, password, and names, 
 * then returns their authUserId value.
 * 
 * @param {string} email - The email address of a user
 * @param {string} password - The password of a user
 * @param {string} nameFirst - The first name of a user
 * @param {string} nameLast - The last name of a user
 * @returns {Object} - Object with authUserId value
 */
function adminAuthRegister ( email, password, nameFirst, nameLast ) {
  return {
    authUserId: 1,
  };
}


/**
 * Given a registered user's email and password 
 * returns their authUserId value.
 * 
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} - Object with authUserId value
 */
function adminAuthLogin ( email, password ) {
  return {
    authUserId: 1,
  };
}

/**
 * Updates the details of an admin user.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} email - The email address of the admin user.
 * @param {string} nameFirst - The first name of the admin user.
 * @param {string} nameLast - The last name of the admin user.
 * @returns {Object} - An empty object.
 */
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  return {}
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated 
 * with a single space between them.
 * 
 * @param {number} authUserId - User's Id
 * @returns {Object} - Object with userId, name, email, times of successful logins
 *                     times of failed passwords since last login
 */
function adminUserDetails ( authUserId ) {
  return {
    user:
    {
      userId: 1,
      name: 'Jar Jar Brinks',
      email: 'mesasosorry@naboo.com.au',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
    }
  };
}

/**
 * Updates the password for an admin user.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {string} oldPassword - The old password of the admin user.
 * @param {string} newPassword - The new password for the admin user.
 * @returns {Object} - An empty object.
 */
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  return {}
}
