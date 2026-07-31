const OpenAI = require('openai');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { spawn } = require('child_process');

const client =
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== 'pon_tu_api_key_aqui'
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    : null;

/**
 * Convierte un texto en un nombre seguro para archivos.
 */
function slugSeguro(texto) {
  return String(texto || 'video')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

/**
 * Intenta convertir una respuesta de IA en JSON.
 */
function extraerJson(texto) {
  try {
    return JSON.parse(
      String(texto || '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()
    );
  } catch (error) {
    return null;
  }
}

/**
 * Escapa rutas utilizadas en archivos concat de FFmpeg.
 */
function escaparRutaConcat(rutaArchivo) {
  return String(rutaArchivo)
    .replace(/\\/g, '/')
    .replace(/'/g, "'\\''");
}

/**
 * Ejecuta el binario FFmpeg instalado en el sistema.
 *
 * No utiliza:
 * - fluent-ffmpeg
 * - ffmpeg-static
 */
function ejecutarFfmpeg(argumentos) {
  return new Promise((resolve, reject) => {
    const ejecutable =
      process.env.FFMPEG_PATH ||
      'ffmpeg';

    const proceso = spawn(
      ejecutable,
      argumentos,
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: [
          'ignore',
          'pipe',
          'pipe'
        ]
      }
    );

    let stdout = '';
    let stderr = '';
    let finalizado = false;

    proceso.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proceso.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proceso.on('error', (error) => {
      if (finalizado) {
        return;
      }

      finalizado = true;

      if (error.code === 'ENOENT') {
        return reject(
          new Error(
            'FFmpeg no está instalado o no se encuentra en el PATH del servidor.'
          )
        );
      }

      return reject(error);
    });

    proceso.on('close', (codigo) => {
      if (finalizado) {
        return;
      }

      finalizado = true;

      if (codigo === 0) {
        return resolve({
          ok: true,
          codigo,
          stdout,
          stderr
        });
      }

      return reject(
        new Error(
          [
            `FFmpeg terminó con código ${codigo}.`,
            stderr || stdout
          ]
            .filter(Boolean)
            .join(' ')
        )
      );
    });
  });
}

/**
 * Comprueba si FFmpeg está disponible.
 */
async function verificarFfmpeg() {
  try {
    await ejecutarFfmpeg([
      '-version'
    ]);

    return {
      ok: true,
      mensaje: 'FFmpeg disponible.'
    };
  } catch (error) {
    return {
      ok: false,
      mensaje: error.message
    };
  }
}

/**
 * Genera voz usando OpenAI.
 */
async function generarVoz(texto, salidaAudio) {
  if (!client) {
    throw new Error(
      'No se encontró OPENAI_API_KEY.'
    );
  }

  const contenido = String(texto || '')
    .trim()
    .substring(0, 4000);

  if (!contenido) {
    throw new Error(
      'No existe texto para generar la voz.'
    );
  }

  const respuesta =
    await client.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: contenido
    });

  const buffer = Buffer.from(
    await respuesta.arrayBuffer()
  );

  await fsp.writeFile(
    salidaAudio,
    buffer
  );
}

/**
 * Crea un video MP4 utilizando varias imágenes.
 */
async function crearVideoConImagenes(
  imagenes,
  salidaPath,
  duracionTotal
) {
  if (
    !Array.isArray(imagenes) ||
    imagenes.length === 0
  ) {
    throw new Error(
      'No existen imágenes para crear el video.'
    );
  }

  const carpetaSalida =
    path.dirname(salidaPath);

  const listaPath =
    path.join(
      carpetaSalida,
      `lista-${Date.now()}.txt`
    );

  const duracion =
    Number(duracionTotal);

  const segundosPorImagen =
    duracion / imagenes.length;

  const lineas = [];

  imagenes.forEach((imagenPath) => {
    const rutaSegura =
      escaparRutaConcat(imagenPath);

    lineas.push(
      `file '${rutaSegura}'`
    );

    lineas.push(
      `duration ${segundosPorImagen}`
    );
  });

  const ultimaImagen =
    escaparRutaConcat(
      imagenes[
        imagenes.length - 1
      ]
    );

  lineas.push(
    `file '${ultimaImagen}'`
  );

  await fsp.writeFile(
    listaPath,
    lineas.join('\n'),
    'utf8'
  );

  try {
    await ejecutarFfmpeg([
      '-y',

      '-f',
      'concat',

      '-safe',
      '0',

      '-i',
      listaPath,

      '-t',
      String(duracion),

      '-vf',
      [
        'scale=1280:720:force_original_aspect_ratio=increase',
        'crop=1280:720',
        'format=yuv420p',
        'setsar=1'
      ].join(','),

      '-r',
      '30',

      '-c:v',
      'libx264',

      '-pix_fmt',
      'yuv420p',

      '-movflags',
      '+faststart',

      salidaPath
    ]);
  } finally {
    try {
      await fsp.unlink(listaPath);
    } catch (error) {
      // El archivo pudo no haberse creado.
    }
  }
}

