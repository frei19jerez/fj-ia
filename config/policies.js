module.exports.policies = {
  '*': true,

  DashboardController: { '*': 'isLoggedIn' },
  ProyectoController: { '*': 'isLoggedIn' },
  TextoController: { '*': 'isLoggedIn' },
  ImagenController: { '*': 'isLoggedIn' },
  VideoController: { '*': 'isLoggedIn' },
  PeliculaController: { '*': 'isLoggedIn' }
};
