const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "bm25-index.json");

function loadIndex() {
    console.log("LOADING BM25 FROM:", INDEX_PATH);

    try {
        if (!fs.existsSync(INDEX_PATH)) {
            console.log("⚠️ Index file not found");
            return createEmptyIndex();
        }

        const raw = fs.readFileSync(INDEX_PATH, "utf8");

        if (!raw || raw.trim() === "") {
            console.log("⚠️ Empty index file");
            return createEmptyIndex();
        }

        const index = JSON.parse(raw);

        console.log("--------------------------------");
        console.log("BM25 Index Loaded Successfully");
        console.log("--------------------------------");

        return validate(index);

    } catch (err) {
        console.error("❌ BM25 Load Error:", err.message);
        return createEmptyIndex();
    }
}

function validate(index) {
    return {
        documents: index.documents || [],
        index: index.index || {},
        documentFrequency: index.documentFrequency || {},
        documentLengths: index.documentLengths || {},
        averageDocumentLength: index.averageDocumentLength || 1,
        totalDocuments: index.totalDocuments || 0
    };
}

function createEmptyIndex() {
    return {
        documents: [],
        index: {},
        documentFrequency: {},
        documentLengths: {},
        averageDocumentLength: 1,
        totalDocuments: 0
    };
}

module.exports = loadIndex;