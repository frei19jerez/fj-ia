require('dotenv').config();
const bcrypt = require('bcryptjs');
const Sails = require('sails').Sails;

const sails = new Sails();

sails.lift({
  hooks: { grunt: false },
  log: { level: 'warn' }
}, async function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  try {
    const email = 'admin@fj-ia.com';
    const existe = await Usuario.findOne({ email });

    if (!existe) {
      const password = await bcrypt.hash('Admin12345', 10);
      const admin = await Usuario.create({
        nombre: 'Administrador FJ-IA',
        email,
        password,
        rol: 'admin'
      }).fetch();

      await Credito.create({
        usuario: admin.id,
        saldo: 100,
        descripcion: 'Créditos admin iniciales'
      });

      console.log('Admin creado:', email, 'Clave: Admin12345');
    } else {
      console.log('El admin ya existe.');
    }
  } catch (e) {
    console.error(e);
  }

  sails.lower(() => process.exit(0));
});
