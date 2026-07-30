module.exports = {

  new: async function (req, res) {
    return res.view('pages/crear-video', {
      resultado: null
    });
  },

  index: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const videos = await Video.find({
        usuario: req.session.userId
      }).sort('createdAt DESC');

      return res.view('pages/videos/index', {
        videos
      });

    } catch (error) {
      sails.log.error('Error listando videos IA:', error);
      req.session.error = 'No se pudieron cargar tus videos.';
      return res.redirect('/dashboard');
    }
  },

  show: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const video = await Video.findOne({
        id: req.params.id,
        usuario: req.session.userId
      });

      if (!video) {
        req.session.error = 'Video no encontrado.';
        return res.redirect('/videos');
      }

      return res.view('pages/crear-video', {
        resultado: video
      });

    } catch (error) {
      sails.log.error('Error mostrando video IA:', error);
      req.session.error = 'No se pudo abrir el video.';
      return res.redirect('/videos');
    }
  },

  create: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const { prompt, duracion } = req.body;

      if (!prompt || prompt.trim() === '') {
        req.session.error = 'Escribe una idea para crear el video.';
        return res.redirect('/crear-video');
      }

      const promptLimpio = prompt.trim();
      const duracionFinal = Number(duracion || 15);

      if (duracionFinal < 5 || duracionFinal > 60) {
        req.session.error = 'La duración debe estar entre 5 y 60 segundos.';
        return res.redirect('/crear-video');
      }

      try {
        await sails.helpers.consumirCreditos.with({
          usuarioId: req.session.userId,
          cantidad: 5,
          descripcion: 'Generación de video IA'
        });
      } catch (creditError) {
        if (creditError.message === 'SIN_CREDITOS') {
          req.session.error = 'No tienes créditos suficientes para crear video.';
          return res.redirect('/dashboard');
        }

        throw creditError;
      }

      const data = await VideoIAService.crearVideoDesdeTexto(
        promptLimpio,
        duracionFinal
      );

      const proyecto = await Proyecto.create({
        usuario: req.session.userId,
        titulo: promptLimpio.substring(0, 80),
        tipo: 'video',
        estado: 'generado'
      }).fetch();

      const video = await Video.create({
        usuario: req.session.userId,
        proyecto: proyecto.id,
        prompt: promptLimpio,
        duracion: duracionFinal,
        url: data.url || '/videos/demo-fj-ia.mp4',
        contenido: data.contenido || null,
        estado: data.estado || 'guion-generado'
      }).fetch();

      return res.redirect('/videos/' + video.id);

    } catch (error) {
      sails.log.error('Error creando video IA:', error);

      req.session.error = 'No se pudo crear el video.';
      return res.redirect('/crear-video');
    }
  },

  delete: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const video = await Video.findOne({
        id: req.params.id,
        usuario: req.session.userId
      });

      if (!video) {
        req.session.error = 'Video no encontrado.';
        return res.redirect('/videos');
      }

      await Video.destroyOne({
        id: video.id,
        usuario: req.session.userId
      });

      req.session.success = 'Video eliminado correctamente.';
      return res.redirect('/videos');

    } catch (error) {
      sails.log.error('Error eliminando video IA:', error);
      req.session.error = 'No se pudo eliminar el video.';
      return res.redirect('/videos');
    }
  },

  recrear: async function (req, res) {
    try {
      if (!req.session.userId) {
        req.session.error = 'Primero debes iniciar sesión.';
        return res.redirect('/login');
      }

      const videoAnterior = await Video.findOne({
        id: req.params.id,
        usuario: req.session.userId
      });

      if (!videoAnterior) {
        req.session.error = 'Video no encontrado.';
        return res.redirect('/videos');
      }

      req.body.prompt = videoAnterior.prompt;
      req.body.duracion = videoAnterior.duracion;

      return this.create(req, res);

    } catch (error) {
      sails.log.error('Error recreando video IA:', error);
      req.session.error = 'No se pudo recrear el video.';
      return res.redirect('/videos');
    }
  }

};