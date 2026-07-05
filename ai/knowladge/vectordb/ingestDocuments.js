const crypto = require("crypto");

const { loadPDFDocuments } = require("../loaders/pdfLoder");
const { splitDocuments } = require("../splitter/textSplitter");
const { embedText } = require("../embeddings/embedding");
const { getCollection } = require("./chromaClient");

// ✅ BM25
const buildIndex = require("../bm25/invertedIndex");
const saveIndex = require("../bm25/saveIndex");

const BATCH_SIZE = 20;

async function ingestDocuments() {

    console.log("==================================");
    console.log("Loading PDFs...");
    console.log("==================================");

    const documents = await loadPDFDocuments();

    if (!documents.length) {
        console.log("No documents found.");
        return;
    }

    console.log(`Pages : ${documents.length}`);

    console.log("\n==================================");
    console.log("Splitting...");
    console.log("==================================");

    const chunks = await splitDocuments(documents);

    console.log(`Chunks : ${chunks.length}`);

    // ====================================================
    // Create ONE document array for BOTH BM25 and Chroma
    // ====================================================

    const docs = chunks.map(chunk => ({

        pageContent: chunk.pageContent.trim(),

        metadata: {

            source: chunk.metadata.source,

            page: chunk.metadata.loc?.pageNumber || 0

        }

    }));

    // ====================================================
    // Build BM25 Index
    // ====================================================

    console.log("\n==================================");
    console.log("Building BM25 Index...");
    console.log("==================================");

    const bm25Index = buildIndex(docs);

    saveIndex(bm25Index);

    console.log(`✅ BM25 Indexed ${docs.length} documents`);

    // ====================================================
    // Chroma
    // ====================================================

    const collection = await getCollection();

    console.log("\n==================================");
    console.log("Embedding & Saving to Chroma...");
    console.log("==================================");

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {

        const batch = docs.slice(i, i + BATCH_SIZE);

        const ids = [];
        const embeddings = [];
        const metadatas = [];
        const texts = [];

        for (const doc of batch) {

            const text = doc.pageContent;

            const id = crypto
                .createHash("md5")
                .update(text)
                .digest("hex");

            const embedding = await embedText(text);

            ids.push(id);

            texts.push(text);

            embeddings.push(embedding);

            metadatas.push(doc.metadata);

        }

        try {

            await collection.add({

                ids,

                documents: texts,

                embeddings,

                metadatas

            });

        } catch (err) {

            if (!err.message.toLowerCase().includes("duplicate")) {

                console.error(err.message);

            }

        }

        console.log(
            `Indexed ${Math.min(i + BATCH_SIZE, docs.length)} / ${docs.length}`
        );

    }

    console.log("\n==================================");
    console.log("Knowledge Base Ready");
    console.log("==================================");

    console.log("📄 Total Chunks :", docs.length);
    console.log("✅ BM25 Ready");
    console.log("✅ Chroma Ready");

}



module.exports = {
    ingestDocuments
};