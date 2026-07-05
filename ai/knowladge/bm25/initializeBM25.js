

// bm25/initBM25.js
const BM25 = require("./bm25");
const loadIndex = require("./loadIndex");

let bm25 = null;

function initializeBM25() {

    const indexData = loadIndex();

    bm25 = new BM25(indexData);

    console.log("✅ BM25 Initialized");
    console.log("Docs:", indexData.documents.length);
    console.log("Terms:", Object.keys(indexData.index).length);

}

function getBM25() {
    return bm25;
}

module.exports = {
    initializeBM25,
    getBM25
};