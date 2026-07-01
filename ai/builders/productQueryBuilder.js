function escapeRegex(text = "") {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exact(value) {
    return {
        $regex: `^${escapeRegex(value)}$`,
        $options: "i"
    };
}

function contains(value) {
    return {
        $regex: escapeRegex(value),
        $options: "i"
    };
}

function buildProductQuery(filters) {

    const query = {
        isBlocked: false,
        quantity: { $gt: 0 }
    };

    // Category
    if (filters.category) {
        query.category = exact(filters.category);
    }

    // Brand
    if (filters.brand) {
        query.brand = exact(filters.brand);
    }

    // Model
    if (filters.model) {
        query.model = exact(filters.model);
    }

    // Feature
    if (filters.feature) {
        query.feature = exact(filters.feature);
    }

    // Keyword
    if (filters.keyword) {

        const regex = contains(filters.keyword);

        query.$or = [
            { productName: regex },
            { brand: regex },
            { category: regex },
            { feature: regex },
            { model: regex }
        ];
    }

    // Price
    if (filters.minPrice != null || filters.maxPrice != null) {

        query.salePrice = {};

        if (filters.minPrice != null)
            query.salePrice.$gte = Number(filters.minPrice);

        if (filters.maxPrice != null)
            query.salePrice.$lte = Number(filters.maxPrice);
    }

    return query;
}

module.exports = buildProductQuery;