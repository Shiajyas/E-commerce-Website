const { search } = require("fast-fuzzy");

// ------------------------------------
// Normalize
// ------------------------------------

function normalize(text = "") {
    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ------------------------------------
// Fuzzy match
// ------------------------------------

function bestMatch(value = "", list = []) {

    if (!value || !list.length) return "";

    const results = search(value, list, {
        returnMatchData: true
    });

    if (!results.length) return "";

    let score = results[0].score;

    if (score > 1) score /= 100;

    return score >= 0.75 ? results[0].item : "";
}

// ------------------------------------
// Contains check
// ------------------------------------

function contains(question = "", value = "") {
    if (!value) return false;

    return normalize(question).includes(normalize(value));
}

// ------------------------------------
// Keyword cleanup (SAFE VERSION)
// ------------------------------------

function cleanKeyword(keyword = "") {

    if (!keyword) return "";

    keyword = normalize(keyword);

    // remove price expressions
    keyword = keyword.replace(
        /\b(under|below|less than|above|over|greater than|between)\s*\d+\b/g,
        ""
    );

    keyword = keyword.replace(/\b\d+\b/g, "");

    const stopWords = new Set([
        "camera", "cameras", "cam", "cctv", "security",
        "show", "find", "search", "need", "want", "buy",
        "looking", "lookingfor",
        "product", "products", "device", "devices",
        "item", "items",
        "for", "with", "of", "the", "a", "an", "me"
    ]);

    return keyword
        .split(" ")
        .filter(w => w && !stopWords.has(w))
        .join(" ")
        .trim();
}

// ------------------------------------
// MAIN VALIDATION (FIXED LOGIC)
// ------------------------------------

function validateFilters(filters, catalog, question) {

    const q = normalize(question);

    // ====================================================
    // BRAND (safe fuzzy + containment check)
    // ====================================================

    const brandMatch = bestMatch(filters.brand, catalog.brands);

    if (brandMatch && contains(q, brandMatch)) {
        filters.brand = brandMatch;
    } else {
        filters.brand = "";
    }

    // ====================================================
    // CATEGORY (CRITICAL FIX)
    // NEVER trust raw LLM category
    // ====================================================

    const categoryMatch = bestMatch(filters.category, catalog.categories);

    if (categoryMatch && contains(q, categoryMatch)) {
        filters.category = categoryMatch;
    } else {
        // IMPORTANT: do NOT allow hallucinated categories like "HikVision"
        filters.category = "";
    }

    // ====================================================
    // MODEL
    // ====================================================

    const modelMatch = bestMatch(filters.model, catalog.models);

    if (modelMatch && contains(q, modelMatch)) {
        filters.model = modelMatch;
    } else {
        filters.model = "";
    }

    // ====================================================
    // FEATURE
    // ====================================================

    const featureMatch = bestMatch(filters.feature, catalog.features);

    if (featureMatch && contains(q, featureMatch)) {
        filters.feature = featureMatch;
    } else {
        filters.feature = "";
    }

    // ====================================================
    // KEYWORD
    // ====================================================

    filters.keyword = cleanKeyword(filters.keyword);

    // remove duplicates safely
    const usedValues = [
        filters.brand,
        filters.category,
        filters.model,
        filters.feature
    ]
        .filter(Boolean)
        .map(normalize);

    if (filters.keyword && usedValues.includes(normalize(filters.keyword))) {
        filters.keyword = "";
    }

    return filters;
}

module.exports = {
    validateFilters
};