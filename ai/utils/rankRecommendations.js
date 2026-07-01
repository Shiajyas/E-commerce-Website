
function rankRecommendations(products, hints) {

    return products.sort((a, b) => {

        let scoreA = 0;
        let scoreB = 0;

        if (
            hints.preferredCategories?.includes(a.category)
        )
            scoreA += 5;

        if (
            hints.preferredCategories?.includes(b.category)
        )
            scoreB += 5;

        if (
            hints.preferredFeatures?.includes(a.feature)
        )
            scoreA += 3;

        if (
            hints.preferredFeatures?.includes(b.feature)
        )
            scoreB += 3;

        return scoreB - scoreA;

    });

}

module.exports = rankRecommendations;