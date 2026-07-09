const { extractProductFilter } = require("../extractors/productExtractor");
const buildProductQuery = require("../builders/productQueryBuilder");
const { findProducts } = require("../repositories/productRepository");
const generateProductResponse = require("../services/productResponse");
const contextManager = require("../memory/context/contextManager");

async function productNode(state) {

    console.log("========================================");
    console.log("Inside Product Node (CONTEXT AWARE)");
    console.log("========================================");

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
        state.rewrittenQuestion ||
        state.question ||
        "";

    const lowerQuestion =
        question.toLowerCase();

    const currentFilters =
        await extractProductFilter(lowerQuestion);

    console.log("Current Filters:");
    console.log(currentFilters);

    console.log("Previous Filters:");
    console.log(previousFilters);

    // =====================================================
    // Merge Filters
    // =====================================================

    const mergedFilters =
        contextManager.mergeFilters(
            previousFilters,
            currentFilters
        );

    console.log("Merged Filters:");
    console.log(mergedFilters);

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
    // Price-only Fallback
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

        products =
            await findProducts({

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
    // Context Refinement
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

            refinedProducts =
                refinedProducts.filter(product =>
                    product.brand &&
                    product.brand.toLowerCase() ===
                    mergedFilters.brand.toLowerCase()
                );

        }

        if (mergedFilters.category) {

            refinedProducts =
                refinedProducts.filter(product =>
                    product.category &&
                    product.category.toLowerCase() ===
                    mergedFilters.category.toLowerCase()
                );

        }

        if (mergedFilters.feature) {

            refinedProducts =
                refinedProducts.filter(product =>
                    product.feature &&
                    product.feature
                        .toLowerCase()
                        .includes(
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
    // No Products Found
    // =====================================================

    if (!products.length) {

        return {

            ...state,

            intent: "PRODUCT",

            answer:
                "Sorry, no products found for your search.",

            products: [],

            memory: {

                ...memory,

                lastIntent: "PRODUCT",

                product: {

                    filters: mergedFilters,

                    products: []

                }

            }

        };

    }

    // =====================================================
    // Generate Product Response
    // =====================================================

    const result =
        await generateProductResponse(
            question,
            products
        );

    console.log("\n========== PRODUCT RESULT ==========");
    console.log(result.answer);

    console.log("\n========== PRODUCTS ==========");
    console.dir(result.products, {
        depth: null
    });

    // =====================================================
    // Return State
    // =====================================================

    return {

        ...state,

        intent: "PRODUCT",

        answer: result.answer,

        products: result.products,

        memory: {

            ...memory,

            lastIntent: "PRODUCT",

            product: {

                filters: mergedFilters,

                products: result.products

            }

        }

    };

}

module.exports = productNode;