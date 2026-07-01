const { SystemMessage, HumanMessage } = require("@langchain/core/messages");

const { llm } = require("../../config/ollama");

const recommendationPrompt = require("../../prompts/recommendationPrompt");

const parseJson = require("../../utils/jsonParser");

const { getCatalog } = require("../../services/catalogService");

const { normalizeRecommendation } = require("../../utils/recommendationNormalizer");

async function extractRecommendation(question) {

    console.log(">>> RECOMMENDATION EXTRACTOR");

    //----------------------------------
    // Load Catalog
    //----------------------------------

    const catalog = await getCatalog();

    //----------------------------------
    // Normalize Question
    //----------------------------------

    const normalized = normalizeRecommendation(question);

    console.log("Normalized Recommendation:");
    console.log(normalized);

    //----------------------------------
    // LLM Extraction
    //----------------------------------

    const response = await llm.invoke([

        new SystemMessage(
            recommendationPrompt(question, catalog)
        ),

        new HumanMessage(question)

    ]);

    let filters = parseJson(response.content);

    //----------------------------------
    // Safety Defaults
    //----------------------------------

    filters = {

        brand: "",

        category: "",

        location: "",

        environment: "",

        purpose: "",

        budget: null,

        people: null,

        indoorOutdoor: "",

        coverage: "Normal",

        cameraType: "",

        specialRequirements: [],

        ...filters

    };

    //----------------------------------
    // Rule Overrides
    //----------------------------------

    if (
        !filters.category &&
        normalized.suggestedCategories?.length
    ) {
        filters.category =
            normalized.suggestedCategories[0];
    }

    if (
        !filters.indoorOutdoor &&
        normalized.indoor
    ) {
        filters.indoorOutdoor = "Indoor";
    }

    if (
        !filters.indoorOutdoor &&
        normalized.outdoor
    ) {
        filters.indoorOutdoor = "Outdoor";
    }

    if (
        normalized.longRange
    ) {
        filters.coverage = "Long Range";
    }

    if (
        normalized.wideCoverage
    ) {
        filters.coverage = "Wide Area";
    }

    //----------------------------------
    // Validate Brand
    //----------------------------------

    if (
        filters.brand &&
        !catalog.brands.some(
            b =>
                b.toLowerCase() ===
                filters.brand.toLowerCase()
        )
    ) {

        filters.brand = "";

    }

    //----------------------------------
    // Validate Category
    //----------------------------------

    if (
        filters.category &&
        !catalog.categories.some(
            c =>
                c.toLowerCase() ===
                filters.category.toLowerCase()
        )
    ) {

        filters.category = "";

    }

    //----------------------------------
    // Validate Features
    //----------------------------------

    filters.specialRequirements =
        (filters.specialRequirements || [])

            .filter(feature =>

                catalog.features.some(

                    f =>

                        f.toLowerCase() ===
                        feature.toLowerCase()

                )

            );

    //----------------------------------
    // Budget
    //----------------------------------

    if (
        filters.budget != null
    ) {

        filters.budget =
            Number(filters.budget);

        if (
            Number.isNaN(filters.budget)
        ) {

            filters.budget = null;

        }

    }

    //----------------------------------
    // Trim Strings
    //----------------------------------

    Object.keys(filters).forEach(key => {

        if (
            typeof filters[key] === "string"
        ) {

            filters[key] =
                filters[key].trim();

        }

    });

    //----------------------------------
    // Final Log
    //----------------------------------

    console.log("--------------------------------");

    console.log("Recommendation Filters");

    console.log(filters);

    return filters;

}

module.exports = {
    extractRecommendation
};