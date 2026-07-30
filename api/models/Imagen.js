module.exports = {

  tableName: 'imagenes',

  attributes: {

    prompt: {
      type: 'string',
      required: true,
      columnType: 'text'
    },

    estilo: {
      type: 'string',
      defaultsTo: 'realista'
    },

    url: {
      type: 'string',
      required: true
    },

    archivoLocal: {
      type: 'string',
      allowNull: true
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