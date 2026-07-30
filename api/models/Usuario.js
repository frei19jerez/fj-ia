module.exports = {
  tableName: 'usuarios',
  attributes: {
    nombre: { type: 'string', required: true, maxLength: 120 },
    email: { type: 'string', required: true, unique: true, isEmail: true },
    password: { type: 'string', required: true, protect: true },
    rol: { type: 'string', defaultsTo: 'usuario' },
    activo: { type: 'boolean', defaultsTo: true },

    proyectos: { collection: 'Proyecto', via: 'usuario' },
    textos: { collection: 'Texto', via: 'usuario' },
    imagenes: { collection: 'Imagen', via: 'usuario' },
    videos: { collection: 'Video', via: 'usuario' },
    peliculas: { collection: 'Pelicula', via: 'usuario' }
  }
};
