require("dotenv").config();

const crypto = require("crypto");

const connectDB = require("./DB/dataBase");
const loadIndex = require("./ai/knowladge/bm25/loadIndex");

const graph = require("./ai/graph/chatGraph");

async function runConversation(title, messages) {

    const sessionId = crypto.randomUUID();

    console.log("\n");
    console.log("========================================================");
    console.log(title);
    console.log("SESSION :", sessionId);
    console.log("========================================================");

    for (const question of messages) {

        console.log("\n----------------------------------------");
        console.log("USER :", question);
        console.log("----------------------------------------");

        const result = await graph.invoke({

            userId: "test-user",

            sessionId,

            question

        });

        console.log("\nRewritten Question:");
        console.log(result.rewrittenQuestion);

        console.log("\nIntent:");
        console.log(result.intent);

        console.log("\nAnswer:");
        console.log(result.answer || "No answer (stub node)");

        console.log("\n----------------------------------------");
    }

}

(async () => {

    try {

        console.log("================================");
        console.log("Connecting Database...");
        console.log("================================");

        await connectDB();

        console.log("\n================================");
        console.log("Loading BM25...");
        console.log("================================");

        await loadIndex();

        // =====================================================
        // PRODUCT
        // =====================================================

        await runConversation(

            "PRODUCT FLOW",

            [

                "Show me Hikvision cameras under ₹5000.",

                "Which one has night vision?",

                "Which one supports WiFi?",

                "Compare the first two."

            ]

        );

        // =====================================================
        // PRODUCT RECOMMENDATION
        // =====================================================

        await runConversation(

            "PRODUCT RECOMMENDATION",

            [

                "Recommend a camera for my office.",

                "It should support night vision.",

                "It should also have WiFi."

            ]

        );

        // =====================================================
        // KNOWLEDGE
        // =====================================================

        await runConversation(

            "KNOWLEDGE FLOW",

            [

                "What is PoE?",

                "How does it work?",

                "What are its advantages?"

            ]

        );

        // =====================================================
        // ORDER
        // =====================================================

        await runConversation(

            "ORDER FLOW",

            [

                "Track my latest order.",

                "Can I cancel it?",

                "When will it arrive?"

            ]

        );

        // =====================================================
        // ACCOUNT
        // =====================================================

        await runConversation(

            "ACCOUNT FLOW",

            [

                "I forgot my password.",

                "How can I reset it?"

            ]

        );

        // =====================================================
        // ANALYTICS
        // =====================================================

        await runConversation(

            "ANALYTICS FLOW",

            [

                "How many Hikvision cameras are available?",

                "Which brand has the highest stock?",

                "Average camera price?"

            ]

        );

        // =====================================================
        // GENERAL
        // =====================================================

        await runConversation(

            "GENERAL FLOW",

            [

                "Hello",

                "How are you?",

                "Thank you."

            ]

        );

        console.log("\n");
        console.log("================================");
        console.log("ALL TESTS COMPLETED");
        console.log("================================");

        process.exit(0);

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

})();