module.exports = {

  new: async function (req, res) {
    return res.view('pages/crear-pelicula', {
      resultado: null
    });
  },

  create: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const { titulo, idea, genero } = req.body;

      if (!titulo || titulo.trim() === '' || !idea || idea.trim() === '') {
        req.session.error = 'Título e idea son obligatorios.';
        return res.redirect('/crear-pelicula');
      }

      const tituloLimpio = titulo.trim();
      const ideaLimpia = idea.trim();
      const generoFinal = genero || 'drama';

      try {
        await sails.helpers.consumirCreditos.with({
          usuarioId: req.session.userId,
          cantidad: 5,
          descripcion: 'Generación de película IA'
        });
      } catch (creditError) {
        if (creditError.message === 'SIN_CREDITOS') {
          req.session.error = 'No tienes créditos suficientes para crear película.';
          return res.redirect('/dashboard');
        }

        throw creditError;
      }

      const promptPelicula = `
Crea una película corta profesional para redes sociales, YouTube o streaming corto.

Título:
${tituloLimpio}

Género:
${generoFinal}

Idea principal:
${ideaLimpia}

Entrega el resultado con esta estructura:

1. Título comercial
2. Sinopsis
3. Personajes principales
4. Guion por escenas
5. Diálogos principales
6. Descripción visual de cada escena
7. Música sugerida
8. Prompts para generar imágenes de cada escena
9. Descripción SEO para YouTube
10. Hashtags para redes sociales

Debe ser creativo, claro, cinematográfico y en español.
      `;

      const guion = await OpenAIService.generarTexto(
        promptPelicula,
        'guion_pelicula'
      );

      const proyecto = await Proyecto.create({
        usuario: req.session.userId,
        titulo: tituloLimpio,
        tipo: 'pelicula',
        estado: 'guion'
      }).fetch();

      const pelicula = await Pelicula.create({
        usuario: req.session.userId,
        proyecto: proyecto.id,
        titulo: tituloLimpio,
        idea: ideaLimpia,
        genero: generoFinal,
        guion: guion,
        estado: 'guion'
      }).fetch();

      return res.view('pages/crear-pelicula', {
        resultado: pelicula
      });

    } catch (error) {
      sails.log.error('Error creando película IA:', error);

      req.session.error = 'No se pudo crear la película con IA.';
      return res.redirect('/crear-pelicula');
    }
  },

  editor: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const pelicula = await Pelicula.findOne({
        id: req.params.id,
        usuario: req.session.userId
      });

      if (!pelicula) {
        return res.notFound();
      }

      const escenas = await Escena.find({
        pelicula: pelicula.id
      }).sort('orden ASC');

      return res.view('pages/editor-escenas', {
        pelicula,
        escenas
      });

    } catch (error) {
      sails.log.error('Error abriendo editor de escenas:', error);

      req.session.error = 'No se pudo abrir el editor de escenas.';
      return res.redirect('/mis-proyectos');
    }
  },

  addEscena: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const pelicula = await Pelicula.findOne({
        id: req.params.peliculaId,
        usuario: req.session.userId
      });

      if (!pelicula) {
        return res.notFound();
      }

      const { titulo, descripcion, orden } = req.body;

      if (!titulo || titulo.trim() === '') {
        req.session.error = 'El título de la escena es obligatorio.';
        return res.redirect('/editor-escenas/' + pelicula.id);
      }

      await Escena.create({
        usuario: req.session.userId,
        pelicula: pelicula.id,
        titulo: titulo.trim(),
        descripcion: descripcion || '',
        orden: Number(orden || 1)
      });

      req.session.success = 'Escena agregada correctamente.';
      return res.redirect('/editor-escenas/' + pelicula.id);

    } catch (error) {
      sails.log.error('Error agregando escena:', error);

      req.session.error = 'No se pudo agregar la escena.';
      return res.redirect('/mis-proyectos');
    }
  }

};