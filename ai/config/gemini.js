const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
require("dotenv").config();

const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
    temperature: 0.3,
    maxOutputTokens: 1024,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_EMBEDDING_MODEL,
});

module.exports = {
    llm,
    embeddings,
};