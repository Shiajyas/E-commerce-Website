const { runChatGraph } = require("./graphEngine");

const handleChat = async ({ question, sessionId, userId }) => {

    const result = await runChatGraph({
        question,
        sessionId,
        userId
    });

    return {
        answer: result.answer,
        products: result.products,
        analytics: result.analytics,
        orders: result.orders
    };
};

module.exports = {
    handleChat
};