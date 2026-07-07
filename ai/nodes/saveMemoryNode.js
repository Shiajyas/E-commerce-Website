const memoryManager = require("../memory/memoryManager");

async function saveMemoryNode(state) {
    try {
        const sessionId = state.sessionId;

        if (!sessionId) return state;

        // Save USER message
        await memoryManager.saveUserMessage(
            sessionId,
            state.question
        );

        // Save ASSISTANT message (if available)
        if (state.answer) {
            await memoryManager.saveAssistantMessage(
                sessionId,
                state.answer
            );
        }

        return state;

    } catch (err) {
        console.error("SaveMemory Error:", err);
        return state;
    }
}

module.exports = saveMemoryNode;