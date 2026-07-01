async function analyticsResponse(analytics, result) {

    switch (analytics.operation) {

        case "COUNT_PRODUCTS":
            return `There are ${result} matching products.`;

        case "TOTAL_STOCK":
            return `Total stock available is ${result} units.`;

        case "CHECK_AVAILABILITY":

            if (result > 0) {
                return `${result} units are currently available.`;
            }

            return "Currently out of stock.";

        case "AVERAGE_PRICE":
            return `Average selling price is ₹${Math.round(result)}.`;

        case "MOST_EXPENSIVE":

            if (!result)
                return "No product found.";

            return `${result.productName} is the most expensive product at ₹${result.salePrice}.`;

        case "CHEAPEST":

            if (!result)
                return "No product found.";

            return `${result.productName} is the cheapest product at ₹${result.salePrice}.`;

        default:
            return "No analytics available.";

    }

}

module.exports = analyticsResponse;