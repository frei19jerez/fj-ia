module.exports = {
  friendlyName: 'Helper FJ-IA',

  description: 'Helper preparado para FJ-IA.',

  inputs: {},

  exits: {
    success: { outputFriendlyName: 'Resultado' }
  },

  fn: async function(inputs, exits) {
    return exits.success(true);
  }
};
