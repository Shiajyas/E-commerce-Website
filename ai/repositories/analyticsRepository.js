const Product = require("../../models/productSchema");

async function analyticsRepository(operation, query) {

    switch (operation) {

        case "COUNT_PRODUCTS":
            return Product.countDocuments(query);

        case "TOTAL_STOCK": {

            const stock = await Product.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$quantity"
                        }
                    }
                }
            ]);

            return stock[0]?.total || 0;
        }

        case "CHECK_AVAILABILITY": {

            const stock = await Product.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$quantity"
                        }
                    }
                }
            ]);

            return stock[0]?.total || 0;
        }

        case "AVERAGE_PRICE": {

            const avg = await Product.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        average: {
                            $avg: "$salePrice"
                        }
                    }
                }
            ]);

            return avg[0]?.average || 0;
        }

        case "MOST_EXPENSIVE":

            return Product.findOne(query)
                .sort({ salePrice: -1 })
                .lean();

        case "CHEAPEST":

            return Product.findOne(query)
                .sort({ salePrice: 1 })
                .lean();

        default:
            return null;
    }

}

module.exports = analyticsRepository;