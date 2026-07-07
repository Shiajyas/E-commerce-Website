const { llm } = require("../config/ollama");

async function generalNode(state) {

    console.log("========================================");
    console.log("Inside General Node (SAFE FALLBACK)");
    console.log("========================================");

    const memory = state.memory || {};
    const history = state.chatHistory || [];

    // =====================================================
    // Conversation History
    // =====================================================

    const historyText = history
        .slice(-6)
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

    // =====================================================
    // Prompt
    // =====================================================

    const prompt = `
You are a helpful AI assistant inside an e-commerce application.

Rules:
- Be concise.
- Never invent products, prices, orders, analytics or account information.
- Product, Recommendation, Order, Analytics and Knowledge questions are handled by specialized modules.
- If the question is ambiguous, ask one clarification question.
- Use conversation history when helpful.

Conversation History:
${historyText}

User:
${state.question}

Answer:
`;

    const result = await llm.invoke(prompt);

    return {

        ...state,

        intent: "GENERAL",

        answer: result.content,

        memory: {

            ...memory,

            lastIntent: "GENERAL"

        }

    };

}

module.exports = generalNode;