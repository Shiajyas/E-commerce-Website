const { SystemMessage, HumanMessage } = require("@langchain/core/messages");
const { llm } = require("../config/ollama");

const productPrompt = require("../prompts/productPrompt");
const parseJson = require("../utils/jsonParser");

const { getCatalog } = require("../services/catalogService");
const { normalizeQuery } = require("../utils/queryNormalizer");

const {
    detectBrand,
    detectCategory,
    detectFeature
} = require("../utils/findFromQuery");

const { validateFilters } = require("../utils/validateFilters");

async function extractProductFilter(question) {

    const catalog = await getCatalog();

    const normalized = normalizeQuery(question);

    console.log("\nSTEP 1: Normalized");
    console.log(normalized);

    console.log("Categories:", catalog.categories);

    // =====================================================
    // Rule-based Detection (Highest Priority)
    // =====================================================

    const detectedBrand = detectBrand(normalized, catalog);
    const detectedCategory = detectCategory(normalized, catalog);
    const detectedFeature = detectFeature(normalized, catalog);

    console.log("Detected Brand:", detectedBrand);
    console.log("Detected Category:", detectedCategory);
    console.log("Detected Feature:", detectedFeature);

    let filters = {

        brand: detectedBrand || "",

        category: detectedCategory || "",

        feature: detectedFeature || "",

        model: "",

        keyword: "",

        minPrice: null,

        maxPrice: null

    };

    // =====================================================
    // Rule-based Price Extraction
    // =====================================================

    let match;

    match = normalized.match(/under\s+(\d+)/i);
    if (match) filters.maxPrice = Number(match[1]);

    match = normalized.match(/below\s+(\d+)/i);
    if (match) filters.maxPrice = Number(match[1]);

    match = normalized.match(/above\s+(\d+)/i);
    if (match) filters.minPrice = Number(match[1]);

    match = normalized.match(/over\s+(\d+)/i);
    if (match) filters.minPrice = Number(match[1]);

    match = normalized.match(/between\s+(\d+)\s+and\s+(\d+)/i);

    if (match) {

        filters.minPrice = Number(match[1]);
        filters.maxPrice = Number(match[2]);

    }

    // =====================================================
    // LLM Fallback
    // Only when rule engine couldn't understand enough
    // =====================================================

    const hasRuleSignals =
        filters.brand ||
        filters.category ||
        filters.feature;

    const needLLM =
        !hasRuleSignals ||
        normalized.length > 30;

    if (needLLM) {

        console.log(">>> PRODUCT EXTRACTOR (LLM)");

        try {

            const response = await llm.invoke([
                new SystemMessage(
                    productPrompt(normalized, catalog)
                ),
                new HumanMessage(normalized)
            ]);

            const aiFilters =
                parseJson(response.content) || {};

            filters.brand =
                filters.brand || aiFilters.brand || "";

            filters.category =
                filters.category || aiFilters.category || "";

            filters.feature =
                filters.feature || aiFilters.feature || "";

            filters.model =
                aiFilters.model || "";

            filters.keyword =
                aiFilters.keyword || "";

            if (!filters.minPrice)
                filters.minPrice =
                    aiFilters.minPrice ?? null;

            if (!filters.maxPrice)
                filters.maxPrice =
                    aiFilters.maxPrice ?? null;

        } catch (err) {

            console.log("LLM extraction skipped.");

        }

    }

    // =====================================================
    // Keyword Fallback
    // Only when absolutely nothing useful exists
    // =====================================================

    const hasStructuredFilters =
        filters.brand ||
        filters.category ||
        filters.feature ||
        filters.model;

    if (!hasStructuredFilters) {

        filters.keyword = normalized
            .replace(
                /\b(show|me|find|search|buy|need|want|looking|for|camera|cameras|security|system|it|this|that|also|should|have|with|which|one|please)\b/gi,
                " "
            )
            .replace(/\s+/g, " ")
            .trim();

    }

    // If feature exists,
    // never keep duplicate keyword.

    if (filters.feature) {

        filters.keyword = "";

    }

    // =====================================================
    // Validation
    // =====================================================

    filters = validateFilters(
        filters,
        catalog,
        normalized
    );

    console.log("\nSTEP 2: Final Filters");
    console.log(filters);

    return filters;

}

module.exports = {
    extractProductFilter
};