module.exports.session = {
  name: 'fj_ia_sid',

  secret:
    process.env.SESSION_SECRET ||
    'fj-ia-secret-local-cambiar-en-produccion',

  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/runtime/fj-ia'
  }
};