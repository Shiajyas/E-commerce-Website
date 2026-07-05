const { hybridSearch } = require("./hybridSearch");

async function retrieveKnowledge(question, options = {}) {

    const {
        limit = 5,
        maxScore = 0.80
    } = options;

    const results = await hybridSearch(question, limit);

    if (!results.length) {

        return [];

    }

    // ---------------------------------------
    // Remove low quality vector matches
    // ---------------------------------------

    const filtered = results.filter(doc => {

        if (doc.method === "keyword") {

            return true;

        }

        return doc.score <= maxScore;

    });

    // ---------------------------------------
    // Remove duplicate chunks
    // ---------------------------------------

    const unique = [];
    const seen = new Set();

    for (const doc of filtered) {

        const key = `${doc.metadata.source}-${doc.metadata.page}`;

        if (seen.has(key)) {

            continue;

        }

        seen.add(key);
        unique.push(doc);

    }

    console.log("--------------------------------");
    console.log("Knowledge Retrieved :", unique.length);
    console.log("--------------------------------");

    return unique;

}

module.exports = {
    retrieveKnowledge
};