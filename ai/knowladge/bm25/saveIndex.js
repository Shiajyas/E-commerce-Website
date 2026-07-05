const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "bm25-index.json");

function saveIndex(indexData) {

    fs.writeFileSync(

        INDEX_PATH,

        JSON.stringify(indexData, null, 2),

        "utf8"

    );

    console.log("--------------------------------");
    console.log("BM25 Index Saved");
    console.log(INDEX_PATH);
    console.log("--------------------------------");

}

module.exports = {
    saveIndex
};