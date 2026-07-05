const generateKnowledgeResponse = require("../services/knowledgeResponse");
const { hybridRetriever } = require("../knowladge/retrieval/hybridRetriever");

async function knowledgeNode(state) {
    try {
        console.log("========================================");
        console.log("Inside Knowledge Node");

        const question = state.question;

        if (!question) {
            throw new Error("Question is missing in state");
        }

        // -----------------------------------
        // HYBRID RETRIEVAL (BM25 + VECTOR + RRF)
        // -----------------------------------
        const docs = await hybridRetriever(question, 5);

        console.log("Knowledge Retrieved:", docs.length);

        if (!docs || docs.length === 0) {
            return {
                ...state,
                intent: "KNOWLEDGE",
                context: [],
                answer: "I couldn't find relevant information in the knowledge base."
            };
        }

        // -----------------------------------
        // Normalize docs for LLM
        // -----------------------------------
        const cleanDocs = docs.map((doc, index) => ({
            id: doc.id || `doc-${index}`,
            content: doc.content || doc.pageContent || "",
            source: doc.source || "unknown",
            metadata: doc.metadata || {},
            score: doc.rrfScore ?? doc.score ?? 0
        }));

        // -----------------------------------
        // Generate response
        // -----------------------------------
        const answer = await generateKnowledgeResponse(question, cleanDocs);

        return {
            ...state,
            intent: "KNOWLEDGE",
            context: cleanDocs,
            answer
        };

    } catch (error) {
        console.error("❌ Knowledge Node Error:", error);

        return {
            ...state,
            intent: "ERROR",
            answer: "Sorry, I couldn't process your request."
        };
    }
}

module.exports = knowledgeNode;