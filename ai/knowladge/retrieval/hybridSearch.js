const { getCollection } = require("../vectordb/chromaClient");
const { embedText } = require("../embeddings/embedding");

function extractKeywords(question) {

    return question
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(word =>
            word.length > 2 &&
            ![
                "what",
                "where",
                "when",
                "which",
                "whose",
                "how",
                "why",
                "is",
                "are",
                "the",
                "this",
                "that",
                "my",
                "your",
                "their",
                "please",
                "show",
                "tell",
                "about"
            ].includes(word)
        );

}

async function hybridSearch(question, limit = 5) {

    const collection = await getCollection();

    const keywords = extractKeywords(question);

    console.log("--------------------------------");
    console.log("Keywords :", keywords.join(", "));
    console.log("--------------------------------");

    const finalResults = [];
    const seen = new Set();

    // ==========================================
    // STEP 1 : Keyword Search
    // ==========================================

    for (const word of keywords) {

        try {

            const result = await collection.get({

                whereDocument: {
                    $contains: word
                },

                include: [
                    "documents",
                    "metadatas"
                ]

            });

            if (!result.documents) continue;

            for (let i = 0; i < result.documents.length; i++) {

                const content = result.documents[i];

                if (seen.has(content)) continue;

                seen.add(content);

                finalResults.push({

                    content,

                    metadata: result.metadatas[i],

                    score: 0,

                    method: "keyword"

                });

            }

        } catch (err) {

            console.log("Keyword search failed:", word);

        }

    }

    console.log("Keyword Results :", finalResults.length);

    // ==========================================
    // STEP 2 : Vector Search
    // ==========================================

    const embedding = await embedText(question);

    const vector = await collection.query({

        queryEmbeddings: [embedding],

        nResults: limit,

        include: [
            "documents",
            "metadatas",
            "distances"
        ]

    });

    if (vector.documents.length) {

        const docs = vector.documents[0];
        const metas = vector.metadatas[0];
        const distances = vector.distances[0];

        for (let i = 0; i < docs.length; i++) {

            if (seen.has(docs[i])) continue;

            seen.add(docs[i]);

            finalResults.push({

                content: docs[i],

                metadata: metas[i],

                score: distances[i],

                method: "vector"

            });

        }

    }

    console.log("Total Results :", finalResults.length);

    // ==========================================
    // STEP 3 : Ranking
    // ==========================================

    finalResults.sort((a, b) => {

        if (a.method === "keyword" && b.method !== "keyword")
            return -1;

        if (a.method !== "keyword" && b.method === "keyword")
            return 1;

        return a.score - b.score;

    });

    console.log("--------------------------------");
    console.log("Returning :", Math.min(limit, finalResults.length));
    console.log("--------------------------------");

    return finalResults.slice(0, limit);

}

module.exports = {
    hybridSearch
};