const { llm } = require("../config/ollama");

const productPrompt = require("../prompts/productPrompt");

const parseJson = require("../utils/jsonParser");

const { loadCatalog } = require("../services/catalogService");

const { normalizeQuery } = require("../utils/queryNormalizer");

const { validateFilters } = require("../utils/validateFilters");

const {
    detectBrand,
    detectCategory,
    detectFeature
} = require("../utils/findFromQuery");

async function extractProductFilter(question){

    const catalog = await loadCatalog();

    const normalized = normalizeQuery(question);

    //-------------------------------------
    // Rule based detection
    //-------------------------------------

    const detectedBrand =
        detectBrand(normalized,catalog);

    const detectedCategory =
        detectCategory(normalized,catalog);

    const detectedFeature =
        detectFeature(normalized,catalog);

    //-------------------------------------
    // Ask LLM
    //-------------------------------------

    const response = await llm.invoke([

        {
            role:"system",
            content:productPrompt(normalized,catalog)
        },
        {
            role:"user",
            content:normalized
        }

    ]);

    let filters = parseJson(response.content);

    //-------------------------------------
    // Rule based wins
    //-------------------------------------

    if(detectedBrand)
        filters.brand = detectedBrand;

    if(detectedCategory)
        filters.category = detectedCategory;

    if(detectedFeature)
        filters.feature = detectedFeature;

    //-------------------------------------
    // Validate
    //-------------------------------------

    filters = validateFilters(filters,catalog,normalized);

    //-------------------------------------
    // Remove duplicate keyword
    //-------------------------------------

    if(filters.keyword){

        const keyword =
            filters.keyword.toLowerCase();

        if(

            keyword===filters.brand.toLowerCase()

            ||

            keyword===filters.category.toLowerCase()

            ||

            keyword===filters.feature.toLowerCase()

            ||

            keyword===filters.model.toLowerCase()

        ){

            filters.keyword="";

        }

    }

    return filters;

}

module.exports={
    extractProductFilter
};