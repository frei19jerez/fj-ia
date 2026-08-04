/**
 * HTTP Server Settings
 * FJ-IA
 */

function normalizarRuntimePrefix(valor) {
  if (!valor) {
    return '';
  }

  let prefijo = String(valor)
    .split(',')[0]
    .trim();

  if (!prefijo) {
    return '';
  }

  if (!prefijo.startsWith('/')) {
    prefijo = `/${prefijo}`;
  }

  prefijo = prefijo
    .replace(/\/+/g, '/')
    .replace(/\/+$/, '');

  return prefijo;
}

module.exports.http = {

  /**
   * FJ-IA se ejecuta detrás del proxy de DemoFlowApp.
   */
  trustProxy: true,

  middleware: {

    order: [
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',

      /**
       * Debe ejecutarse antes de router y www
       * para que todas las vistas tengan runtimePrefix.
       */
      'runtimePrefix',

      'router',
      'www',
      'favicon'
    ],

    /**
     * Detecta el prefijo público enviado por DemoFlowApp.
     *
     * En DemoFlowApp:
     * /runtime/fj-ia
     *
     * En local:
     * cadena vacía
     */
    runtimePrefix: function (req, res, next) {
      try {
        const headers = req.headers || {};

        const prefijoRecibido =
          headers['x-runtime-prefix'] ||
          headers['x-forwarded-prefix'] ||
          headers['x-forwarded-pathbase'] ||
          headers['x-script-name'] ||
          headers['x-demoflow-runtime-prefix'] ||
          process.env.RUNTIME_PREFIX ||
          '';

        const runtimePrefix =
          normalizarRuntimePrefix(
            prefijoRecibido
          );

        /**
         * Disponible en todas las vistas EJS.
         */
        res.locals.runtimePrefix =
          runtimePrefix;

        /**
         * También disponible en controladores y políticas.
         */
        req.runtimePrefix =
          runtimePrefix;

        req.demoflowRuntimePrefix =
          runtimePrefix;

        /**
         * Ayuda para construir rutas desde controladores.
         *
         * req.runtimeUrl('/login')
         *
         * Resultado detrás de DemoFlow:
         * /runtime/fj-ia/login
         *
         * Resultado local:
         * /login
         */
        req.runtimeUrl = function (ruta) {
          let rutaLimpia =
            String(ruta || '/').trim();

          if (!rutaLimpia.startsWith('/')) {
            rutaLimpia = `/${rutaLimpia}`;
          }

          if (
            runtimePrefix &&
            (
              rutaLimpia === runtimePrefix ||
              rutaLimpia.startsWith(
                `${runtimePrefix}/`
              )
            )
          ) {
            return rutaLimpia;
          }

          return `${runtimePrefix}${rutaLimpia}`;
        };

        /**
         * Log temporal para comprobar que el header llega.
         */
        sails.log.info(
          '🧭 FJ-IA runtime prefix recibido:',
          {
            runtimePrefix:
              runtimePrefix || '(local/sin prefijo)',

            xRuntimePrefix:
              headers['x-runtime-prefix'] || null,

            xForwardedPrefix:
              headers['x-forwarded-prefix'] || null,

            xForwardedPathbase:
              headers['x-forwarded-pathbase'] || null,

            xScriptName:
              headers['x-script-name'] || null,

            xDemoFlowRuntimePrefix:
              headers[
                'x-demoflow-runtime-prefix'
              ] || null,

            originalUrl:
              headers['x-original-url'] ||
              req.originalUrl ||
              null,

            urlInterna:
              req.url || null
          }
        );

        return next();
      } catch (error) {
        sails.log.error(
          '❌ FJ-IA: Error detectando runtime prefix:',
          error
        );

        /**
         * No bloquear la aplicación por este middleware.
         */
        res.locals.runtimePrefix = '';
        req.runtimePrefix = '';
        req.demoflowRuntimePrefix = '';

        req.runtimeUrl = function (ruta) {
          let rutaLimpia =
            String(ruta || '/').trim();

          if (!rutaLimpia.startsWith('/')) {
            rutaLimpia = `/${rutaLimpia}`;
          }

          return rutaLimpia;
        };

        return next();
      }
    }

  }

};