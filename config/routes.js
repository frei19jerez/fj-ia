module.exports.routes = {

  /*
  |--------------------------------------------------------------------------
  | HOME
  |--------------------------------------------------------------------------
  */

  'GET /': {
    view: 'pages/home'
  },

  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  'GET /register':
    'AuthController.showRegister',

  'POST /register':
    'AuthController.register',

  'GET /login':
    'AuthController.showLogin',

  'POST /login':
    'AuthController.login',

  'GET /logout':
    'AuthController.logout',

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD
  |--------------------------------------------------------------------------
  */

  'GET /dashboard':
    'DashboardController.index',

  /*
  |--------------------------------------------------------------------------
  | PROYECTOS
  |--------------------------------------------------------------------------
  */

  'GET /mis-proyectos':
    'ProyectoController.index',

  'GET /proyecto/:id':
    'ProyectoController.view',

  'POST /proyecto/:id/eliminar':
    'ProyectoController.destroy',

  /*
  |--------------------------------------------------------------------------
  | TEXTO IA
  |--------------------------------------------------------------------------
  */

  'GET /crear-texto':
    'TextoController.new',

  'POST /crear-texto':
    'TextoController.create',

  /*
  |--------------------------------------------------------------------------
  | IMAGEN IA
  |--------------------------------------------------------------------------
  */

  'GET /crear-imagen':
    'ImagenController.new',

  'POST /crear-imagen':
    'ImagenController.create',

  /*
  |--------------------------------------------------------------------------
  | VIDEO IA
  |--------------------------------------------------------------------------
  */

  'GET /crear-video':
    'VideoController.new',

  'POST /crear-video':
    'VideoController.create',

  // Biblioteca de videos
  'GET /videos':
    'VideoController.index',

  // Ver un video
  'GET /videos/:id':
    'VideoController.show',

  // Eliminar video
  'POST /videos/:id/eliminar':
    'VideoController.delete',

  // Crear otra versión del video
  'POST /videos/:id/recrear':
    'VideoController.recrear',

  /*
  |--------------------------------------------------------------------------
  | PELÍCULAS IA
  |--------------------------------------------------------------------------
  */

  'GET /crear-pelicula':
    'PeliculaController.new',

  'POST /crear-pelicula':
    'PeliculaController.create',

  'GET /editor-escenas/:id':
    'PeliculaController.editor',

  'POST /escenas/:peliculaId':
    'PeliculaController.addEscena',

  // Biblioteca de películas
  'GET /peliculas':
    'PeliculaController.index',

  // Ver una película
  'GET /peliculas/:id':
    'PeliculaController.show',

  // Eliminar película
  'POST /peliculas/:id/eliminar':
    'PeliculaController.delete'

};