// const { llm } = require("../config/gemini");
const { llm, embeddings } = require("../config/ollama");

async function generalNode(state) {

    const result = await llm.invoke(state.question);

    return {

        response: result.content

    };

}

module.exports = generalNode;