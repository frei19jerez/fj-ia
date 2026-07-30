const bcrypt = require('bcryptjs');

module.exports = {
  showRegister: async function(req, res) {
    return res.view('pages/register');
  },

  register: async function(req, res) {
    try {
      const { nombre, email, password } = req.body;

      if (!nombre || !email || !password) {
        req.session.error = 'Todos los campos son obligatorios.';
        return res.redirect('/register');
      }

      const existe = await Usuario.findOne({ email: email.toLowerCase() });

      if (existe) {
        req.session.error = 'Ese correo ya está registrado.';
        return res.redirect('/register');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const usuario = await Usuario.create({
        nombre,
        email: email.toLowerCase(),
        password: passwordHash
      }).fetch();

      await Credito.create({
        usuario: usuario.id,
        saldo: 10,
        descripcion: 'Créditos iniciales gratis'
      });

      req.session.userId = usuario.id;
      return res.redirect('/dashboard');

    } catch (error) {
      console.error(error);
      req.session.error = 'Error creando la cuenta.';
      return res.redirect('/register');
    }
  },

  showLogin: async function(req, res) {
    return res.view('pages/login');
  },

  login: async function(req, res) {
    try {
      const { email, password } = req.body;

      const usuario = await Usuario.findOne({
        email: String(email).toLowerCase()
      });

      if (!usuario) {
        req.session.error = 'Correo o contraseña incorrectos.';
        return res.redirect('/login');
      }

      const ok = await bcrypt.compare(password, usuario.password);

      if (!ok) {
        req.session.error = 'Correo o contraseña incorrectos.';
        return res.redirect('/login');
      }

      req.session.userId = usuario.id;
      return res.redirect('/dashboard');

    } catch (error) {
      console.error(error);
      req.session.error = 'Error iniciando sesión.';
      return res.redirect('/login');
    }
  },

  logout: async function(req, res) {
    req.session.destroy(() => {
      return res.redirect('/');
    });
  }
};