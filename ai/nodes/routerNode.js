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
    // 1. ANALYTICS
    // ====================================================

    if (
        /\b(how many|count|total|average|avg|stock|available|max|min|highest|lowest|most expensive|cheapest)\b/.test(q)
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

        /\b(order|orders)\b/.test(q)

        ||

        /\b(track|tracking|status|shipping|delivery|delivered|dispatch|dispatched|shipped)\b/.test(q)

        ||

        /\b(cancel|refund|return|replace|exchange)\b/.test(q)

        ||

        /\b(my purchase|purchase history|my purchases|recent purchase|latest order)\b/.test(q)

    ) {

        console.log("ROUTE -> ORDER");

        return {

            ...state,

            intent: "ORDER"

        };

    }

    // ====================================================
    // 3. PRODUCT RECOMMENDATION
    // ====================================================

    if (

        /\b(best|recommend|suggest|which|good for|suitable|ideal)\b/.test(q)

        ||

        /\b(for home|for office|for shop|for warehouse|for hospital|for school|for parking|for apartment|for factory|for farm)\b/.test(q)

    ) {

        console.log("ROUTE -> PRODUCT_RECOMMENDATION");

        return {

            ...state,

            intent: "PRODUCT_RECOMMENDATION"

        };

    }

    // ====================================================
    // 4. PRODUCT
    // ====================================================

    if (

        /\b(show|find|search|buy|get|list|display)\b/.test(q)

        ||

        /\b(camera|cameras|bullet|dome|ptz|wireless|wifi|ip camera|dvr|nvr|recorder|hikvision|cpplus|prama|dahua)\b/.test(q)

    ) {

        console.log("ROUTE -> PRODUCT");

        return {

            ...state,

            intent: "PRODUCT"

        };

    }

    // ====================================================
    // 5. ACCOUNT
    // ====================================================

    if (

        /\b(login|logout|register|signup|sign up|forgot password|reset password|profile|account|change password)\b/.test(q)

    ) {

        console.log("ROUTE -> ACCOUNT");

        return {

            ...state,

            intent: "ACCOUNT"

        };

    }

    // ====================================================
    // 6. KNOWLEDGE
    // ====================================================

    if (

        q.startsWith("what is")

        ||

        q.startsWith("how does")

        ||

        q.startsWith("why")

        ||

        q.startsWith("when")

        ||

        q.includes("difference")

        ||

        q.includes("meaning")

    ) {

        console.log("ROUTE -> KNOWLEDGE");

        return {

            ...state,

            intent: "KNOWLEDGE"

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