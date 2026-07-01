const { extractProductFilter } = require("../extractors/productExtractor");
const buildProductQuery = require("../builders/productQueryBuilder");
const { findProducts } = require("../repositories/productRepository");
const generateProductResponse = require("../services/productResponse");


async function productNode(state) {

    console.log("========================================");
    console.log("Inside Product Node");

    const filters = await extractProductFilter(state.question);

    console.log("Filters:", filters);

    let baseQuery = buildProductQuery(filters);

    console.log("Mongo Query:", JSON.stringify(baseQuery, null, 2));

    let products = await findProducts(baseQuery);

    console.log(`Products Found: ${products.length}`);

    // ----------------------------------------
    // PRICE-ONLY SEARCH (IMPORTANT FIX)
    // ----------------------------------------

    if (!products.length && filters.maxPrice && !filters.keyword && !filters.category) {

        console.log("Direct Price Search");

        products = await findProducts({
            isBlocked: false,
            quantity: { $gt: 0 },
            salePrice: { $lte: filters.maxPrice }
        });

        console.log(`Price Match: ${products.length}`);
    }

    // ----------------------------------------
    // FALLBACK CHAIN
    // ----------------------------------------

    const hasFallbackSignal =
        filters.keyword ||
        filters.category ||
        filters.brand ||
        filters.feature;

    const keyword = filters.keyword;

    if (!products.length && hasFallbackSignal && keyword) {

        console.log("Fallback -> productName");

        products = await findProducts({
            isBlocked: false,
            quantity: { $gt: 0 },
            productName: { $regex: keyword, $options: "i" }
        });
    }

    if (!products.length && hasFallbackSignal && keyword) {

        console.log("Fallback -> category");

        products = await findProducts({
            isBlocked: false,
            quantity: { $gt: 0 },
            category: { $regex: keyword, $options: "i" }
        });
    }

    if (!products.length && hasFallbackSignal && keyword) {

        console.log("Fallback -> feature");

        products = await findProducts({
            isBlocked: false,
            quantity: { $gt: 0 },
            feature: { $regex: keyword, $options: "i" }
        });
    }

    if (!products.length && hasFallbackSignal && keyword) {

        console.log("Fallback -> model");

        products = await findProducts({
            isBlocked: false,
            quantity: { $gt: 0 },
            model: { $regex: keyword, $options: "i" }
        });
    }

    // ----------------------------------------
    // FINAL HANDLING
    // ----------------------------------------

    if (!products.length) {
        return {
            ...state,
            intent: "PRODUCT",
            context: [],
            answer: "Sorry, no products found for your search at the moment."
        };
    }

    console.log(`Final Products: ${products.length}`);

    const answer = await generateProductResponse(
        state.question,
        products
    );

    return {
        ...state,
        intent: "PRODUCT",
        context: products,
        answer
    };
}

module.exports = productNode;