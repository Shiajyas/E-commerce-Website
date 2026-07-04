const { Annotation } = require("@langchain/langgraph");

const GraphState = Annotation.Root({

    // User message
    question: Annotation(),

    // Logged-in user
    userId: Annotation(),

    // Session / conversation
    sessionId: Annotation(),

    // Router intent
    intent: Annotation(),

    // Extracted filters
    filters: Annotation(),

    // Products / Orders / Docs
    context: Annotation(),

    // Final answer
    answer: Annotation(),

    // Optional conversation history
    history: Annotation()

});

module.exports = {
    GraphState
};