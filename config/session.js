module.exports.session = {
  secret: process.env.SESSION_SECRET || 'fj-ia-secret-local',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
};
