const { Annotation } = require("@langchain/langgraph");

const GraphState = Annotation.Root({

    // =====================================================
    // CORE INPUT
    // =====================================================

    question: Annotation(),
    rewrittenQuestion: Annotation(),

    // =====================================================
    // USER + SESSION
    // =====================================================

    userId: Annotation(),
    sessionId: Annotation(),

    // =====================================================
    // CONVERSATION HISTORY
    // =====================================================

    chatHistory: Annotation(),

    // =====================================================
    // ROUTING
    // =====================================================

    intent: Annotation(),
    previousIntent: Annotation(),
    selectedProduct: Annotation(),

    // =====================================================
    // TEMP FILTERS
    // =====================================================

    filters: Annotation(),

    // =====================================================
    // DOMAIN MEMORY
    // =====================================================

    memory: Annotation({
        defaultValue: () => ({
            lastIntent: null,

            product: {
                filters: {},
                products: []
            },

            recommendation: {
                filters: {},
                products: []
            },

            order: {
                filters: {},
                orders: []
            },

            knowledge: {
                docs: []
            },

            analytics: {
                result: null
            }
        })
    }),

    // =====================================================
    // RESPONSE
    // =====================================================

    answer: Annotation(),

    response: Annotation(),

    context: Annotation()

});

module.exports = {
    GraphState
};