
const { StateGraph, START, END } = require("@langchain/langgraph");

const { GraphState } = require("./state");

const routerNode = require("../nodes/routerNode");
const productNode = require("../nodes/productNode");
const knowledgeNode = require("../nodes/knowledgeNode");
const generalNode = require("../nodes/generalNode");

const graph = new StateGraph(GraphState)

    .addNode("router", routerNode)

    .addNode("product", productNode)

    .addNode("knowledge", knowledgeNode)

    .addNode("general", generalNode)

    .addEdge(START, "router")

    .addConditionalEdges(
        "router",
        (state) => state.intent,
        {
            PRODUCT: "product",
            KNOWLEDGE: "knowledge",
            GENERAL: "general"
        }
    )

    .addEdge("product", END)

    .addEdge("knowledge", END)

    .addEdge("general", END);

module.exports = graph.compile();