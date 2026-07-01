const recommendationRules = require("../utils/recommendationRules");

function normalize(text = "") {
    return String(text).toLowerCase().trim();
}

function recommendationRuleEngine(requirements = {}) {

    const filters = {
        category: [],
        feature: [],
        brand: normalize(requirements.brand || ""),
        minPrice: null,
        maxPrice: requirements.budget != null ? Number(requirements.budget) : null
    };

    const location = normalize(requirements.location || "");

    // ----------------------------
    // LOCATION RULES
    // ----------------------------
    const rule = recommendationRules[location];

    if (rule) {

        if (Array.isArray(rule.category)) {
            filters.category.push(...rule.category.map(normalize));
        }

        if (Array.isArray(rule.feature)) {
            filters.feature.push(...rule.feature.map(normalize));
        }
    }

    // ----------------------------
    // INDOOR / OUTDOOR LOGIC (STRICT)
    // ----------------------------
    if (requirements.indoorOutdoor) {

        const io = normalize(requirements.indoorOutdoor);

        // ensure clean mapping only
        if (io === "indoor" || io === "outdoor") {
            filters.feature.push(io);
        }
    }

    // ----------------------------
    // SPECIAL REQUIREMENTS (HIGH PRIORITY FEATURES)
    // ----------------------------
    if (Array.isArray(requirements.specialRequirements)) {

        for (const feature of requirements.specialRequirements) {

            const clean = normalize(feature);

            if (clean) {
                filters.feature.push(clean);
            }
        }
    }

    // ----------------------------
    // DEDUPLICATION (SAFE NORMALIZATION BASED)
    // ----------------------------
    filters.category = [
        ...new Set(filters.category.filter(Boolean))
    ];

    filters.feature = [
        ...new Set(filters.feature.filter(Boolean))
    ];

    // ----------------------------
    // FINAL SANITY CLEANUP
    // ----------------------------

    // remove feature-category collision (important fix)
    filters.feature = filters.feature.filter(f => {
        return !filters.category.includes(f);
    });

    return filters;
}

module.exports = recommendationRuleEngine;