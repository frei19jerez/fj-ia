module.exports = {

  tableName: 'videos',

  attributes: {

    prompt: {
      type: 'string',
      required: true,
      columnType: 'text'
    },

    contenido: {
      type: 'string',
      allowNull: true,
      columnType: 'text'
    },

    duracion: {
      type: 'number',
      defaultsTo: 15
    },

    url: {
      type: 'string',
      required: true
    },

    estado: {
      type: 'string',
      defaultsTo: 'generado'
    },

    usuario: {
      model: 'Usuario',
      required: true
    },

    proyecto: {
      model: 'Proyecto',
      required: true
    }

  }

};