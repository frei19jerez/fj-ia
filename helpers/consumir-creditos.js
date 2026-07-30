module.exports = {

  friendlyName: 'Consumir créditos',

  description: 'Control de créditos FJ-IA',

  inputs: {

    usuarioId: {
      type: 'number',
      required: true
    },

    cantidad: {
      type: 'number',
      required: true
    },

    descripcion: {
      type: 'string',
      required: true
    }

  },

  exits: {

    success: {
      description: 'Créditos procesados.'
    }

  },

  fn: async function (inputs) {

    /*
    |--------------------------------------------------------------------------
    | MODO GRATIS ACTIVADO
    |--------------------------------------------------------------------------
    |
    | Mientras FJ-IA crece con AdSense y usuarios,
    | dejamos IA ilimitada.
    |
    */

    sails.log('🚀 MODO GRATIS FJ-IA');

    return {
      ok: true,
      gratis: true
    };

  }

};