
// const { llm } = require("../config/gemini");
const { llm } = require("../config/ollama");

async function generalNode(state) {

    const result = await llm.invoke(state.question);

    return {

        ...state,

        answer: result.content

    };

}

module.exports = generalNode;