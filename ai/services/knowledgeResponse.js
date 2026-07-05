

const { llm } = require("../config/ollama");

const knowledgePrompt = require("../prompts/knowledgePrompt");

async function generateKnowledgeResponse(question, documents) {

    if (!documents || documents.length === 0) {

        return "I couldn't find this information in the knowledge base.";

    }

    //---------------------------------------
    // Merge retrieved chunks
    //---------------------------------------

    const context = documents
        .map((doc, index) => {

            return `Source ${index + 1}
Page: ${doc.metadata.page}

${doc.content}`;

        })
        .join("\n\n----------------------------------------\n\n");

    //---------------------------------------
    // Ask LLM
    //---------------------------------------

    const response = await llm.invoke([

        {
            role: "system",
            content: knowledgePrompt(question, context)
        },

        {
            role: "user",
            content: question
        }

    ]);

    return response.content.trim();

}

module.exports = generateKnowledgeResponse;