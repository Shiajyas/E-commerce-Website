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

    // 👇 ADD THIS
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
    // FINAL RESPONSE
    // =====================================================

    answer: Annotation()

});

module.exports = {
    GraphState
};