const { StateGraph, START, END } = require("@langchain/langgraph");

const { GraphState } = require("./state");

const routerNode = require("../nodes/routerNode");

const productNode = require("../nodes/productNode");
const analyticsNode = require("../nodes/analyticsNode");
const orderNode = require("../nodes/orderNode");
const accountNode = require("../nodes/accountNode");
const knowledgeNode = require("../nodes/knowledgeNode");
const generalNode = require("../nodes/generalNode");
const recommendationNode = require("../nodes/recommendationNode");

const graph = new StateGraph(GraphState)

    .addNode("router", routerNode)

    .addNode("product", productNode)

    .addNode("analytics", analyticsNode)

    .addNode("order", orderNode)

    .addNode("account", accountNode)

    .addNode("knowledge", knowledgeNode)

    .addNode("general", generalNode)

    .addNode("recommendation", recommendationNode)

    .addEdge(START, "router")

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

    .addEdge("product", END)

    .addEdge("analytics", END)

    .addEdge("order", END)

    .addEdge("account", END)

    .addEdge("knowledge", END)

    .addEdge("general", END);

module.exports = graph.compile();