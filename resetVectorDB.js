require("dotenv").config();

const { client, getCollection } = require("./ai/knowladge/vectordb/chromaClient");

async function resetVectorDB() {
    const collectionName =
        process.env.CHROMA_COLLECTION || "products";

    try {
        console.log("================================");
        console.log("Resetting Chroma Collection");
        console.log("================================");
        console.log("Collection:", collectionName);

        // Delete old collection (ignore if it doesn't exist)
        try {
            await client.deleteCollection({
                name: collectionName,
            });

            console.log("Old collection deleted.");
        } catch (err) {
            console.log("No existing collection found.");
        }

        // Create fresh collection
        await getCollection();

        console.log("--------------------------------");
        console.log("New collection created.");
        console.log("--------------------------------");

        console.log("Now run:");
        console.log("node ai/knowladge/embedKnowledge.js");

    } catch (err) {
        console.error(err);
    }
}

resetVectorDB();