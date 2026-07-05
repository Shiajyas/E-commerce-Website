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
    // 1. ANALYTICS (Highest Priority)
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
    // 2. ORDER
    // ====================================================

    if (
        /\b(order|orders|track|tracking|delivery|shipping|refund|return|cancel|payment|purchase)\b/.test(q)
    ) {

        console.log("ROUTE -> ORDER");

        return {
            ...state,
            intent: "ORDER"
        };

    }

    // ====================================================
    // 3. ACCOUNT
    // ====================================================

    if (
        /\b(login|logout|register|signup|sign up|profile|account|change password|forgot password)\b/.test(q)
    ) {

        console.log("ROUTE -> ACCOUNT");

        return {
            ...state,
            intent: "ACCOUNT"
        };

    }

    // ====================================================
    // 4. KNOWLEDGE
    // ====================================================

    if (

        q.startsWith("what is") ||

        q.startsWith("what are") ||

        q.startsWith("how does") ||

        q.startsWith("how do") ||

        q.startsWith("how to") ||

        q.startsWith("why") ||

        q.startsWith("when") ||

        q.startsWith("where") ||

        q.includes("difference") ||

        q.includes("meaning") ||

        q.includes("define") ||

        q.includes("explain")

    ) {

        console.log("ROUTE -> KNOWLEDGE");

        return {
            ...state,
            intent: "KNOWLEDGE"
        };

    }

    // ====================================================
    // 5. PRODUCT RECOMMENDATION
    // ====================================================

    if (

        /\b(best|recommend|suggest|which|good|suitable|ideal)\b/.test(q)

        ||

        /\b(for home|for office|for shop|for warehouse|for hospital|for school|for outdoor|for indoor|for apartment|for parking)\b/.test(q)

    ) {

        console.log("ROUTE -> PRODUCT_RECOMMENDATION");

        return {
            ...state,
            intent: "PRODUCT_RECOMMENDATION"
        };

    }

    // ====================================================
    // 6. PRODUCT SEARCH
    // ====================================================

    if (

        /\b(show|find|search|buy|get|list|display|available)\b/.test(q)

        ||

        /\b(camera|cameras|bullet|dome|wifi|wireless|hikvision|cpplus|cp plus|nvr|dvr|ip camera|2mp|4mp|5mp|8mp|poe)\b/.test(q)

    ) {

        console.log("ROUTE -> PRODUCT");

        return {
            ...state,
            intent: "PRODUCT"
        };

    }

    // ====================================================
    // 7. GENERAL
    // ====================================================

    console.log("ROUTE -> GENERAL");

    return {
        ...state,
        intent: "GENERAL"
    };

}

module.exports = routerNode;