function buildProductQuery(filters) {

    const query = {

        isBlocked: false,

        quantity: { $gt: 0 }

    };

    if (filters.category) {

        query.category = {

            $regex: filters.category,

            $options: "i"

        };

    }

    if (filters.brand) {

        query.brand = {

            $regex: filters.brand,

            $options: "i"

        };

    }

    if (filters.model) {

        query.model = {

            $regex: filters.model,

            $options: "i"

        };

    }

    if (filters.feature) {

        query.feature = {

            $regex: filters.feature,

            $options: "i"

        };

    }

    if (filters.keyword) {

        query.productName = {

            $regex: filters.keyword,

            $options: "i"

        };

    }

    if (filters.minPrice || filters.maxPrice) {

        query.salePrice = {};

        if (filters.minPrice)

            query.salePrice.$gte = filters.minPrice;

        if (filters.maxPrice)

            query.salePrice.$lte = filters.maxPrice;

    }

    return query;

}

module.exports = buildProductQuery;