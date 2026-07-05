require("dotenv").config();

const { ChromaClient } = require("chromadb");

const client = new ChromaClient({
    host: process.env.CHROMA_HOST || "localhost",
    port: Number(process.env.CHROMA_PORT || 8000),
    ssl: false
});

let collection = null;

async function getCollection() {

    if (collection) {
        return collection;
    }

    collection = await client.getOrCreateCollection({

        name: process.env.CHROMA_COLLECTION || "knowledge_base",

        metadata: {
            description: "ThinkThankz Knowledge Base"
        },

        // We generate embeddings using Gemini,
        // so Chroma should not create embeddings.
        embeddingFunction: null

    });

    console.log("✅ Connected to Chroma");
    console.log(`Collection : ${collection.name}`);

    return collection;

}

module.exports = {
    client,
    getCollection
};