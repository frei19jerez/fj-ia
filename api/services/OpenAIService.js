const OpenAI = require('openai');

/*
|--------------------------------------------------------------------------
| CLIENTE OPENAI
|--------------------------------------------------------------------------
*/

const client =
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== 'pon_tu_api_key_aqui' &&
  process.env.OPENAI_API_KEY !== 'sk-xxxxxxxxxxxxxxxxxxxxxxxx'
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    : null;

/*
|--------------------------------------------------------------------------
| SERVICIO IA - FJ-IA
|--------------------------------------------------------------------------
*/

module.exports = {

  generarTexto: async function (prompt, tipo = 'general') {
    if (!client) {
      return `
🚀 FJ-IA - Modo Demo

Tipo:
${tipo}

Idea recibida:
${prompt}

⚠️ La IA real todavía no está conectada.

Revisa tu archivo .env:

OPENAI_API_KEY=sk-proj-tu_clave_real_aqui

Luego reinicia:

Ctrl + C
nodemon app.js
      `;
    }

    try {
      const response = await client.responses.create({
        model: 'gpt-4o-mini',

        instructions: `
Eres FJ-IA, una inteligencia artificial profesional creada por Freimel Jerez.

Tu misión es ayudar a crear contenido útil, comercial y creativo.

Reglas:
- Responde siempre en español.
- Escribe con claridad.
- Organiza el contenido con títulos, listas o secciones cuando sea necesario.
- Si el usuario pide publicidad, crea textos listos para WhatsApp, Facebook o redes sociales.
- Si pide guion, separa escenas, narrador y diálogos.
- Si pide noticia, usa estructura de título, entradilla y desarrollo.
- Si pide historia, crea una narración atractiva.
- Si pide contenido general, responde de forma práctica y profesional.

No digas que eres ChatGPT. Tu nombre dentro de esta app es FJ-IA.
        `,

        input: `
Tipo solicitado:
${tipo}

Solicitud del usuario:
${prompt}
        `
      });

      return response.output_text || 'No se pudo generar contenido.';

    } catch (error) {
      console.error(error);

      if (error.status === 401) {
        return '❌ API KEY inválida. Revisa que la clave en .env esté completa y activa.';
      }

      if (error.status === 429) {
        return '❌ No hay créditos disponibles o se alcanzó el límite de uso en OpenAI.';
      }

      if (error.status === 404) {
        return '❌ El modelo no está disponible para esta cuenta. Estamos usando gpt-4o-mini, revise la cuenta API.';
      }

      return `
❌ Error conectando con OpenAI.

Revise:
1. Que OPENAI_API_KEY esté bien escrita.
2. Que tenga créditos activos en OpenAI.
3. Que haya reiniciado nodemon después de cambiar el .env.
      `;
    }
  }

};