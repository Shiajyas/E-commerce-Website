const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

// Default settings
const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_CHUNK_OVERLAP = 150;

const splitter = new RecursiveCharacterTextSplitter({

    chunkSize: DEFAULT_CHUNK_SIZE,

    chunkOverlap: DEFAULT_CHUNK_OVERLAP,

    separators: [

        "\n\n",
        "\n",
        ". ",
        "? ",
        "! ",
        "; ",
        ", ",
        " ",
        ""

    ]

});

/**
 * Split LangChain Documents into chunks
 *
 * @param {Array<Document>} documents
 * @returns {Promise<Array<Document>>}
 */

async function splitDocuments(documents = []) {

    if (!documents.length) {

        console.log("No documents to split.");

        return [];

    }

    const chunks = await splitter.splitDocuments(documents);

    console.log("--------------------------------");
    console.log(`Original Documents : ${documents.length}`);
    console.log(`Generated Chunks   : ${chunks.length}`);
    console.log("--------------------------------");

    return chunks;

}

/**
 * Split plain text
 *
 * Useful for testing.
 */

async function splitText(text = "") {

    if (!text.trim()) return [];

    return await splitter.splitText(text);

}

module.exports = {

    splitDocuments,

    splitText

};