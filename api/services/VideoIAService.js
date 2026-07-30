const OpenAI = require('openai');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const client =
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== 'pon_tu_api_key_aqui'
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    : null;

function slugSeguro(texto) {
  return String(texto || 'video')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

function extraerJson(texto) {
  try {
    return JSON.parse(
      texto
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
    );
  } catch (error) {
    return null;
  }
}

async function generarVoz(texto, salidaAudio) {
  const mp3 = await client.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    input: texto.substring(0, 4000)
  });

  const buffer = Buffer.from(
    await mp3.arrayBuffer()
  );

  await fsp.writeFile(salidaAudio, buffer);
}

async function crearVideoConImagenes(imagenes, salidaPath, duracionTotal) {
  const carpetaSalida = path.dirname(salidaPath);
  const listaPath = path.join(carpetaSalida, `lista-${Date.now()}.txt`);

  const segundosPorImagen = Number(duracionTotal) / imagenes.length;

  const lineas = [];

  imagenes.forEach((imagenPath) => {
    const rutaSegura = imagenPath.replace(/\\/g, '/');
    lineas.push(`file '${rutaSegura}'`);
    lineas.push(`duration ${segundosPorImagen}`);
  });

  const ultimaImagen = imagenes[imagenes.length - 1].replace(/\\/g, '/');
  lineas.push(`file '${ultimaImagen}'`);

  await fsp.writeFile(listaPath, lineas.join('\n'), 'utf8');

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listaPath)
      .inputOptions([
        '-f concat',
        '-safe 0'
      ])
      .outputOptions([
        `-t ${duracionTotal}`,
        '-vf scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,format=yuv420p,setsar=1',
        '-r 30',
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-movflags +faststart'
      ])
      .save(salidaPath)
      .on('end', async () => {
        try {
          await fsp.unlink(listaPath);
        } catch (e) {}

        resolve();
      })
      .on('error', async (error) => {
        try {
          await fsp.unlink(listaPath);
        } catch (e) {}

        reject(error);
      });
  });
}

function unirVideoConVozYMusica(videoPath, vozPath, musicaPath, salidaFinalPath, duracionTotal) {
  return new Promise((resolve, reject) => {
    const existeMusica = fs.existsSync(musicaPath);

    const comando = ffmpeg()
      .input(videoPath)
      .input(vozPath);

    if (existeMusica) {
      comando.input(musicaPath);

      comando.complexFilter([
        `[1:a]apad=pad_dur=${duracionTotal}[voz]`,
        `[2:a]volume=0.12,apad=pad_dur=${duracionTotal}[musica]`,
        '[voz][musica]amix=inputs=2:duration=first:dropout_transition=2[audio]'
      ]);

      comando.outputOptions([
        '-map 0:v',
        '-map [audio]',
        '-c:v copy',
        '-c:a aac',
        `-t ${duracionTotal}`,
        '-movflags +faststart'
      ]);
    } else {
      comando.complexFilter([
        `[1:a]apad=pad_dur=${duracionTotal}[audio]`
      ]);

      comando.outputOptions([
        '-map 0:v',
        '-map [audio]',
        '-c:v copy',
        '-c:a aac',
        `-t ${duracionTotal}`,
        '-movflags +faststart'
      ]);
    }

    comando
      .save(salidaFinalPath)
      .on('end', resolve)
      .on('error', reject);
  });
}

