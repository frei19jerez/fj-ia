module.exports = {
  tableName: 'proyectos',
  attributes: {
    titulo: { type: 'string', required: true, maxLength: 180 },
    descripcion: { type: 'string', allowNull: true },
    tipo: { type: 'string', isIn: ['texto', 'imagen', 'video', 'pelicula'], required: true },
    estado: { type: 'string', defaultsTo: 'borrador' },
    usuario: { model: 'Usuario', required: true },

    textos: { collection: 'Texto', via: 'proyecto' },
    imagenes: { collection: 'Imagen', via: 'proyecto' },
    videos: { collection: 'Video', via: 'proyecto' },
    peliculas: { collection: 'Pelicula', via: 'proyecto' }
  }
};
