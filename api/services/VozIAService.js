module.exports = {
  generarVoz: async function(texto, voz = 'narrador') {
    // Aquí irá IA de voz.
    return {
      url: null,
      voz,
      texto,
      estado: 'pendiente'
    };
  }
};
