const rewritePrompt = require("../prompts/rewritePrompt");
const { llm } = require("../config/ollama");

/**
 * Determine whether the current question
 * depends on previous conversation.
 */
function needsRewrite(question, history = []) {

    if (!history.length) {
        return false;
    }

    const q = question.toLowerCase().trim();

    const followUpPatterns = [

        /\bit\b/,
        /\bits\b/,
        /\bit's\b/,

        /\bthat\b/,
        /\bthis\b/,

        /\bthey\b/,
        /\bthem\b/,
        /\btheir\b/,

        /\bone\b/,
        /\bfirst\b/,
        /\bsecond\b/,
        /\bthird\b/,

        /\bwhich one\b/,
        /\bwhat about\b/,
        /\bhow about\b/,

        /\balso\b/,
        /\btoo\b/,
        /\bagain\b/,
        /\binstead\b/,

        /\bcompare\b/,
        /\bbetter\b/,
        /\bcheaper\b/,
        /\bexpensive\b/,

        /\bsame\b/,
        /\bprevious\b/,
        /\blast\b/,

        /\bhow does\b/,
        /\bhow do\b/,

        /\bwhy\b/,
        /\badvantages\b/,
        /\bbenefits\b/,
        /\bdisadvantages\b/,

        /\bsupport\b/,
        /\bcompatible\b/,

        /\bcan i\b/,
        /\bdoes it\b/,
        /\bis it\b/,
        /\bwill it\b/

    ];

    return followUpPatterns.some(regex => regex.test(q));

}

async function rewriteNode(state) {

    try {

        const history = state.chatHistory || [];

        const question = state.question;

        if (!needsRewrite(question, history)) {

            return {
                ...state,
                rewrittenQuestion: question
            };

        }

        console.log("\n================================");
        console.log("REWRITE NODE");
        console.log("================================");

        const historyText = history
            .slice(-8)
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n");

        const prompt = await rewritePrompt.formatMessages({

            history: historyText,

            question

        });

        const response = await llm.invoke(prompt);

        const rewritten =
            response.content.trim().replace(/^["']|["']$/g, "");

        console.log("Original :", question);
        console.log("Rewritten:", rewritten);

        return {

            ...state,

            rewrittenQuestion: rewritten || question

        };

    } catch (err) {

        console.error("Rewrite Node Error:", err);

        return {

            ...state,

            rewrittenQuestion: state.question

        };

    }

}

module.exports = rewriteNode;