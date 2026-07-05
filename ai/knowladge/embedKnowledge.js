require("dotenv").config();

const crypto = require("crypto");

const { loadDocuments } = require("./loaders/pdfLoder");
const { splitDocuments } = require("./splitter/textSplitter");

const { embedText } = require("./embeddings/embedding");
const { getCollection } = require("./vectordb/chromaClient");

// BM25
const {buildIndex} = require("./bm25/invertedIndex");
const {saveIndex }= require("./bm25/saveIndex");

(async () => {

    try {

        console.log("==================================");
        console.log("Loading Documents...");
        console.log("==================================");

        const documents = await loadDocuments();

        if (!documents.length) {

            console.log("No documents found.");
            process.exit(0);

        }

        console.log("Documents :", documents.length);

        console.log("\n==================================");
        console.log("Splitting...");
        console.log("==================================");

        const chunks = await splitDocuments(documents);

        console.log("Chunks :", chunks.length);

        // ============================================
        // Prepare documents once for BM25 & Chroma
        // ============================================

        const docs = chunks.map(chunk => ({

            pageContent: chunk.pageContent.trim(),

            metadata: {

                source: chunk.metadata.source || "Unknown",

                page: chunk.metadata.loc?.pageNumber || 1

            }

        }));

        // ============================================
        // Build BM25 Index
        // ============================================

        console.log("\n==================================");
        console.log("Building BM25 Index...");
        console.log("==================================");

        const bm25Index = buildIndex(docs);

        saveIndex(bm25Index);

        console.log("✅ BM25 Index Created");
        console.log("Indexed Documents :", docs.length);

        // ============================================
        // Connect Chroma
        // ============================================

        console.log("\n==================================");
        console.log("Connecting Chroma...");
        console.log("==================================");

        const collection = await getCollection();

        console.log("Collection :", collection.name);

        console.log("\n==================================");
        console.log("Embedding & Saving...");
        console.log("==================================");

        let success = 0;

        for (let i = 0; i < docs.length; i++) {

            const doc = docs[i];

            const embedding = await embedText(doc.pageContent);

            if (!embedding) {

                console.log("Skipped :", i + 1);

                continue;

            }

            const id = crypto
                .createHash("md5")
                .update(
                    doc.pageContent +
                    JSON.stringify(doc.metadata)
                )
                .digest("hex");

            try {

                await collection.upsert({

                    ids: [id],

                    documents: [doc.pageContent],

                    embeddings: [embedding],

                    metadatas: [doc.metadata]

                });

                success++;

            } catch (err) {

                console.log("Failed :", i + 1);
                console.log(err.message);

            }

            if ((i + 1) % 20 === 0 || i === docs.length - 1) {

                console.log(`${i + 1} / ${docs.length}`);

            }

        }

        console.log("\n==================================");
        console.log("Knowledge Base Ready");
        console.log("==================================");

        console.log("BM25 Documents :", docs.length);
        console.log("Chroma Inserted :", success);

        const count = await collection.count();

        console.log("Collection Count :", count);

    } catch (err) {

        console.error("----------------------------------");
        console.error("Ingestion Failed");
        console.error(err);
        console.error("----------------------------------");

    }

})();