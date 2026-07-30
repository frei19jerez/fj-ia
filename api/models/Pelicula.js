module.exports = {
  tableName: 'peliculas',
  attributes: {
    titulo: { type: 'string', required: true, maxLength: 180 },
    idea: { type: 'string', required: true, columnType: 'text' },
    genero: { type: 'string', defaultsTo: 'drama' },
    guion: { type: 'string', allowNull: true, columnType: 'text' },
    urlFinal: { type: 'string', allowNull: true },
    estado: { type: 'string', defaultsTo: 'borrador' },
    usuario: { model: 'Usuario', required: true },
    proyecto: { model: 'Proyecto', required: true },
    escenas: { collection: 'Escena', via: 'pelicula' }
  }
};
