const memoryManager = require("../memory/memoryManager");

async function memoryNode(state) {

    console.log("\n================================");
    console.log("MEMORY NODE");
    console.log("================================");

    try {

        if (!state.sessionId) {
            throw new Error("Session ID is required.");
        }

        const chatHistory =
            await memoryManager.getChatHistory(state.sessionId);

        console.log(chatHistory);

        return {
            ...state,
            chatHistory
        };

    } catch (error) {

        console.error("Memory Node Error:", error);

        return {
            ...state,
            chatHistory: []
        };

    }

}

module.exports = memoryNode;