async function generateProductResponse(question, products) {

    console.log("=================================");
    console.log(">>> PRODUCT RESPONSE");
    console.log("=================================");

    if (!products || products.length === 0) {

        return {
            answer: "Sorry, I couldn't find any matching products.",
            products: []
        };

    }

    // Cheapest first
    products.sort((a, b) => a.salePrice - b.salePrice);

    const MAX_RESULTS = 10;
    const displayProducts = products.slice(0, MAX_RESULTS);

    let answer = "";

    answer += `✅ Found ${products.length} matching product${products.length > 1 ? "s" : ""}.\n\n`;

    if (products.length > MAX_RESULTS) {
        answer += `Showing the first ${MAX_RESULTS} results.\n\n`;
    }

    displayProducts.forEach((product, index) => {

        const price = Number(product.salePrice || 0).toLocaleString("en-IN");

        answer += `${index + 1}. ${product.productName}\n`;
        answer += `Brand : ${product.brand}\n`;
        answer += `Price : ₹${price}\n`;
        answer += `Category : ${product.category}\n`;
        answer += `Stock : ${product.quantity > 0 ? `${product.quantity} available` : "Out of Stock"}\n\n`;

    });

    const response = {

        answer: answer.trim(),

        products: displayProducts.map(product => ({

            _id: product._id,

            productName: product.productName,

            brand: product.brand,

            category: product.category,

            feature: product.feature,

            salePrice: product.salePrice,

            regularPrice: product.regularPrice,

            quantity: product.quantity,

            image:
                product.productImage?.[0] ||
                product.image ||
                "/images/no-image.png"

        }))

    };

    console.log("\n========== PRODUCT RESPONSE ==========");
    console.log(response.answer);

    console.log("\n========== PRODUCTS ==========");
    console.dir(response.products, { depth: null });

    return response;

}

module.exports = generateProductResponse;