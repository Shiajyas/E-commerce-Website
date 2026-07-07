const { runChatGraph } = require("./graphEngine");

const handleChat = async ({ question, sessionId, userId }) => {

    console.log(`handleChat called with question: ${question}, sessionId: ${sessionId}, userId: ${userId}`);

    const result = await runChatGraph({
        question: question, 
        sessionId,
        userId
    });

    return {
        answer: result.answer
    };
};

module.exports = {
    handleChat
}