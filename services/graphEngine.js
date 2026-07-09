const graph = require("../ai/graph/chatGraph");

const runChatGraph = async ({ question, sessionId, userId }) => {

    console.log("================================");
    console.log("Running Chat Graph");
    console.log({
        question,
        sessionId,
        userId
    });
    console.log("================================");

    try {

        const initialState = {
            question,
            sessionId,
            userId,
            intent: null,
            answer: ""
        };

        const finalState = await graph.invoke(initialState);

        console.log("========== FINAL GRAPH STATE ==========");
        console.dir(finalState, { depth: null });

        console.log("\nRecommendation Products:");
        console.dir(
            finalState.memory?.recommendation?.products,
            { depth: null }
        );

        console.log("\nProduct Products:");
        console.dir(
            finalState.memory?.product?.products,
            { depth: null }
        );

        // ======================================
        // Select Correct Products
        // ======================================

        let products = [];

        if (
            finalState.memory?.recommendation?.products &&
            finalState.memory.recommendation.products.length > 0
        ) {

            products = finalState.memory.recommendation.products;

        }
        else if (
            finalState.memory?.product?.products &&
            finalState.memory.product.products.length > 0
        ) {

            products = finalState.memory.product.products;

        }

        console.log("\nProducts Returned To Frontend:");
        console.dir(products, { depth: null });

        return {

            answer: finalState.answer || "",

            products,

            analytics:
                finalState.memory?.analytics?.result || null,

            orders:
                finalState.memory?.order?.orders || [],

            memory: finalState.memory,

            intent: finalState.intent,

            raw: finalState

        };

    }

    catch (err) {

        console.error("Graph Engine Error:");
        console.error(err);

        return {

            answer: "AI engine error occurred",

            products: [],

            analytics: null,

            orders: [],

            memory: {},

            intent: null

        };

    }

};

module.exports = {
    runChatGraph
};