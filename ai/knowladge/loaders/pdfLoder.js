const fs = require("fs");
const path = require("path");

const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

const KNOWLEDGE_FOLDER = path.join(process.cwd(), "knowledge", "documents");

async function loadPDFDocuments() {

    const documents = [];

    if (!fs.existsSync(KNOWLEDGE_FOLDER)) {

        console.log("Knowledge folder not found.");

        return documents;

    }

    const files = fs.readdirSync(KNOWLEDGE_FOLDER);

    const pdfFiles = files.filter(file =>
        file.toLowerCase().endsWith(".pdf")
    );

    for (const file of pdfFiles) {

        console.log(`Loading ${file}`);

        const loader = new PDFLoader(
            path.join(KNOWLEDGE_FOLDER, file)
        );

        const docs = await loader.load();

        docs.forEach(doc => {

            doc.metadata = {
                ...doc.metadata,
                source: file
            };

        });

        documents.push(...docs);

    }

    console.log(`Loaded ${documents.length} pages`);

    return documents;

}

module.exports = {
    loadPDFDocuments
};