/**
 * Une video, voz y música.
 */
async function unirVideoConVozYMusica(
  videoPath,
  vozPath,
  musicaPath,
  salidaFinalPath,
  duracionTotal
) {
  const duracion =
    Number(duracionTotal);

  const existeMusica =
    fs.existsSync(musicaPath);

  if (existeMusica) {
    await ejecutarFfmpeg([
      '-y',

      '-i',
      videoPath,

      '-i',
      vozPath,

      '-i',
      musicaPath,

      '-filter_complex',
      [
        `[1:a]apad=pad_dur=${duracion}[voz]`,
        `[2:a]volume=0.12,apad=pad_dur=${duracion}[musica]`,
        '[voz][musica]amix=inputs=2:duration=first:dropout_transition=2[audio]'
      ].join(';'),

      '-map',
      '0:v',

      '-map',
      '[audio]',

      '-c:v',
      'copy',

      '-c:a',
      'aac',

      '-t',
      String(duracion),

      '-movflags',
      '+faststart',

      salidaFinalPath
    ]);

    return;
  }

  await ejecutarFfmpeg([
    '-y',

    '-i',
    videoPath,

    '-i',
    vozPath,

    '-filter_complex',
    `[1:a]apad=pad_dur=${duracion}[audio]`,

    '-map',
    '0:v',

    '-map',
    '[audio]',

    '-c:v',
    'copy',

    '-c:a',
    'aac',

    '-t',
    String(duracion),

    '-movflags',
    '+faststart',

    salidaFinalPath
  ]);
}

/**
 * Elimina archivos temporales sin detener el proceso.
 */
async function eliminarTemporales(rutas) {
  for (const rutaArchivo of rutas) {
    if (!rutaArchivo) {
      continue;
    }

    try {
      await fsp.unlink(rutaArchivo);
    } catch (error) {
      // El archivo pudo no existir.
    }
  }
}

