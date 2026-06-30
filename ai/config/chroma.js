require("dotenv").config();

const { ChromaClient } = require("chromadb");

console.log("HOST:", process.env.CHROMA_HOST);
console.log("PORT:", process.env.CHROMA_PORT);
console.log("COLLECTION:", process.env.CHROMA_COLLECTION);

const client = new ChromaClient({
    host: process.env.CHROMA_HOST || "localhost",
    port: parseInt(process.env.CHROMA_PORT || "8000", 10),
    ssl: false,
});

async function getCollection() {
    return await client.getOrCreateCollection({
        name: process.env.CHROMA_COLLECTION || "products",
        metadata: { description: "Product collection" },
        //stop default embedding function from being used
        embeddingFunction: null,
    });
}

module.exports = {
    client,
    getCollection,
};