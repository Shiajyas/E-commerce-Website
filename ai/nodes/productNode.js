const { extractProductFilter } = require("../extractors/productExtractor");
const buildProductQuery = require("../builders/productQueryBuilder");
const { findProducts } = require("../repositories/productRepository");
const generateProductResponse = require("../services/productResponse");

async function productNode(state) {

    // Extract filters
    const filters = await extractProductFilter(state.question);

    console.log("Filters");
    console.log(filters);

    // Build Mongo query
    const query = buildProductQuery(filters);

    console.log("Mongo Query");
    console.log(query);

    // Search products
    const products = await findProducts(query);

    console.log("Products Found:", products.length);

    // Generate AI response
    const answer = await generateProductResponse(
        state.question,
        products
    );

    return {
        ...state,
        context: products,
        answer
    };
}

module.exports = productNode;