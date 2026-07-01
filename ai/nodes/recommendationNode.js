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

const { findProducts } =
    require("../repositories/productRepository");

async function recommendationNode(state) {

    console.log("========================================");
    console.log("Inside Recommendation Node");

    // -----------------------------------
    // STEP 1 - Extract Requirements
    // -----------------------------------

    const requirements =
        await extractRecommendation(state.question);

    console.log("Requirements:");
    console.log(requirements);

    // -----------------------------------
    // STEP 2 - Convert Requirements -> Filters
    // -----------------------------------

    const filters =
        recommendationRuleEngine(requirements);

    console.log("Rule Filters:");
    console.log(filters);

    // -----------------------------------
    // STEP 3 - Validation
    // -----------------------------------

    const hasSignal =
        filters.brand ||
        filters.category.length ||
        filters.feature.length ||
        filters.maxPrice != null;

    if (!hasSignal) {

        return {
            ...state,
            intent: "PRODUCT_RECOMMENDATION",
            context: [],
            answer:
                "Please provide more details such as location, brand, camera type, or budget so I can recommend suitable products."
        };

    }

    // -----------------------------------
    // STEP 4 - Build Query
    // -----------------------------------

    const query =
        recommendationQueryBuilder(filters);

    console.log("Mongo Query:");
    console.log(JSON.stringify(query, null, 2));

    let products =
        await findProducts(query);

    console.log("Products Found:", products.length);

    // -----------------------------------
    // STEP 5 - Generic Fallback
    // -----------------------------------

    if (!products.length) {

        products = await findProducts({
            isBlocked: false,
            quantity: { $gt: 0 }
        });

    }

    if (!products.length) {

        return {
            ...state,
            intent: "PRODUCT_RECOMMENDATION",
            context: [],
            answer:
                "Sorry, no suitable products are available right now."
        };

    }

    // -----------------------------------
    // STEP 6 - Score Products
    // -----------------------------------

    products =
        recommendationScoring(
            products,
            requirements,
            filters
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

    // -----------------------------------
    // STEP 7 - Generate Response
    // -----------------------------------

    const answer =
        await recommendationResponse(
            state.question,
            products
        );

    // -----------------------------------
    // STEP 8 - Return
    // -----------------------------------

    return {

        ...state,

        intent: "PRODUCT_RECOMMENDATION",

        context: products,

        answer

    };

}

module.exports = recommendationNode;