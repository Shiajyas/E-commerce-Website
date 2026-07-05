const fs = require("fs");
const path = require("path");

const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

const KNOWLEDGE_FOLDER = path.join(__dirname, "..", "documents");

async function loadDocuments() {

    if (!fs.existsSync(KNOWLEDGE_FOLDER)) {
        console.log("Knowledge folder not found.");
        return [];
    }

    const files = fs.readdirSync(KNOWLEDGE_FOLDER);

    const allDocs = [];

    for (const file of files) {

        const fullPath = path.join(KNOWLEDGE_FOLDER, file);

        const ext = path.extname(file).toLowerCase();

        //--------------------------------
        // PDF
        //--------------------------------

        if (ext === ".pdf") {

            console.log("Loading:", file);

            const loader = new PDFLoader(fullPath);

            const docs = await loader.load();

            docs.forEach(doc => {
                doc.metadata.source = file;
            });

            console.log(`Loaded ${docs.length} pages`);

            allDocs.push(...docs);
        }

        //--------------------------------
        // TXT / MD
        //--------------------------------

        else if (ext === ".txt" || ext === ".md") {

            console.log("Loading:", file);

            const content = fs.readFileSync(fullPath, "utf8");

            allDocs.push({
                pageContent: content,
                metadata: {
                    source: file,
                    page: 1
                }
            });

            console.log("Loaded text file");
        }
    }

    console.log("--------------------------------");
    console.log("Knowledge Files :", files.length);
    console.log("Loaded Docs     :", allDocs.length);
    console.log("--------------------------------");

    return allDocs;
}

module.exports = {
    loadDocuments
};