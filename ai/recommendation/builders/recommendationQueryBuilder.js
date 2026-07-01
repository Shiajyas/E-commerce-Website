function escapeRegex(str = "") {
    return String(str)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function recommendationQueryBuilder(filters = {}) {

    const query = {
        isBlocked: false,
        quantity: { $gt: 0 }
    };

    const orConditions = [];

    // -------------------------
    // CATEGORY (soft OR match)
    // -------------------------
    if (Array.isArray(filters.category) && filters.category.length) {

        orConditions.push({
            $or: filters.category.map(category => ({
                category: {
                    $regex: escapeRegex(category),
                    $options: "i"
                }
            }))
        });
    }

    // -------------------------
    // BRAND (strict match preferred)
    // -------------------------
    if (filters.brand) {

        query.brand = {
            $regex: `^${escapeRegex(filters.brand)}$`,
            $options: "i"
        };
    }

    // -------------------------
    // MODEL (soft match)
    // -------------------------
    if (filters.model) {

        orConditions.push({
            model: {
                $regex: escapeRegex(filters.model),
                $options: "i"
            }
        });
    }

    // -------------------------
    // FEATURES (ANY match logic)
    // -------------------------
    if (Array.isArray(filters.feature) && filters.feature.length) {

        orConditions.push({
            $or: filters.feature.map(feature => ({
                feature: {
                    $regex: escapeRegex(feature),
                    $options: "i"
                }
            }))
        });
    }

    // -------------------------
    // KEYWORD SEARCH (broader OR group)
    // -------------------------
    if (filters.keyword && filters.keyword.trim()) {

        const regex = {
            $regex: escapeRegex(filters.keyword),
            $options: "i"
        };

        orConditions.push({
            $or: [
                { productName: regex },
                { description: regex },
                { brand: regex },
                { category: regex }
            ]
        });
    }

    // -------------------------
    // PRICE FILTER (hard constraint)
    // -------------------------
    if (filters.minPrice != null || filters.maxPrice != null) {

        query.salePrice = {};

        if (filters.minPrice != null) {
            query.salePrice.$gte = Number(filters.minPrice);
        }

        if (filters.maxPrice != null) {
            query.salePrice.$lte = Number(filters.maxPrice);
        }
    }

    // -------------------------
    // FINAL MERGE LOGIC
    // -------------------------

    if (orConditions.length === 1) {
        Object.assign(query, orConditions[0]);
    } else if (orConditions.length > 1) {
        query.$and = orConditions;
    }

    return query;
}

module.exports = recommendationQueryBuilder;