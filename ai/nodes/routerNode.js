const VALID_INTENTS = new Set([
    "PRODUCT",
    "PRODUCT_RECOMMENDATION",
    "ANALYTICS",
    "ORDER",
    "ACCOUNT",
    "KNOWLEDGE",
    "GENERAL"
]);


function normalize(q = "") {
    return String(q)
        .toLowerCase()
        .trim();
}

function routerNode(state) {

    const q = normalize(state.question);

    console.log("========== ROUTER ==========");
    console.log("QUESTION:", state.question);

    // ====================================================
    // 1. ANALYTICS (HIGHEST PRIORITY)
    // ====================================================

    if (
        /\b(how many|count|total|average|avg|stock|available|max|min|highest|lowest)\b/.test(q)
    ) {
        console.log("ROUTE -> ANALYTICS");

        return {
            ...state,
            intent: "ANALYTICS"
        };
    }

    // ====================================================
    // 2. PRODUCT RECOMMENDATION (use case based)
    // ====================================================

    if (
        /\b(best|recommend|suggest|which|good for|suitable)\b/.test(q) ||
        /\b(for home|for office|for shop|for warehouse|for hospital|for school)\b/.test(q)
    ) {
        console.log("ROUTE -> PRODUCT_RECOMMENDATION");

        return {
            ...state,
            intent: "PRODUCT_RECOMMENDATION"
        };
    }

    // ====================================================
    // 3. PRODUCT SEARCH (direct product intent)
    // ====================================================

    if (
        /\b(show|find|search|buy|get|list)\b/.test(q) ||
        /\b(camera|cameras|dvr|nvr|bullet|dome|wifi)\b/.test(q)
    ) {
        console.log("ROUTE -> PRODUCT");

        return {
            ...state,
            intent: "PRODUCT"
        };
    }

    // ====================================================
    // 4. KNOWLEDGE
    // ====================================================

    if (
        q.startsWith("what is") ||
        q.startsWith("how does") ||
        q.startsWith("why") ||
        q.includes("meaning") ||
        q.includes("difference")
    ) {
        console.log("ROUTE -> KNOWLEDGE");

        return {
            ...state,
            intent: "KNOWLEDGE"
        };
    }

    // ====================================================
    // 5. GENERAL
    // ====================================================

    console.log("ROUTE -> GENERAL");

    return {
        ...state,
        intent: "GENERAL"
    };
}

module.exports = routerNode;
