/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuración del servidor HTTP de FJ-IA.
 */

module.exports.http = {

  /*
   * FJ-IA funciona detrás del proxy HTTPS de DemoFlowApp/Render.
   * Esto permite que Sails reconozca correctamente las solicitudes
   * seguras y envíe la cookie de sesión con `secure: true`.
   */
  trustProxy: true,

  middleware: {

    /*
     * Se conserva el orden predeterminado de middleware de Sails.
     *
     * order: [
     *   'cookieParser',
     *   'session',
     *   'bodyParser',
     *   'compress',
     *   'poweredBy',
     *   'router',
     *   'www',
     *   'favicon',
     * ],
     */

    /*
     * Configuración opcional para archivos multipart.
     *
     * bodyParser: (function _configureBodyParser() {
     *   const skipper = require('skipper');
     *   return skipper({ strict: true });
     * })(),
     */
  }

};