module.exports = {

  crearVideoDesdeTexto: async function (prompt, duracion = 15) {
  if (!client) {
    return {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      estado: 'demo',
      contenido: 'Modo demo: falta OPENAI_API_KEY.',
      prompt,
      duracion
    };
  }

  try {
    const duracionFinal =
      Math.min(Math.max(Number(duracion || 15), 8), 40);

    const respuesta = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
Eres un director creativo experto en videos para TikTok, Reels, Shorts y Facebook.

Devuelve SOLO JSON válido.

Formato:
{
  "titulo": "...",
  "descripcion": "...",
  "hashtags": "...",
  "voz": "...",
  "escenas": [
    {
      "titulo": "...",
      "textoPantalla": "...",
      "promptImagen": "..."
    }
  ]
}

Crea exactamente 4 escenas.
Los prompts deben ser cinematográficos, modernos, detallados y horizontales 16:9.
          `
        },
        {
          role: 'user',
          content: `
Idea del video:
${prompt}

Duración:
${duracionFinal} segundos
          `
        }
      ],
      temperature: 0.9
    });

    const contenidoRaw =
      respuesta.choices[0].message.content;

    let data = extraerJson(contenidoRaw);

    if (!data || !Array.isArray(data.escenas)) {
      data = {
        titulo: 'Video creado con FJ-IA',
        descripcion: prompt,
        hashtags: '#FJIA #IA #VideoIA',
        voz: contenidoRaw,
        escenas: [
          {
            titulo: 'Escena 1',
            textoPantalla: 'Inicio poderoso',
            promptImagen: `${prompt}, escena inicial cinematográfica, 16:9`
          },
          {
            titulo: 'Escena 2',
            textoPantalla: 'Desarrollo visual',
            promptImagen: `${prompt}, escena intermedia dramática, 16:9`
          },
          {
            titulo: 'Escena 3',
            textoPantalla: 'Momento principal',
            promptImagen: `${prompt}, escena impactante, 16:9`
          },
          {
            titulo: 'Escena 4',
            textoPantalla: 'Cierre memorable',
            promptImagen: `${prompt}, escena final profesional, 16:9`
          }
        ]
      };
    }

    const nombreBase =
      `${Date.now()}-${slugSeguro(prompt)}`;

    const carpetaVideos =
      path.resolve(process.cwd(), 'assets', 'videos');

    const carpetaAudio =
      path.resolve(process.cwd(), 'assets', 'audio');

    const carpetaMusic =
      path.resolve(process.cwd(), 'assets', 'music');

    await fsp.mkdir(carpetaVideos, { recursive: true });
    await fsp.mkdir(carpetaAudio, { recursive: true });
    await fsp.mkdir(carpetaMusic, { recursive: true });

    const rutasImagenes = [];

    for (let i = 0; i < 4; i++) {
      const escena = data.escenas[i];

      const imagen = await client.images.generate({
        model: 'gpt-image-1',
        prompt: `
${escena.promptImagen}

Alta calidad.
Iluminación cinematográfica.
Moderno.
Impactante.
Sin texto dentro de la imagen.
        `,
        size: '1536x1024',
        quality: 'medium',
        n: 1
      });

      const imagenBase64 =
        imagen.data[0].b64_json;

      const imagenPath =
        path.join(carpetaVideos, `${nombreBase}-escena-${i + 1}.png`);

      await fsp.writeFile(
        imagenPath,
        Buffer.from(imagenBase64, 'base64')
      );

      rutasImagenes.push(imagenPath);
    }

    const videoSinAudioPath =
      path.join(carpetaVideos, `${nombreBase}-sin-audio.mp4`);

    await crearVideoConImagenes(
      rutasImagenes,
      videoSinAudioPath,
      duracionFinal
    );

    const vozPath =
      path.join(carpetaAudio, `${nombreBase}-voz.mp3`);

    await generarVoz(
      data.voz || data.descripcion || prompt,
      vozPath
    );

    const musicaPath =
      path.join(carpetaMusic, 'fondo.mp3');

    const videoFinalPath =
      path.join(carpetaVideos, `${nombreBase}-final.mp4`);

    await unirVideoConVozYMusica(
      videoSinAudioPath,
      vozPath,
      musicaPath,
      videoFinalPath,
      duracionFinal
    );

    const contenido = `
🎬 ${data.titulo}

📝 Descripción:
${data.descripcion}

🎙️ Voz en off:
${data.voz}

🎞️ Escenas:
${data.escenas.map((e, i) => `
${i + 1}. ${e.titulo}
Texto en pantalla: ${e.textoPantalla}
Prompt visual: ${e.promptImagen}
`).join('\n')}

🏷️ Hashtags:
${data.hashtags}
    `;

    return {
      url: `/videos/${nombreBase}-final.mp4`,
      estado: 'video-con-voz-y-musica',
      contenido,
      prompt,
      duracion: duracionFinal
    };

  } catch (error) {
    console.error('ERROR VIDEO IA REAL:', error);
    console.error('STATUS:', error.status);
    console.error('MESSAGE:', error.message);

    return {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      estado: 'error',
      contenido: error.message || 'No se pudo generar el video.',
      prompt,
      duracion
    };
  }
}

  
};