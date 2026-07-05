

/**
 * Reciprocal Rank Fusion (RRF)
 *
 * Combines multiple ranked search results into a single ranking.
 *
 * Formula:
 *
 * score += 1 / (k + rank)
 *
 * Default k = 60
 */

function reciprocalRankFusion(resultSets = [], limit = 5, k = 60) {

    const scores = new Map();

    for (const results of resultSets) {

        if (!results || !results.length) continue;

        results.forEach((result, rank) => {

            const id =
                result.id ??
                result.docId ??
                result.documentId ??
                result.metadata?.id ??
                JSON.stringify(result.metadata);

            if (!scores.has(id)) {

                scores.set(id, {
                    ...result,
                    rrfScore: 0
                });

            }

            const item = scores.get(id);

            item.rrfScore += 1 / (k + rank + 1);

        });

    }

    return [...scores.values()]
        .sort((a, b) => b.rrfScore - a.rrfScore)
        .slice(0, limit);

}

module.exports = {
    reciprocalRankFusion
};