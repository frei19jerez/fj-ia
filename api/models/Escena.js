module.exports = {
  tableName: 'escenas',
  attributes: {
    titulo: { type: 'string', required: true, maxLength: 180 },
    descripcion: { type: 'string', required: true, columnType: 'text' },
    orden: { type: 'number', defaultsTo: 1 },
    imagenUrl: { type: 'string', allowNull: true },
    videoUrl: { type: 'string', allowNull: true },
    vozUrl: { type: 'string', allowNull: true },
    usuario: { model: 'Usuario', required: true },
    pelicula: { model: 'Pelicula', required: true }
  }
};
