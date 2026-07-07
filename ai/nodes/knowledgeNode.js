const generateKnowledgeResponse =
    require("../services/knowledgeResponse");

const {
    hybridRetriever
} = require("../knowladge/retrieval/hybridRetriever");

async function knowledgeNode(state) {

    try {

        console.log("========================================");
        console.log("Inside Knowledge Node (DOMAIN MEMORY)");
        console.log("========================================");

        // =====================================================
        // Conversation Memory
        // =====================================================

        const memory = state.memory || {};

        const previousDocs =
            memory.knowledge?.docs || [];

        // =====================================================
        // Question
        // =====================================================

        const question =
            state.rewrittenQuestion ||
            state.question ||
            "";

        const lowerQuestion =
            question.toLowerCase();

        // =====================================================
        // Follow-up Detection
        // =====================================================

        const followUpPattern =
            /\b(it|its|this|that|these|those|they|them|how|why|when|where|advantages|benefits|disadvantages|drawbacks|more|details|detail|continue|expand|explain|simplify|works|work)\b/i;

        const isFollowUp =
            previousDocs.length > 0 &&
            followUpPattern.test(lowerQuestion);

        let docs;

        // =====================================================
        // Reuse Previous Documents
        // =====================================================

        if (isFollowUp) {

            console.log("Using Previous Knowledge Context");

            docs = previousDocs;

        } else {

            docs = await hybridRetriever(question, 5);

            console.log("Knowledge Retrieved:", docs.length);

        }

        // =====================================================
        // No Documents
        // =====================================================

        if (!docs || docs.length === 0) {

            return {

                ...state,

                intent: "KNOWLEDGE",

                answer:
                    "I couldn't find relevant information in the knowledge base.",

                memory: {

                    ...memory,

                    lastIntent: "KNOWLEDGE",

                    knowledge: {

                        docs: []

                    }

                }

            };

        }

        // =====================================================
        // Normalize Documents
        // =====================================================

        const cleanDocs = docs.map((doc, index) => ({

            id:
                doc.id ||
                `doc-${index}`,

            content:
                doc.content ||
                doc.pageContent ||
                "",

            source:
                doc.source ||
                "unknown",

            metadata:
                doc.metadata ||
                {},

            score:
                doc.rrfScore ??
                doc.score ??
                0

        }));

        // =====================================================
        // Generate Response
        // =====================================================

        const answer =
            await generateKnowledgeResponse(
                question,
                cleanDocs
            );

        // =====================================================
        // Save Memory
        // =====================================================

        return {

            ...state,

            intent: "KNOWLEDGE",

            answer,

            memory: {

                ...memory,

                lastIntent: "KNOWLEDGE",

                knowledge: {

                    docs: cleanDocs

                }

            }

        };

    }

    catch (error) {

        console.error("Knowledge Node Error:", error);

        return {

            ...state,

            intent: "ERROR",

            answer:
                "Sorry, I couldn't process your request."

        };

    }

}

module.exports = knowledgeNode;