const { Annotation } = require("@langchain/langgraph");

const GraphState = Annotation.Root({

    question: Annotation(),

    intent: Annotation(),

    filters: Annotation(),

    context: Annotation(),

    answer: Annotation()

});

module.exports = {
    GraphState
};