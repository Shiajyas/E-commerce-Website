

const {
    tokenize,
    termFrequency,
    uniqueTokens
} = require("./tokenizer");

/**
 * Build an inverted index from document chunks.
 *
 * Returns:
 * {
 *   documents,
 *   index,
 *   documentFrequency,
 *   documentLengths,
 *   averageDocumentLength,
 *   totalDocuments
 * }
 */
function buildIndex(documents = []) {

    const index = {};

    const documentFrequency = {};

    const documentLengths = {};

    let totalLength = 0;

    documents.forEach((doc, docId) => {

        const content = doc.pageContent || doc.content || "";

        const tokens = tokenize(content);

        const tf = termFrequency(tokens);

        const unique = uniqueTokens(tokens);

        documentLengths[docId] = tokens.length;

        totalLength += tokens.length;

        // Build inverted index
        for (const token of unique) {

            if (!index[token]) {

                index[token] = [];

            }

            index[token].push({

                docId,

                tf: tf[token]

            });

            documentFrequency[token] =
                (documentFrequency[token] || 0) + 1;
        }

    });

    const averageDocumentLength =
        documents.length === 0
            ? 0
            : totalLength / documents.length;

    return {

        documents,

        index,

        documentFrequency,

        documentLengths,

        averageDocumentLength,

        totalDocuments: documents.length

    };

}

module.exports = {
    buildIndex
};