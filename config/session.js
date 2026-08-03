const esProduccion =
  process.env.NODE_ENV === 'production';

module.exports.session = {
  /*
   * Nombre exclusivo para evitar que FJ-IA
   * choque con la cookie de DemoFlowApp.
   */
  name: 'fj_ia_sid',

  secret:
    process.env.SESSION_SECRET ||
    'fj-ia-secret-local-cambiar-en-produccion',

  cookie: {
    /*
     * En local usamos HTTP.
     * En Render usamos HTTPS.
     */
    secure: esProduccion,

    httpOnly: true,

    sameSite: 'lax',

    maxAge: 24 * 60 * 60 * 1000

    /*
     * No colocar path: '/runtime/fj-ia'.
     *
     * Sin un path personalizado, funcionará en:
     * - http://127.0.0.1:1337/login
     * - https://demoflowapp.com/runtime/fj-ia/login
     */
  }
};