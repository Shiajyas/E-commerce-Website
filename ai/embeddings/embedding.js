// const { GoogleGenAI } = require("@google/genai");
// require("dotenv").config();

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY,
// });

// async function embedText(text) {
//     try {
//         const response = await ai.models.embedContent({
//             model: process.env.GEMINI_EMBEDDING_MODEL,
//             contents: text,
//         });

//         return response.embeddings[0].values;
//     } catch (error) {
//         console.error("Embedding Error:", error.message);
//         throw error;
//     }
// }

// module.exports = {
//     embedText,
// };

const ollama = require("ollama").default;
require("dotenv").config();

ollama.config.host = process.env.OLLAMA_URL;

async function embedText(text) {

    try {

        const response = await ollama.embed({

            model: process.env.EMBEDDING_MODEL,

            input: text

        });

        return response.embeddings[0];

    } catch (err) {

        console.error(err);

        throw err;

    }

}

module.exports = { embedText };