const rules = require("../utils/recommendationRules");

function escapeRegex(str = "") {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWord(text, word) {
    return new RegExp(`\\b${escapeRegex(word)}\\b`, "i").test(text);
}

function getRecommendationHints(question) {

    console.log("typeof question:", typeof question);

    console.log("question:", question);
    const q = question.toLowerCase();

    const categoryScores = new Map();
    const featureScores = new Map();

    const explanations = [];

    for (const rule of rules) {

        if (!Array.isArray(rule.places)) continue;

        const matchedPlace = rule.places.find(place =>
            containsWord(q, place)
        );

        if (!matchedPlace) continue;

        // ----------------------------
        // weight system (simple but effective)
        // ----------------------------
        const weight = rule.weight || 1;

        // categories
        for (const cat of (rule.categories || [])) {
            categoryScores.set(
                cat,
                (categoryScores.get(cat) || 0) + weight
            );
        }

        // features
        for (const feat of (rule.features || [])) {
            featureScores.set(
                feat,
                (featureScores.get(feat) || 0) + weight
            );
        }

        explanations.push({
            matchedPlace,
            rule: rule.name || "unknown",
            weight
        });
    }

    // ----------------------------
    // convert maps → sorted arrays
    // ----------------------------
    const categories = [...categoryScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key);

    const features = [...featureScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key);

    return {
        categories: [...new Set(categories)],
        features: [...new Set(features)],
        debug: explanations
    };
}

module.exports = getRecommendationHints;