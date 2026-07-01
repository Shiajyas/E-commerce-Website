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

    // -------------------------------------
    // Rule-based detection (high confidence)
    // -------------------------------------

    const detectedBrand = detectBrand(normalized, catalog);
    const detectedCategory = detectCategory(normalized, catalog);
    const detectedFeature = detectFeature(normalized, catalog);

    console.log("Detected Brand:", detectedBrand);
    console.log("Detected Category:", detectedCategory);
    console.log("Detected Feature:", detectedFeature);

    // -------------------------------------
    // Base filters (IMPORTANT FIX)
    // -------------------------------------

    let filters = {
        brand: detectedBrand || "",
        category: detectedCategory || "",
        feature: detectedFeature || "",
        model: "",
        keyword: "",
        minPrice: null,
        maxPrice: null
    };

    // -------------------------------------
    // LLM fallback ONLY if needed
    // -------------------------------------

    const needLLM =
        !filters.brand ||
        !filters.category ||
        !filters.feature;

    if (needLLM) {

        console.log(">>> PRODUCT EXTRACTOR (LLM)");

        const response = await llm.invoke([
            new SystemMessage(productPrompt(normalized, catalog)),
            new HumanMessage(normalized)
        ]);

        const aiFilters = parseJson(response.content);

        filters.brand = filters.brand || aiFilters.brand || "";
        filters.category = filters.category || aiFilters.category || "";
        filters.feature = filters.feature || aiFilters.feature || "";
        filters.model = aiFilters.model || "";
        filters.keyword = aiFilters.keyword || "";
        filters.minPrice = aiFilters.minPrice ?? null;
        filters.maxPrice = aiFilters.maxPrice ?? null;
    }

    // -------------------------------------
    // PRICE EXTRACTION (RULE BASED)
    // -------------------------------------

    const under = normalized.match(/under\s+(\d+)/i);
    if (under) filters.maxPrice = Number(under[1]);

    const below = normalized.match(/below\s+(\d+)/i);
    if (below) filters.maxPrice = Number(below[1]);

    const above = normalized.match(/above\s+(\d+)/i);
    if (above) filters.minPrice = Number(above[1]);

    const over = normalized.match(/over\s+(\d+)/i);
    if (over) filters.minPrice = Number(over[1]);

    const between = normalized.match(/between\s+(\d+)\s+and\s+(\d+)/i);
    if (between) {
        filters.minPrice = Number(between[1]);
        filters.maxPrice = Number(between[2]);
    }

    // -------------------------------------
    // KEYWORD FALLBACK (OPTION 1 FIX CORE)
    // -------------------------------------

    const hasMeaningfulFilters =
        filters.brand ||
        filters.category ||
        filters.feature ||
        filters.model;

    if (!hasMeaningfulFilters) {

        // IMPORTANT:
        // preserve intent when DB has no category match

        filters.keyword = normalized
            .replace(/\b(show|me|find|search|buy|need|want|camera|cameras|security)\b/g, "")
            .trim();

        // special case: wifi
        if (normalized.includes("wifi")) {
            filters.keyword = filters.keyword
                ? `${filters.keyword} wifi`
                : "wifi";
        }
    }

    // -------------------------------------
    // FINAL VALIDATION (NON-DESTRUCTIVE)
    // -------------------------------------

    filters = validateFilters(filters, catalog, normalized);

    console.log("\nSTEP 2: Final Filters");
    console.log(filters);

    return filters;
}

module.exports = {
    extractProductFilter
};