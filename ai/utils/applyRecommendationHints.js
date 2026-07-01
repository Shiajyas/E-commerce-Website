function applyRecommendationHints(filters, hints) {

    const placeWords = new Set([
        "office", "home", "house", "shop", "store",
        "warehouse", "factory", "parking", "parking area",
        "gate", "garden", "road", "street", "hall",
        "school", "classroom", "hospital", "hotel",
        "restaurant", "bank", "atm", "lift", "elevator",
        "farm"
    ]);

    // -------------------------
    // CATEGORY (merge safely)
    // -------------------------
    if (Array.isArray(hints.categories) && hints.categories.length) {

        if (!filters.category || filters.category.length === 0) {
            filters.category = hints.categories;
        } else if (Array.isArray(filters.category)) {
            filters.category = [
                ...new Set([
                    ...filters.category,
                    ...hints.categories
                ])
            ];
        }
    }

    // -------------------------
    // FEATURE (merge safely)
    // -------------------------
    if (Array.isArray(hints.features) && hints.features.length) {

        if (!filters.feature || filters.feature.length === 0) {
            filters.feature = hints.features;
        } else if (Array.isArray(filters.feature)) {
            filters.feature = [
                ...new Set([
                    ...filters.feature,
                    ...hints.features
                ])
            ];
        }
    }

    // -------------------------
    // CLEAN KEYWORD (important fix)
    // -------------------------
    if (filters.keyword) {

        const k = filters.keyword.toLowerCase().trim();

        if (placeWords.has(k)) {
            filters.keyword = "";
        }
    }

    // -------------------------
    // REMOVE INVALID OVERRIDES
    // -------------------------
    if (filters.category && Array.isArray(filters.category)) {
        filters.category = filters.category.filter(Boolean);
    }

    if (filters.feature && Array.isArray(filters.feature)) {
        filters.feature = filters.feature.filter(Boolean);
    }

    return filters;
}

module.exports = applyRecommendationHints;