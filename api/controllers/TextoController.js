module.exports = {

  new: async function (req, res) {
    return res.view('pages/crear-texto', {
      resultado: null
    });
  },

  create: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const { prompt, tipo } = req.body;

      if (!prompt || prompt.trim() === '') {
        req.session.error = 'Escribe una idea para generar el texto.';
        return res.redirect('/crear-texto');
      }

      const promptLimpio = prompt.trim();

      try {
        await sails.helpers.consumirCreditos.with({
          usuarioId: req.session.userId,
          cantidad: 1,
          descripcion: 'Generación de texto IA'
        });
      } catch (creditError) {
        if (creditError.message === 'SIN_CREDITOS') {
          req.session.error = 'No tienes créditos disponibles.';
          return res.redirect('/dashboard');
        }

        throw creditError;
      }

      const contenido = await OpenAIService.generarTexto(
        promptLimpio,
        tipo || 'general'
      );

      const proyecto = await Proyecto.create({
        usuario: req.session.userId,
        titulo: promptLimpio.substring(0, 80),
        tipo: 'texto',
        estado: 'generado'
      }).fetch();

      const texto = await Texto.create({
        usuario: req.session.userId,
        proyecto: proyecto.id,
        prompt: promptLimpio,
        tipo: tipo || 'general',
        contenido: contenido
      }).fetch();

      return res.view('pages/crear-texto', {
        resultado: texto
      });

    } catch (error) {
      sails.log.error('Error generando texto con IA:', error);

      req.session.error = 'No se pudo generar el texto con IA.';
      return res.redirect('/crear-texto');
    }
  }

};