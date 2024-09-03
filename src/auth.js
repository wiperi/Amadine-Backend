function adminAuthRegister ( email, password, nameFirst, nameLast ) {
  return {
    authUserId: 1,
  };
}

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