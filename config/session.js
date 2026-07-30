module.exports.session = {
  name: 'fjia.sid',

  secret:
    process.env.SESSION_SECRET ||
    'fj-ia-secret-local',

  cookie: {
    secure:
      process.env.NODE_ENV === 'production',

    httpOnly: true,

    sameSite: 'lax',

    maxAge:
      24 * 60 * 60 * 1000
  }
};