module.exports = {

  tableName: 'textos',

  attributes: {

    prompt: {
      type: 'string',
      required: true,
      columnType: 'text'
    },

    tipo: {
      type: 'string',
      defaultsTo: 'general'
    },

    contenido: {
      type: 'string',
      required: true,
      columnType: 'text'
    },

    usuario: {
      model: 'Usuario',
      required: true
    },

    proyecto: {
      model: 'Proyecto',
      required: true
    },

    createdAt: {
      type: 'number',
      autoCreatedAt: true
    },

    updatedAt: {
      type: 'number',
      autoUpdatedAt: true
    }

  }

};