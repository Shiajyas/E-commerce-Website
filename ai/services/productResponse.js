async function generateProductResponse(question, products) {

    console.log(">>> PRODUCT RESPONSE");

    if (!products || products.length === 0) {
        return "Sorry, I couldn't find any matching products.";
    }

    // Cheapest first
    products.sort((a, b) => a.salePrice - b.salePrice);

    const MAX_RESULTS = 10;
    const displayProducts = products.slice(0, MAX_RESULTS);

    let response = "";

    response += `✅ Found ${products.length} matching product${products.length > 1 ? "s" : ""}.\n\n`;

    if (products.length > MAX_RESULTS) {
        response += `Showing the first ${MAX_RESULTS} results:\n\n`;
    }

    displayProducts.forEach((product, index) => {

        const price = Number(product.salePrice || 0).toLocaleString("en-IN");
        const stock =
            product.quantity > 0
                ? `${product.quantity} available`
                : "Out of Stock";

        response += `${index + 1}. ${product.productName}\n`;

        if (product.brand) {
            response += `   • Brand    : ${product.brand}\n`;
        }

        if (product.category) {
            response += `   • Category : ${product.category}\n`;
        }

        if (product.feature) {
            response += `   • Feature  : ${product.feature}\n`;
        }

        response += `   • Price    : ₹${price}\n`;
        response += `   • Stock    : ${stock}\n\n`;

    });

    if (products.length > MAX_RESULTS) {

        response += `...and ${products.length - MAX_RESULTS} more matching product`;

        if (products.length - MAX_RESULTS > 1) {
            response += "s";
        }

        response += ".";

    }

    return response.trim();
}

module.exports = generateProductResponse;