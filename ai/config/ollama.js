

const { ChatOllama, OllamaEmbeddings } = require("@langchain/ollama");
require("dotenv").config();

const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_URL,
    model: process.env.CHAT_MODEL,
    temperature: 0.3,
});

const embeddings = new OllamaEmbeddings({
    baseUrl: process.env.OLLAMA_URL,
    model: process.env.EMBEDDING_MODEL,
});

module.exports = {
    llm,
    embeddings,
};