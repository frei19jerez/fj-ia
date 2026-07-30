module.exports = {

  new: async function (req, res) {
    return res.view('pages/crear-imagen', {
      resultado: null
    });
  },

  create: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const { prompt, estilo } = req.body;

      if (!prompt || prompt.trim() === '') {
        req.session.error = 'Escribe una idea para generar la imagen.';
        return res.redirect('/crear-imagen');
      }

      const promptLimpio = prompt.trim();
      const estiloFinal = estilo || 'realista';

      try {
        await sails.helpers.consumirCreditos.with({
          usuarioId: req.session.userId,
          cantidad: 3,
          descripcion: 'Generación de imagen IA'
        });
      } catch (creditError) {
        if (creditError.message === 'SIN_CREDITOS') {
          req.session.error = 'No tienes créditos suficientes para generar imagen.';
          return res.redirect('/dashboard');
        }

        throw creditError;
      }

      const urlImagen = await ImagenIAService.generarImagen(
        promptLimpio,
        estiloFinal
      );

      const proyecto = await Proyecto.create({
        usuario: req.session.userId,
        titulo: promptLimpio.substring(0, 80),
        tipo: 'imagen',
        estado: 'generado'
      }).fetch();

      const imagen = await Imagen.create({
        usuario: req.session.userId,
        proyecto: proyecto.id,
        prompt: promptLimpio,
        estilo: estiloFinal,
        url: urlImagen
      }).fetch();

      return res.view('pages/crear-imagen', {
        resultado: imagen
      });

    } catch (error) {
      sails.log.error('Error generando imagen IA:', error);

      req.session.error = 'No se pudo generar la imagen. Revisa la terminal.';
      return res.redirect('/crear-imagen');
    }
  }

};