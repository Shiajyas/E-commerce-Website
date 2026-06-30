
// const { llm } = require("../config/gemini");
const { llm, embeddings } = require("../config/ollama");
const routerPrompt = require("../prompts/routerPrompt");

async function routerNode(state) {

    const result = await llm.invoke([
        {
            role: "system",
            content: routerPrompt
        },
        {
            role: "user",
            content: state.question
        }
    ]);

    return {
        intent: result.content.trim().toUpperCase()
    };

}

module.exports = routerNode;