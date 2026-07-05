const { getCollection } = require("./chromaClient");
const { embedText } = require("../embeddings/embedding");

async function queryKnowledge(question, limit = 5) {

    const collection = await getCollection();

    const embedding = await embedText(question);

    const results = await collection.query({
        queryEmbeddings: [embedding],
        nResults: limit,
        include: [
            "documents",
            "metadatas",
            "distances"
        ]
    });

    const docs = [];

    if (
        !results.documents ||
        !results.documents.length ||
        !results.documents[0].length
    ) {
        return docs;
    }

    const documents = results.documents[0];
    const metadatas = results.metadatas[0];
    const distances = results.distances[0];

    for (let i = 0; i < documents.length; i++) {

        docs.push({
            content: documents[i],
            metadata: metadatas[i],
            score: distances[i]
        });

    }

    return docs;
}

module.exports = {
    queryKnowledge
};