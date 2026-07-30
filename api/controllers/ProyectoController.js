module.exports = {

  /*
  |--------------------------------------------------------------------------
  | MIS PROYECTOS
  |--------------------------------------------------------------------------
  */

  index: async function (req, res) {

    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const proyectos = await Proyecto.find({
      usuario: req.session.userId
    })
    .sort('createdAt DESC');

    return res.view('pages/mis-proyectos', {
      proyectos
    });

  },

  /*
  |--------------------------------------------------------------------------
  | VER PROYECTO
  |--------------------------------------------------------------------------
  */

  view: async function (req, res) {

    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const proyecto = await Proyecto.findOne({
      id: req.params.id,
      usuario: req.session.userId
    });

    if (!proyecto) {

      req.session.error =
        'Proyecto no encontrado.';

      return res.redirect('/mis-proyectos');

    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR CONTENIDO IA
    |--------------------------------------------------------------------------
    */

    let contenido = null;

    if (proyecto.tipo === 'texto') {

      contenido = await Texto.findOne({
        proyecto: proyecto.id
      });

    }

    if (proyecto.tipo === 'imagen') {

      contenido = await Imagen.findOne({
        proyecto: proyecto.id
      });

    }

    if (proyecto.tipo === 'video') {

      contenido = await Video.findOne({
        proyecto: proyecto.id
      });

    }

    return res.view('pages/ver-proyecto', {

      proyecto,

      contenido

    });

  },

  /*
  |--------------------------------------------------------------------------
  | ELIMINAR PROYECTO
  |--------------------------------------------------------------------------
  */

  destroy: async function (req, res) {

    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const proyecto = await Proyecto.findOne({
      id: req.params.id,
      usuario: req.session.userId
    });

    if (!proyecto) {

      req.session.error =
        'Proyecto no encontrado.';

      return res.redirect('/mis-proyectos');

    }

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR CONTENIDO RELACIONADO
    |--------------------------------------------------------------------------
    */

    if (proyecto.tipo === 'texto') {

      await Texto.destroy({
        proyecto: proyecto.id
      });

    }

    if (proyecto.tipo === 'imagen') {

      await Imagen.destroy({
        proyecto: proyecto.id
      });

    }

    if (proyecto.tipo === 'video') {

      await Video.destroy({
        proyecto: proyecto.id
      });

    }

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR PROYECTO
    |--------------------------------------------------------------------------
    */

    await Proyecto.destroyOne({
      id: proyecto.id
    });

    req.session.success =
      'Proyecto eliminado correctamente.';

    return res.redirect('/mis-proyectos');

  }

};