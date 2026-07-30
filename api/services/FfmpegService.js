const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

module.exports = {
  unirVideos: async function(listaVideos, salida) {
    // Base preparada para unir videos cuando tengas archivos reales.
    return new Promise((resolve) => {
      resolve({
        salida,
        videos: listaVideos,
        estado: 'pendiente'
      });
    });
  }
};
