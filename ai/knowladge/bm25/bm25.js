const { tokenize } = require("./tokenizer");

class BM25 {

    constructor(indexData = {}) {

        this.documents = indexData.documents || [];
        this.index = indexData.index || {};
        this.documentFrequency = indexData.documentFrequency || {};
        this.documentLengths = indexData.documentLengths || {};
        this.averageDocumentLength = indexData.averageDocumentLength || 1;
        this.totalDocuments = indexData.totalDocuments || 0;

        this.k1 = 1.5;
        this.b = 0.75;
    }

    idf(term) {
        const df = this.documentFrequency[term] || 0;

        return Math.log(
            1 +
            (this.totalDocuments - df + 0.5) /
            (df + 0.5)
        );
    }

    search(query, limit = 5) {

        const terms = tokenize(query);
        const scores = {};

        for (const term of terms) {

            const postings = this.index?.[term];

            if (!postings || postings.length === 0) continue;

            const idf = this.idf(term);

            for (const posting of postings) {

                const docId = posting.docId;
                const tf = posting.tf;
                const dl = this.documentLengths?.[docId] || 1;

                const numerator = tf * (this.k1 + 1);

                const denominator =
                    tf +
                    this.k1 *
                    (1 - this.b + this.b * (dl / this.averageDocumentLength));

                const score = idf * (numerator / denominator);

                scores[docId] = (scores[docId] || 0) + score;
            }
        }

        return Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([docId, score]) => ({
                docId: Number(docId),
                score,
                document: this.documents[docId]
            }));
    }
}

module.exports = BM25;