

const { Annotation } = require("@langchain/langgraph");

const GraphState = Annotation.Root({

    question: Annotation(),

    intent: Annotation(),

    context: Annotation(),

    response: Annotation(),

    userId: Annotation(),

    chatHistory: Annotation()

});

module.exports = {
    GraphState
};