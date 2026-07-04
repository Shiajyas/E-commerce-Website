const { loadPDFDocuments } = require("./ai/knowladge/loaders/pdfLoder");
const { splitDocuments } = require("./ai/knowladge/splitter/textSplitter");

(async () => {

    const docs = await loadPDFDocuments();

    const chunks = await splitDocuments(docs);

    console.log(chunks.length);

    console.log(chunks[0]);

})();