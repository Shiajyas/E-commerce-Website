const BM25 = require("../bm25/bm25");
const loadIndex = require("../bm25/loadIndex");
const { queryKnowledge } = require("../vectordb/queryKnowledge");
const { reciprocalRankFusion } = require("../fusion/reciprocalRankFusion");

let bm25 = null;

// ✅ AUTO INIT ON IMPORT (VERY IMPORTANT)
(function initBM25() {
    try {
        const indexData = loadIndex();

        if (indexData && indexData.index) {
            bm25 = new BM25(indexData);
            console.log("✅ BM25 Initialized");
        } else {
            console.log("⚠️ Invalid BM25 index");
        }
    } catch (err) {
        console.error("❌ BM25 Init Failed:", err.message);
    }
})();

async function hybridRetriever(question, limit = 5) {

    // ---------------- BM25 ----------------
    let bm25Results = [];

    if (bm25) {
        bm25Results = bm25.search(question, limit).map(r => ({
            id: `bm25-${r.docId}`,
            content: r.document.pageContent || r.document.content,
            metadata: r.document.metadata || {},
            score: r.score,
            source: "bm25"
        }));
    }

    // ---------------- VECTOR ----------------
    const vectorResults = await queryKnowledge(question, limit);

    const vectors = vectorResults.map((doc, i) => ({
        id: doc.metadata?.id || `vector-${i}`,
        content: doc.content,
        metadata: doc.metadata,
        score: doc.score,
        source: "vector"
    }));

    // ---------------- FUSION ----------------
    return reciprocalRankFusion([bm25Results, vectors], limit);
}

module.exports = { hybridRetriever };