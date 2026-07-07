

const graph = require("../ai/graph/chatGraph")

// adjust path to where your compiled graph file is

const runChatGraph = async ({ question, sessionId,userId }) => {


    console.log("Running chat graph with message:", question, "and sessionId:", sessionId);

    try {

        const initialState = {
            question: question,
            sessionId,
            userId: userId, // Assuming userId is the same as sessionId for now
            intent: null,
            memory: [],
            context: {},
            response: null
        };

        const result = await graph.invoke(initialState);

        return {
            answer: result.response || result.answer || "No response generated",
            raw: result
        };

    } catch (err) {
        console.error("Graph Engine Error:", err);

        return {
            answer: "AI engine error occurred"
        };
    }
};

module.exports = {
    runChatGraph
};