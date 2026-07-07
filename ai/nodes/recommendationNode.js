const { extractRecommendation } =
    require("../recommendation/extractor/recommendationExtractor");

const recommendationRuleEngine =
    require("../recommendation/recommendationRuleEngine");

const recommendationQueryBuilder =
    require("../recommendation/builders/recommendationQueryBuilder");

const recommendationScoring =
    require("../recommendation/recommendationScore/recommendationScoring");

const recommendationResponse =
    require("../services/recommendationResponse");

const {
    findProducts
} = require("../repositories/productRepository");

const contextManager =
    require("../memory/context/contextManager");

async function recommendationNode(state) {

    console.log("========================================");
    console.log("Inside Recommendation Node (DOMAIN MEMORY)");
    console.log("========================================");

    // =====================================================
    // Conversation Memory
    // =====================================================

    const memory = state.memory || {};

    const previousFilters =
        memory.recommendation?.filters || {};

    const previousProducts =
        memory.recommendation?.products || [];

    // =====================================================
    // Question
    // =====================================================

    const question =
        state.rewrittenQuestion ||
        state.question ||
        "";

    const lowerQuestion =
        question.toLowerCase();

    // =====================================================
    // Extract Recommendation Requirements
    // =====================================================

    const requirements =
        await extractRecommendation(question);

    console.log("Requirements:");
    console.log(requirements);

    // =====================================================
    // Build Filters
    // =====================================================

    const currentFilters =
        recommendationRuleEngine(requirements);

    console.log("Current Filters:");
    console.log(currentFilters);

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
    // Follow-up Detection
    // =====================================================

    const followUpSignals = [
        "cheaper",
        "budget",
        "less",
        "lower",
        "instead",
        "another",
        "different",
        "compare",
        "better",
        "show",
        "which"
    ];

    const isFollowUp =
        previousProducts.length > 0 &&
        followUpSignals.some(word =>
            lowerQuestion.includes(word)
        );

    // =====================================================
    // Use Previous Recommendation
    // =====================================================

    if (isFollowUp) {

        console.log("Using Previous Recommendation Context");

        let refinedProducts = [...previousProducts];

        if (
            lowerQuestion.includes("cheaper") ||
            lowerQuestion.includes("budget")
        ) {

            refinedProducts.sort(
                (a, b) => a.salePrice - b.salePrice
            );

        }

        if (lowerQuestion.includes("better")) {

            refinedProducts.sort(
                (a, b) =>
                    (b.recommendationScore || 0) -
                    (a.recommendationScore || 0)
            );

        }

        const answer =
            await recommendationResponse(
                question,
                refinedProducts
            );

        return {

            ...state,

            intent: "PRODUCT_RECOMMENDATION",

            answer,

            memory: {

                ...memory,

                lastIntent: "PRODUCT_RECOMMENDATION",

                recommendation: {

                    filters: mergedFilters,

                    products: refinedProducts

                }

            }

        };

    }

    // =====================================================
    // Database Query
    // =====================================================

    const query =
        recommendationQueryBuilder(
            mergedFilters
        );

    console.log("Mongo Query:");
    console.log(JSON.stringify(query, null, 2));

    let products =
        await findProducts(query);

    console.log("Products Found:", products.length);

    // =====================================================
    // Global Fallback
    // =====================================================

    if (!products.length) {

        products =
            await findProducts({

                isBlocked: false,

                quantity: {
                    $gt: 0
                }

            });

    }

    if (!products.length) {

        return {

            ...state,

            intent: "PRODUCT_RECOMMENDATION",

            answer:
                "Sorry, no suitable products are available right now.",

            memory: {

                ...memory,

                lastIntent: "PRODUCT_RECOMMENDATION",

                recommendation: {

                    filters: mergedFilters,

                    products: []

                }

            }

        };

    }

    // =====================================================
    // Recommendation Scoring
    // =====================================================

    products =
        recommendationScoring(
            products,
            requirements,
            mergedFilters
        );

    console.table(

        products.map(p => ({

            Product: p.productName,

            Brand: p.brand,

            Category: p.category,

            Feature: p.feature,

            Price: p.salePrice,

            Score: p.recommendationScore

        }))

    );

    // =====================================================
    // Generate Response
    // =====================================================

    const answer =
        await recommendationResponse(
            question,
            products
        );

    // =====================================================
    // Save Memory
    // =====================================================

    return {

        ...state,

        intent: "PRODUCT_RECOMMENDATION",

        answer,

        memory: {

            ...memory,

            lastIntent: "PRODUCT_RECOMMENDATION",

            recommendation: {

                filters: mergedFilters,

                products

            }

        }

    };

}

module.exports = recommendationNode;