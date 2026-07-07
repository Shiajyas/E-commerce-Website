const contextManager = require("../memory/context/contextManager");

async function contextNode(state) {

    try {

        console.log("\n================================");
        console.log("CONTEXT NODE (LOAD)");
        console.log("================================");

        const sessionId = state.sessionId;

        if (!sessionId) {
            throw new Error("Session ID missing in state");
        }

        // ============================================
        // Load persistent memory
        // ============================================

        const dbMemory =
            await contextManager.loadContext(sessionId);

        // ============================================
        // Existing runtime memory
        // ============================================

        const runtimeMemory =
            state.memory || {};

        // ============================================
        // Merge runtime + database memory
        // ============================================

                    const memory = {

    lastIntent:
        dbMemory.lastIntent ??
        runtimeMemory.lastIntent ??
        null,

    product: {

        filters: {

            ...(runtimeMemory.product?.filters || {}),

            ...(dbMemory.product?.filters || {})

        },

        products:
            dbMemory.product?.products?.length
                ? dbMemory.product.products
                : runtimeMemory.product?.products || []

    },

    recommendation: {

        filters: {

            ...(runtimeMemory.recommendation?.filters || {}),

            ...(dbMemory.recommendation?.filters || {})

        },

        products:
            dbMemory.recommendation?.products?.length
                ? dbMemory.recommendation.products
                : runtimeMemory.recommendation?.products || []

    },

    order: {

        filters: {

            ...(runtimeMemory.order?.filters || {}),

            ...(dbMemory.order?.filters || {})

        },

        orders:
            dbMemory.order?.orders?.length
                ? dbMemory.order.orders
                : runtimeMemory.order?.orders || []

    },

    knowledge: {

        docs:
            dbMemory.knowledge?.docs?.length
                ? dbMemory.knowledge.docs
                : runtimeMemory.knowledge?.docs || []

    },

    analytics: {

        result:
            dbMemory.analytics?.result ??
            runtimeMemory.analytics?.result ??
            null

    }

};
        console.log("Loaded Memory:");
        console.log("Loaded Memory:");

console.log({

    lastIntent: memory.lastIntent,

    productFilters: memory.product.filters,

    productCount: memory.product.products.length,

    recommendationCount:
        memory.recommendation.products.length,

    orderFilters: memory.order.filters,

    orderCount:
        memory.order.orders.length,

    knowledgeCount:
        memory.knowledge.docs.length,

    analytics:
        memory.analytics.result ? "Yes" : "No"

});

        return {

            ...state,

            memory

        };

    }

    catch (error) {

        console.error("Context Node Error:", error);
                return {

    ...state,

    memory: {

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

    }

};

    }

}

module.exports = contextNode;