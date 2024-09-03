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