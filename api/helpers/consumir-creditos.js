module.exports = {

  friendlyName: 'Consumir créditos',

  description: 'Modo gratis FJ-IA',

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

  fn: async function (inputs) {

    /*
    |--------------------------------------------------------------------------
    | FJ-IA GRATIS
    |--------------------------------------------------------------------------
    |
    | IA ilimitada mientras crece la plataforma.
    | Monetización por AdSense.
    |
    */

    sails.log('🚀 FJ-IA GRATIS ACTIVADO');

    return {
      ok: true,
      gratis: true
    };

  }

};