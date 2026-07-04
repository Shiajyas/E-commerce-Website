const { llm } = require("../config/ollama");
const orderPrompt = require("../prompts/orderPrompt");
const parseJson = require("../utils/jsonParser");

const {
    normalizeQuery
} = require("../utils/queryNormalizer");

async function extractOrder(question) {

    const normalized = normalizeQuery(question);
    const q = normalized.toLowerCase();

    //-----------------------------------
    // Rule Based Action Detection
    //-----------------------------------

    let action = "";

    if (
        q.includes("track") ||
        q.includes("where is") ||
        q.includes("order status") ||
        q.includes("latest order") ||
        q.includes("recent order")
    ) {

        action = "track";

    }

    else if (

        q.includes("my orders") ||
        q.includes("order history") ||
        q.includes("purchase history") ||
        q.includes("previous orders")

    ) {

        action = "history";

    }

    else if (q.includes("cancel")) {

        action = "cancel";

    }

    else if (q.includes("return")) {

        action = "return";

    }

    else if (q.includes("refund")) {

        action = "refund";

    }

    else if (q.includes("payment")) {

        action = "payment";

    }

    else if (

        q.includes("delivery") ||
        q.includes("shipped") ||
        q.includes("shipping") ||
        q.includes("arrive")

    ) {

        action = "delivery";

    }

    //-----------------------------------
    // Rule Based Status Detection
    //-----------------------------------

    let status = "";

    if (q.includes("pending"))

        status = "Pending";

    else if (q.includes("processing"))

        status = "Processing";

    else if (q.includes("shipped"))

        status = "Shipped";

    else if (q.includes("delivered"))

        status = "Delivered";

    else if (
        q.includes("cancelled") ||
        q.includes("canceled")
    )

        status = "Cancelled";

    else if (q.includes("returned"))

        status = "Returned";

    //-----------------------------------
    // Order ID Detection
    //-----------------------------------

    let orderId = "";

    // Mongo ObjectId
    let match = normalized.match(/\b[a-fA-F0-9]{24}\b/);

    // Custom Order Number
    if (!match) {

        match = normalized.match(/\bORD[0-9A-Za-z]+\b/i);

    }

    if (match) {

        orderId = match[0];

    }

    //-----------------------------------
    // Ask LLM (only for product extraction)
    //-----------------------------------

    const response = await llm.invoke([
        {
            role: "system",
            content: orderPrompt
        },
        {
            role: "user",
            content: normalized
        }
    ]);

    let filters = parseJson(response.content);

    //-----------------------------------
    // Ignore Hallucinated Values
    //-----------------------------------

    const invalidOrderIds = new Set([
        "",
        "order",
        "orders",
        "my order",
        "my orders",
        "status",
        "track",
        "tracking",
        "latest",
        "recent",
        "delivery",
        "delivered",
        "shipping",
        "cancel",
        "refund",
        "payment",
        "history"
    ]);

    //-----------------------------------
    // Rule Based Wins
    //-----------------------------------

    filters.action = action || "track";

    filters.status = status;

    // NEVER trust LLM for order id
    filters.orderId = orderId;

    // Product comes from LLM only
    filters.product = (filters.product || "").trim();

    //-----------------------------------
    // Remove Invalid Product
    //-----------------------------------

    if (filters.product) {

        const invalidProducts = new Set([
            "order",
            "orders",
            "status",
            "track",
            "tracking",
            "latest",
            "recent",
            "delivery",
            "refund",
            "payment",
            "cancel",
            "return"
        ]);

        if (invalidProducts.has(filters.product.toLowerCase())) {

            filters.product = "";

        }

    }

    //-----------------------------------
    // Final Safety
    //-----------------------------------

    if (
        filters.orderId &&
        invalidOrderIds.has(filters.orderId.toLowerCase())
    ) {

        filters.orderId = "";

    }

    return {

        action: filters.action,
        status: filters.status,
        product: filters.product,
        orderId: filters.orderId

    };

}

module.exports = {
    extractOrder
};