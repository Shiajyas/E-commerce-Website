const { StateGraph, START, END } = require("@langchain/langgraph");
const { GraphState } = require("./state");

// =====================
// Conversation
// =====================
const memoryNode = require("../nodes/memoryNode");
const rewriteNode = require("../nodes/rewriteNode");

// =====================
// Context
// =====================
const contextNode = require("../nodes/contextNode");
const saveContextNode = require("../nodes/saveContextNode");

// =====================
// Router
// =====================
const routerNode = require("../nodes/routerNode");
const referenceResolverNode = require("../nodes/referenceResolverNode");

// =====================
// Business Nodes
// =====================
const productNode = require("../nodes/productNode");
const productDetailsNode = require("../nodes/productDetailsNode");
const recommendationNode = require("../nodes/recommendationNode");
const analyticsNode = require("../nodes/analyticsNode");
const orderNode = require("../nodes/orderNode");
const accountNode = require("../nodes/accountNode");
const knowledgeNode = require("../nodes/knowledgeNode");
const generalNode = require("../nodes/generalNode");

const graph = new StateGraph(GraphState)

    // =====================
    // Conversation
    // =====================
    .addNode("memoryLoader", memoryNode)
    .addNode("rewrite", rewriteNode)

    // =====================
    // Context
    // =====================
    .addNode("contextLoader", contextNode)
    .addNode("contextSaver", saveContextNode)

    // =====================
    // Router
    // =====================
    .addNode("router", routerNode)
    .addNode("referenceResolver", referenceResolverNode)

    // =====================
    // Business Nodes
    // =====================
    .addNode("product", productNode)
    .addNode("productDetails", productDetailsNode)
    .addNode("recommendation", recommendationNode)
    .addNode("analytics", analyticsNode)
    .addNode("order", orderNode)
    .addNode("account", accountNode)
    .addNode("knowledge", knowledgeNode)
    .addNode("general", generalNode)

    // =====================
    // Flow
    // =====================
    .addEdge(START, "memoryLoader")
    .addEdge("memoryLoader", "rewrite")
    .addEdge("rewrite", "contextLoader")
    .addEdge("contextLoader", "router")
    .addEdge("router", "referenceResolver")

    // =====================
    // Conditional Routing
    // =====================
    .addConditionalEdges(
        "referenceResolver",
        (state) => state.intent,
        {
            PRODUCT: "product",
            PRODUCT_DETAILS: "productDetails",
            PRODUCT_RECOMMENDATION: "recommendation",
            ANALYTICS: "analytics",
            ORDER: "order",
            ACCOUNT: "account",
            KNOWLEDGE: "knowledge",
            GENERAL: "general"
        }
    )

    // =====================
    // Save Context
    // =====================
    .addEdge("product", "contextSaver")
    .addEdge("productDetails", "contextSaver")
    .addEdge("recommendation", "contextSaver")
    .addEdge("analytics", "contextSaver")
    .addEdge("order", "contextSaver")
    .addEdge("account", "contextSaver")
    .addEdge("knowledge", "contextSaver")
    .addEdge("general", "contextSaver")

    .addEdge("contextSaver", END);

module.exports = graph.compile();