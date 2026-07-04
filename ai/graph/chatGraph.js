const { StateGraph, START, END } = require("@langchain/langgraph");

const { GraphState } = require("./state");

const routerNode = require("../nodes/routerNode");

const productNode = require("../nodes/productNode");
const recommendationNode = require("../nodes/recommendationNode");
const analyticsNode = require("../nodes/analyticsNode");
const orderNode = require("../nodes/orderNode");
const accountNode = require("../nodes/accountNode");
const knowledgeNode = require("../nodes/knowledgeNode");
const generalNode = require("../nodes/generalNode");

const graph = new StateGraph(GraphState)

    // =============================
    // Nodes
    // =============================

    .addNode("router", routerNode)

    .addNode("product", productNode)

    .addNode("recommendation", recommendationNode)

    .addNode("analytics", analyticsNode)

    .addNode("order", orderNode)

    .addNode("account", accountNode)

    .addNode("knowledge", knowledgeNode)

    .addNode("general", generalNode)

    // =============================
    // Start
    // =============================

    .addEdge(START, "router")

    // =============================
    // Router
    // =============================

    .addConditionalEdges(
        "router",
        (state) => state.intent,
        {
            PRODUCT: "product",
            PRODUCT_RECOMMENDATION: "recommendation",
            ANALYTICS: "analytics",
            ORDER: "order",
            ACCOUNT: "account",
            KNOWLEDGE: "knowledge",
            GENERAL: "general"
        }
    )

    // =============================
    // End
    // =============================

    .addEdge("product", END)

    .addEdge("recommendation", END)

    .addEdge("analytics", END)

    .addEdge("order", END)

    .addEdge("account", END)

    .addEdge("knowledge", END)

    .addEdge("general", END);

module.exports = graph.compile();