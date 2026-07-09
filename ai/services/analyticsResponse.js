async function analyticsResponse(analytics, result) {

    switch (analytics.operation) {

        case "COUNT_PRODUCTS":
            return {
                answer: `There are ${result} matching products.`,
                products: []
            };

        case "TOTAL_STOCK":
            return {
                answer: `Total stock available is ${result} units.`,
                products: []
            };

        case "CHECK_AVAILABILITY":

            return {
                answer: result > 0
                    ? `${result} units are currently available.`
                    : "Currently out of stock.",
                products: []
            };

        case "AVERAGE_PRICE":
            return {
                answer: `Average selling price is ₹${Math.round(result)}.`,
                products: []
            };

        case "MOST_EXPENSIVE":

            if (!result) {
                return {
                    answer: "No product found.",
                    products: []
                };
            }

            return {
                answer: `${result.productName} is the most expensive product at ₹${result.salePrice}.`,
                products: [formatProduct(result)]
            };

        case "CHEAPEST":

            if (!result) {
                return {
                    answer: "No product found.",
                    products: []
                };
            }

            return {
                answer: `${result.productName} is the cheapest product at ₹${result.salePrice}.`,
                products: [formatProduct(result)]
            };

        default:
            return {
                answer: "No analytics available.",
                products: []
            };
    }

}

function formatProduct(product) {

    return {
        _id: product._id,
        productName: product.productName,
        brand: product.brand,
        category: product.category,
        salePrice: product.salePrice,
        regularPrice: product.regularPrice,
        quantity: product.quantity,
        image: product.productImage?.[0] || "/images/no-image.png"
    };

}

module.exports = analyticsResponse;