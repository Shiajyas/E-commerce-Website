

let bm25Instance = null;

function setBM25(instance) {
    bm25Instance = instance;
}

function getBM25() {
    return bm25Instance;
}

module.exports = {
    setBM25,
    getBM25
};