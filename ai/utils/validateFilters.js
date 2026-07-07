const { search } = require("fast-fuzzy");

// ------------------------------------
// Normalize
// ------------------------------------

function normalize(text = "") {

    return String(text)
        .toLowerCase()
        .replace(/[-_]/g, " ")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}

// ------------------------------------
// Fuzzy Match
// ------------------------------------

function bestMatch(value = "", list = []) {

    if (!value || !list.length) return "";

    const results = search(value, list, {
        returnMatchData: true
    });

    if (!results.length) return "";

    let score = results[0].score;

    if (score > 1) score /= 100;

    return score >= 0.70
        ? results[0].item
        : "";

}

// ------------------------------------
// Smart contains
// ------------------------------------

function contains(question = "", value = "") {

    if (!value) return false;

    const q = normalize(question);

    const v = normalize(value);

    if (q.includes(v)) return true;

    // Wi-Fi vs WiFi
    if (q.includes(v.replace(/\s/g, ""))) return true;

    if (q.replace(/\s/g, "").includes(v)) return true;

    return false;

}

// ------------------------------------
// Keyword cleanup
// ------------------------------------

function cleanKeyword(keyword = "") {

    if (!keyword) return "";

    keyword = normalize(keyword);

    keyword = keyword.replace(
        /\b(under|below|less than|above|over|greater than|between)\s*\d+\b/g,
        ""
    );

    keyword = keyword.replace(/\b\d+\b/g, "");

    const stopWords = new Set([

        "camera",
        "cameras",
        "cam",
        "cctv",
        "security",

        "show",
        "find",
        "search",
        "buy",
        "need",
        "want",

        "looking",
        "lookingfor",

        "product",
        "products",

        "device",
        "devices",

        "item",
        "items",

        "it",
        "its",
        "it's",

        "this",
        "that",
        "these",
        "those",

        "also",
        "should",
        "must",
        "have",
        "has",

        "which",

        "one",
        "ones",

        "for",
        "with",
        "without",

        "of",
        "the",
        "a",
        "an",
        "me",

        "please"
    ]);

    return keyword
        .split(" ")
        .filter(word => word && !stopWords.has(word))
        .join(" ")
        .trim();

}

// ------------------------------------
// MAIN VALIDATION
// ------------------------------------

function validateFilters(filters, catalog, question) {

    const q = normalize(question);

    // -----------------------------
    // BRAND
    // -----------------------------

    const brand = bestMatch(filters.brand, catalog.brands);

    filters.brand =
        brand && contains(q, brand)
            ? brand
            : "";

    // -----------------------------
    // CATEGORY
    // -----------------------------

    const category = bestMatch(
        filters.category,
        catalog.categories
    );

    filters.category =
        category && contains(q, category)
            ? category
            : "";

    // -----------------------------
    // MODEL
    // -----------------------------

    const model = bestMatch(
        filters.model,
        catalog.models
    );

    filters.model =
        model && contains(q, model)
            ? model
            : "";

    // -----------------------------
    // FEATURE
    // -----------------------------

    const feature = bestMatch(
        filters.feature,
        catalog.features
    );

    filters.feature =
        feature && contains(q, feature)
            ? feature
            : "";

    // -----------------------------
    // KEYWORD
    // -----------------------------

    filters.keyword = cleanKeyword(filters.keyword);

    // If a feature is detected,
    // don't keep it as a keyword.

    if (
        filters.feature &&
        filters.keyword &&
        normalize(filters.keyword) === normalize(filters.feature)
    ) {
        filters.keyword = "";
    }

    // Remove duplicates

    const used = [

        filters.brand,

        filters.category,

        filters.model,

        filters.feature

    ]
        .filter(Boolean)
        .map(normalize);

    if (
        filters.keyword &&
        used.includes(normalize(filters.keyword))
    ) {

        filters.keyword = "";

    }

    return filters;

}

module.exports = {
    validateFilters
};