module.exports = {

  index: async function(req, res) {

    /*
    |--------------------------------------------------------------------------
    | VALIDAR SESIÓN
    |--------------------------------------------------------------------------
    */

    if (!req.session.userId) {
      return res.redirect('/login');
    }

    /*
    |--------------------------------------------------------------------------
    | USUARIO
    |--------------------------------------------------------------------------
    */

    const usuario = await Usuario.findOne({
      id: req.session.userId
    });

    if (!usuario) {
      return res.redirect('/login');
    }

    /*
    |--------------------------------------------------------------------------
    | PROYECTOS
    |--------------------------------------------------------------------------
    */

    const proyectos = await Proyecto.find({
      usuario: usuario.id
    })
    .sort('createdAt DESC')
    .limit(6);

    /*
    |--------------------------------------------------------------------------
    | ESTADÍSTICAS IA
    |--------------------------------------------------------------------------
    */

    const totalTextos =
      await Texto.count({
        usuario: usuario.id
      });

    const totalImagenes =
      await Imagen.count({
        usuario: usuario.id
      });

    const totalVideos =
      await Video.count({
        usuario: usuario.id
      });

    const totalPeliculas =
      await Pelicula.count({
        usuario: usuario.id
      });

    /*
    |--------------------------------------------------------------------------
    | MODO GRATIS
    |--------------------------------------------------------------------------
    */

    const creditos = '∞ Ilimitados';

    /*
    |--------------------------------------------------------------------------
    | RESPUESTA
    |--------------------------------------------------------------------------
    */

    return res.view('pages/dashboard', {

      usuario,

      proyectos,

      creditos,

      modoGratis: true,

      estadisticas: {

        textos: totalTextos,

        imagenes: totalImagenes,

        videos: totalVideos,

        peliculas: totalPeliculas

      }

    });

  }

};