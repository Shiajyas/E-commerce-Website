const { extractProductFilter } = require("../extractors/productExtractor");
const buildProductQuery = require("../builders/productQueryBuilder");
const { findProducts } = require("../repositories/productRepository");
const generateProductResponse = require("../services/productResponse");
const contextManager = require("../memory/context/contextManager");

async function productNode(state) {

    console.log("========================================");
    console.log("Inside Product Node (CONTEXT AWARE)");

    // =====================================================
    // Conversation Memory
    // =====================================================

    const memory = state.memory || {};

    const previousFilters =
        memory.product?.filters || {};

    const previousProducts =
        memory.product?.products || [];

    // =====================================================
    // Extract Filters
    // =====================================================

    const question =
    state.rewrittenQuestion || state.question;

    const lowerQuestion =
        question.toLowerCase();

    const currentFilters =
        await extractProductFilter(lowerQuestion);

    console.log("Current Filters:", currentFilters);
    console.log("Previous Filters:", previousFilters);

    // =====================================================
    // Merge Filters
    // =====================================================

    const mergedFilters =
        contextManager.mergeFilters(
            previousFilters,
            currentFilters
        );

    console.log("Merged Filters:", mergedFilters);

    // =====================================================
    // Build Mongo Query
    // =====================================================

    const mongoQuery =
        buildProductQuery(mergedFilters);

    console.log("Mongo Query:");
    console.log(JSON.stringify(mongoQuery, null, 2));

    let products =
        await findProducts(mongoQuery);

    console.log("Products Found:", products.length);

    // =====================================================
    // Price-only fallback
    // =====================================================

    if (
        !products.length &&
        mergedFilters.maxPrice &&
        !mergedFilters.keyword &&
        !mergedFilters.category &&
        !mergedFilters.brand &&
        !mergedFilters.feature
    ) {

        console.log("Using Price Fallback");

        products = await findProducts({

            isBlocked: false,

            quantity: {
                $gt: 0
            },

            salePrice: {
                $lte: mergedFilters.maxPrice
            }

        });

        console.log("Price Fallback:", products.length);
    }

    // =====================================================
    // Follow-up Context Refinement
    // =====================================================

    if (
        previousProducts.length &&
        (
            mergedFilters.brand ||
            mergedFilters.category ||
            mergedFilters.feature
        )
    ) {

        console.log("Applying Context Refinement");

        let refinedProducts = [...previousProducts];

        if (mergedFilters.brand) {

            refinedProducts = refinedProducts.filter(p =>
                p.brand &&
                p.brand.toLowerCase() ===
                mergedFilters.brand.toLowerCase()
            );

        }

        if (mergedFilters.category) {

            refinedProducts = refinedProducts.filter(p =>
                p.category &&
                p.category.toLowerCase() ===
                mergedFilters.category.toLowerCase()
            );

        }

        if (mergedFilters.feature) {

            refinedProducts = refinedProducts.filter(p =>
                p.feature &&
                p.feature.toLowerCase().includes(
                    mergedFilters.feature.toLowerCase()
                )
            );

        }

        if (refinedProducts.length) {

            console.log(
                "Using Refined Products:",
                refinedProducts.length
            );

            products = refinedProducts;

        }

    }

    // =====================================================
    // No Products
    // =====================================================

    if (!products.length) {

        return {

            ...state,

            intent: "PRODUCT",

            memory: {

                ...memory,

                lastIntent: "PRODUCT",

                product: {

                    filters: mergedFilters,

                    products: []

                }

            },

            answer:
                "Sorry, no products found for your search."

        };

    }

    // =====================================================
    // Generate Response
    // =====================================================

    const answer =
        await generateProductResponse(
            state.question,
            products
        );

    // =====================================================
    // Save Memory
    // =====================================================

    return {

        ...state,

        intent: "PRODUCT",

        answer,

        memory: {

            ...memory,

            lastIntent: "PRODUCT",

            product: {

                filters: mergedFilters,

                products

            }

        }

    };

}

module.exports = productNode;