module.exports = {

  /**
   * Permite comprobar desde otros módulos
   * si FFmpeg está disponible.
   */
  verificarFfmpeg,

  /**
   * Crea un video desde una idea escrita.
   */
  crearVideoDesdeTexto: async function (
    prompt,
    duracion = 15
  ) {
    const promptLimpio =
      String(prompt || '').trim();

    if (!promptLimpio) {
      return {
        url: null,
        estado: 'error',
        contenido:
          'Debes escribir una idea para crear el video.',
        prompt: promptLimpio,
        duracion
      };
    }

    if (!client) {
      return {
        url:
          'https://www.w3schools.com/html/mov_bbb.mp4',
        estado: 'demo',
        contenido:
          'Modo demo: falta OPENAI_API_KEY.',
        prompt: promptLimpio,
        duracion
      };
    }

    const estadoFfmpeg =
      await verificarFfmpeg();

    if (!estadoFfmpeg.ok) {
      return {
        url:
          'https://www.w3schools.com/html/mov_bbb.mp4',
        estado:
          'ffmpeg-no-disponible',
        contenido:
          'FJ-IA puede crear el guion, pero FFmpeg no está disponible en el servidor para construir el video final.',
        detalle:
          estadoFfmpeg.mensaje,
        prompt: promptLimpio,
        duracion
      };
    }

    const archivosTemporales = [];

    try {
      const duracionFinal =
        Math.min(
          Math.max(
            Number(duracion || 15),
            8
          ),
          40
        );

      const respuesta =
        await client.chat.completions.create({
          model: 'gpt-4.1-mini',

          messages: [
            {
              role: 'system',
              content: `
Eres un director creativo experto en videos para TikTok, Reels, Shorts y Facebook.

Devuelve únicamente JSON válido.

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

Crea exactamente cuatro escenas.

Los prompts visuales deben ser cinematográficos, modernos, detallados y horizontales en formato 16:9.
              `
            },
            {
              role: 'user',
              content: `
Idea del video:
${promptLimpio}

Duración:
${duracionFinal} segundos
              `
            }
          ],

          temperature: 0.9
        });

      const contenidoRaw =
        respuesta.choices?.[0]
          ?.message?.content ||
        '';

      let data =
        extraerJson(contenidoRaw);

      if (
        !data ||
        !Array.isArray(data.escenas) ||
        data.escenas.length < 4
      ) {
        data = {
          titulo:
            'Video creado con FJ-IA',

          descripcion:
            promptLimpio,

          hashtags:
            '#FJIA #IA #VideoIA',

          voz:
            contenidoRaw ||
            promptLimpio,

          escenas: [
            {
              titulo:
                'Escena 1',

              textoPantalla:
                'Inicio poderoso',

              promptImagen:
                `${promptLimpio}, escena inicial cinematográfica, formato 16:9`
            },
            {
              titulo:
                'Escena 2',

              textoPantalla:
                'Desarrollo visual',

              promptImagen:
                `${promptLimpio}, escena intermedia dramática, formato 16:9`
            },
            {
              titulo:
                'Escena 3',

              textoPantalla:
                'Momento principal',

              promptImagen:
                `${promptLimpio}, escena impactante, formato 16:9`
            },
            {
              titulo:
                'Escena 4',

              textoPantalla:
                'Cierre memorable',

              promptImagen:
                `${promptLimpio}, escena final profesional, formato 16:9`
            }
          ]
        };
      }

      data.escenas =
        data.escenas.slice(0, 4);

      const nombreBase =
        `${Date.now()}-${slugSeguro(promptLimpio)}`;

      const carpetaVideos =
        path.resolve(
          process.cwd(),
          'assets',
          'videos'
        );

      const carpetaAudio =
        path.resolve(
          process.cwd(),
          'assets',
          'audio'
        );

      const carpetaMusic =
        path.resolve(
          process.cwd(),
          'assets',
          'music'
        );

      await Promise.all([
        fsp.mkdir(
          carpetaVideos,
          { recursive: true }
        ),

        fsp.mkdir(
          carpetaAudio,
          { recursive: true }
        ),

        fsp.mkdir(
          carpetaMusic,
          { recursive: true }
        )
      ]);

      const rutasImagenes = [];

      for (let i = 0; i < 4; i++) {
        const escena =
          data.escenas[i];

        const imagen =
          await client.images.generate({
            model:
              'gpt-image-1',

            prompt: `
${escena.promptImagen}

Alta calidad.
Iluminación cinematográfica.
Estilo moderno.
Imagen impactante.
Sin texto dentro de la imagen.
            `,

            size:
              '1536x1024',

            quality:
              'medium',

            n: 1
          });

        const imagenBase64 =
          imagen.data?.[0]
            ?.b64_json;

        if (!imagenBase64) {
          throw new Error(
            `La escena ${i + 1} no devolvió una imagen válida.`
          );
        }

        const imagenPath =
          path.join(
            carpetaVideos,
            `${nombreBase}-escena-${i + 1}.png`
          );

        await fsp.writeFile(
          imagenPath,
          Buffer.from(
            imagenBase64,
            'base64'
          )
        );

        rutasImagenes.push(
          imagenPath
        );

        archivosTemporales.push(
          imagenPath
        );
      }

      const videoSinAudioPath =
        path.join(
          carpetaVideos,
          `${nombreBase}-sin-audio.mp4`
        );

      archivosTemporales.push(
        videoSinAudioPath
      );

      await crearVideoConImagenes(
        rutasImagenes,
        videoSinAudioPath,
        duracionFinal
      );

      const vozPath =
        path.join(
          carpetaAudio,
          `${nombreBase}-voz.mp3`
        );

      archivosTemporales.push(
        vozPath
      );

      await generarVoz(
        data.voz ||
        data.descripcion ||
        promptLimpio,
        vozPath
      );

      const musicaPath =
        path.join(
          carpetaMusic,
          'fondo.mp3'
        );

      const videoFinalPath =
        path.join(
          carpetaVideos,
          `${nombreBase}-final.mp4`
        );

      await unirVideoConVozYMusica(
        videoSinAudioPath,
        vozPath,
        musicaPath,
        videoFinalPath,
        duracionFinal
      );

      await eliminarTemporales(
        archivosTemporales
      );

      const contenido = `
🎬 ${data.titulo}

📝 Descripción:
${data.descripcion}

🎙️ Voz en off:
${data.voz}

🎞️ Escenas:
${data.escenas
  .map(
    (escena, indice) => `
${indice + 1}. ${escena.titulo}
Texto en pantalla: ${escena.textoPantalla}
Prompt visual: ${escena.promptImagen}
`
  )
  .join('\n')}

🏷️ Hashtags:
${data.hashtags}
      `.trim();

      return {
        url:
          `/videos/${nombreBase}-final.mp4`,

        estado:
          'video-con-voz-y-musica',

        contenido,

        prompt:
          promptLimpio,

        duracion:
          duracionFinal
      };

    } catch (error) {
      await eliminarTemporales(
        archivosTemporales
      );

      console.error(
        '❌ FJ-IA: Error creando video:',
        error
      );

      return {
        url:
          'https://www.w3schools.com/html/mov_bbb.mp4',

        estado:
          'error',

        contenido:
          error.message ||
          'No se pudo generar el video.',

        prompt:
          promptLimpio,

        duracion
      };
    }
  }

};