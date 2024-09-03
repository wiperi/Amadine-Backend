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