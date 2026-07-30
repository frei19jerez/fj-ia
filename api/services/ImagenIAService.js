const OpenAI = require('openai');

const client =
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== 'pon_tu_api_key_aqui' &&
  process.env.OPENAI_API_KEY !== 'sk-xxxxxxxxxxxxxxxxxxxxxxxx'
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    : null;

module.exports = {

  generarImagen: async function (
    prompt,
    estilo = 'realista'
  ) {

    /*
    |--------------------------------------------------------------------------
    | MODO DEMO
    |--------------------------------------------------------------------------
    */

    if (!client) {

      const texto = encodeURIComponent(
        `${estilo}: ${prompt}`.substring(0, 80)
      );

      return `https://placehold.co/1024x1024?text=${texto}`;

    }

    try {

      /*
      |--------------------------------------------------------------------------
      | PROMPT FINAL IA
      |--------------------------------------------------------------------------
      */

      const promptFinal = `
Crea una imagen profesional.

Estilo:
${estilo}

Descripción:
${prompt}

Alta calidad.
Muy detallada.
Iluminación cinematográfica.
Moderna.
Impactante.
      `;

      /*
      |--------------------------------------------------------------------------
      | GENERAR IMAGEN OPENAI
      |--------------------------------------------------------------------------
      */

      const response = await client.images.generate({

        model: 'gpt-image-1',

        prompt: promptFinal,

        size: '1024x1024',

        quality: 'medium',

        n: 1

      });

      /*
      |--------------------------------------------------------------------------
      | VALIDAR RESPUESTA
      |--------------------------------------------------------------------------
      */

      if (
        !response ||
        !response.data ||
        !response.data[0]
      ) {

        throw new Error(
          'La IA no devolvió ninguna imagen.'
        );

      }

      /*
      |--------------------------------------------------------------------------
      | BASE64
      |--------------------------------------------------------------------------
      */

      const imagenBase64 =
        response.data[0].b64_json;

      if (!imagenBase64) {

        throw new Error(
          'No se recibió la imagen en base64.'
        );

      }

      /*
      |--------------------------------------------------------------------------
      | RETORNAR DATA URL
      |--------------------------------------------------------------------------
      */

      return `data:image/png;base64,${imagenBase64}`;

    } catch (error) {

      console.error(
        'ERROR GENERANDO IMAGEN:',
        error
      );

      console.error(
        'STATUS:',
        error.status
      );

      console.error(
        'MESSAGE:',
        error.message
      );

      return `https://placehold.co/1024x1024?text=${encodeURIComponent(
        error.message || 'Error IA'
      )}`;

    }

  }

};