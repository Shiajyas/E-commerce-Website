const {
    extractOrder
} = require("../extractors/orderExtractor");

const {
    findLatestOrder,
    findAllOrders,
    findOrdersByStatus,
    findOrdersByProduct,
    findCancelledOrders,
    findDeliveredOrders,
    findPendingOrders
} = require("../repositories/orderRepository");

const orderResponse =
    require("../services/orderResponse");

const contextManager =
    require("../memory/context/contextManager");

async function orderNode(state) {

    console.log("========================================");
    console.log("Inside Order Node (CONTEXT AWARE)");

    // =====================================================
    // 1. USER CHECK
    // =====================================================

    if (!state.userId) {

        return {
            ...state,
            intent: "ORDER",
            answer: "Please login to view your orders."
        };

    }

    // =====================================================
    // 2. LOAD CONTEXT
    // =====================================================

    const memory = state.memory || {};

    const previousOrders =
        memory.order?.orders || [];

    const previousFilters =
        memory.order?.filters || {};

        const question =
    (
        state.rewrittenQuestion ||
        state.question ||
        ""
    );

const lowerQuestion =
    question.toLowerCase();

    // =====================================================
    // 3. FOLLOW-UP DETECTION
    // =====================================================

    const isFollowUp =
        previousOrders.length > 0 &&
        /(that|this|last|previous|it|status|update|track|same)/i.test(question);

    // =====================================================
    // 4. EXTRACT CURRENT FILTERS
    // =====================================================

    const currentFilters =
        await extractOrder(state.question);

    console.log("Current Filters:", currentFilters);
    console.log("Previous Filters:", previousFilters);

    // =====================================================
    // 5. MERGE FILTERS
    // =====================================================

    const mergedFilters =
        contextManager.mergeFilters(
            previousFilters,
            currentFilters
        );

    console.log("Merged Filters:", mergedFilters);

    let orders = [];

    // =====================================================
    // 6. FOLLOW-UP (NO DB CALL)
    // =====================================================

    if (isFollowUp) {

        console.log("Using Previous Orders From Context");

        orders = [...previousOrders];

        if (mergedFilters.status) {

            orders = orders.filter(order =>
                order.status &&
                order.status.toLowerCase() ===
                mergedFilters.status.toLowerCase()
            );

        }

    } else {

        // =====================================================
        // 7. DATABASE FLOW
        // =====================================================

        switch (mergedFilters.action) {

            case "track":

                if (mergedFilters.product) {

                    orders =
                        await findOrdersByProduct(
                            state.userId,
                            mergedFilters.product
                        );

                } else {

                    const latest =
                        await findLatestOrder(state.userId);

                    orders = latest ? [latest] : [];

                }

                break;

            case "history":

                orders =
                    await findAllOrders(state.userId);

                break;

            case "cancel":

                orders =
                    await findCancelledOrders(state.userId);

                break;

            case "delivery":

                orders =
                    await findDeliveredOrders(state.userId);

                break;

            case "pending":

                orders =
                    await findPendingOrders(state.userId);

                break;

            case "status":

                orders =
                    await findOrdersByStatus(
                        state.userId,
                        mergedFilters.status
                    );

                break;

            default:

                const latest =
                    await findLatestOrder(state.userId);

                orders = latest ? [latest] : [];

        }

    }

    console.log("Orders Found:", orders.length);

    // =====================================================
    // 8. GENERATE RESPONSE
    // =====================================================

    const answer =
        await orderResponse(
            state.question,
            orders
        );

    // =====================================================
    // 9. SAVE CONTEXT
    // =====================================================

    return {

        ...state,

        intent: "ORDER",

        memory: {

            ...memory,

            lastIntent: "ORDER",

            order: {

                filters: mergedFilters,

                orders

            }

        },

        answer

    };

}

module.exports = orderNode;