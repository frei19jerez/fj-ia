const bcrypt = require('bcryptjs');

module.exports = {

  showRegister: async function(req, res) {
    return res.view('pages/register');
  },

  register: async function(req, res) {

    const runtimePrefix = (
      req.get('x-runtime-prefix') ||
      req.get('x-forwarded-prefix') ||
      process.env.RUNTIME_PREFIX ||
      ''
    ).replace(/\/+$/, '');

    const url = (ruta) => `${runtimePrefix}${ruta}`;

    try {

      const { nombre, email, password } = req.body;

      if (!nombre || !email || !password) {
        req.session.error = 'Todos los campos son obligatorios.';
        return res.redirect(url('/register'));
      }

      const existe = await Usuario.findOne({
        email: String(email).toLowerCase()
      });

      if (existe) {
        req.session.error = 'Ese correo ya está registrado.';
        return res.redirect(url('/register'));
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const usuario = await Usuario.create({
        nombre,
        email: String(email).toLowerCase(),
        password: passwordHash
      }).fetch();

      await Credito.create({
        usuario: usuario.id,
        saldo: 10,
        descripcion: 'Créditos iniciales gratis'
      });

      req.session.userId = usuario.id;

      return res.redirect(url('/dashboard'));

    } catch (error) {

      console.error('========================================');
      console.error('ERROR REGISTER');
      console.error(error);
      console.error(error.stack);
      console.error('========================================');

      req.session.error = error.message;

      return res.redirect(url('/register'));

    }

  },

  showLogin: async function(req, res) {
    return res.view('pages/login');
  },

  login: async function(req, res) {

    const runtimePrefix = (
      req.get('x-runtime-prefix') ||
      req.get('x-forwarded-prefix') ||
      process.env.RUNTIME_PREFIX ||
      ''
    ).replace(/\/+$/, '');

    const url = (ruta) => `${runtimePrefix}${ruta}`;

    try {

      const { email, password } = req.body;

      const usuario = await Usuario.findOne({
        email: String(email).toLowerCase()
      });

      if (!usuario) {
        req.session.error = 'Correo o contraseña incorrectos.';
        return res.redirect(url('/login'));
      }

      const ok = await bcrypt.compare(password, usuario.password);

      if (!ok) {
        req.session.error = 'Correo o contraseña incorrectos.';
        return res.redirect(url('/login'));
      }

      req.session.userId = usuario.id;

      return res.redirect(url('/dashboard'));

    } catch (error) {

      console.error('========================================');
      console.error('ERROR LOGIN');
      console.error(error);
      console.error(error.stack);
      console.error('========================================');

      req.session.error = error.message;

      return res.redirect(url('/login'));

    }

  },

  logout: async function(req, res) {

    const runtimePrefix = (
      req.get('x-runtime-prefix') ||
      req.get('x-forwarded-prefix') ||
      process.env.RUNTIME_PREFIX ||
      ''
    ).replace(/\/+$/, '');

    const url = (ruta) => `${runtimePrefix}${ruta}`;

    req.session.destroy(() => {
      return res.redirect(url('/'));
    });

  }

};