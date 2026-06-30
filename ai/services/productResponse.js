// const { llm } = require("../config/gemini");
const { llm, embeddings } = require("../config/ollama");
const productResponsePrompt = require("../prompts/productResponsePrompt");

async function generateProductResponse(question, products) {

    const prompt = productResponsePrompt(question, products);

    const response = await llm.invoke(prompt);

    return response.content;
}

module.exports = generateProductResponse;