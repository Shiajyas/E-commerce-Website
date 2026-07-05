require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./DB/dataBase");
const graph = require("./ai/graph/chatGraph");

const BM25 = require("./ai/knowladge/bm25/bm25");
const loadIndex = require("./ai/knowladge/bm25/loadIndex");

/**
 * Load BM25 index
 */
const indexData = loadIndex();

/**
 * Validate index
 */
if (!indexData?.index) {
    console.error("❌ Invalid BM25 index structure");
    process.exit(1);
}

/**
 * Initialize BM25 (IMPORTANT: currently unused unless injected)
 */
const bm25 = new BM25(indexData);

console.log("\n================================");
console.log("🚀 SYSTEM STARTING");
console.log("================================");
console.log("📄 Docs:", indexData.documents?.length || 0);
console.log("🔑 Terms:", Object.keys(indexData.index || {}).length);

(async () => {

    await connectDB();

    console.log("✅ MongoDB Connected");

    const questions = [
        "What is NVR?",
        "What is DVR?",
        "What is PoE?",
        "Difference between DVR and NVR",
        "How to install Hikvision camera?",
        "How to add camera?",
        "What is WDR?",
        "What is CCTV?",
        "What is ThinkThankz?"
    ];

    for (const question of questions) {

        console.log("\n================================");
        console.log("❓ Question:", question);

        try {

            /**
             * GRAPH EXECUTION
             * (BM25 is used INSIDE graph, not here)
             */
            const result = await graph.invoke({
                question
            });

            console.log("--------------------------------");
            console.log("💡 Answer:");
            console.log(result.answer);

        } catch (err) {

            console.error("❌ Graph Error:", err.message);

        }
    }

    await mongoose.disconnect();

    console.log("\n================================");
    console.log("🏁 TEST COMPLETED");
    console.log("================================");

})();