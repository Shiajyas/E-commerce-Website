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

const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function embedText(text) {
    try {
        const response = await ai.models.embedContent({
            model: process.env.GEMINI_EMBEDDING_MODEL,
            contents: text,
        });

        return response.embeddings[0].values;
    } catch (error) {
        console.error("Embedding Error:", error.message);
        throw error;
    }
}

module.exports = {
    embedText,
};