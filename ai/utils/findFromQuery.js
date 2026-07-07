const synonyms = require("../data/synonyms.json");

// --------------------------------------------------
// Normalize text
// --------------------------------------------------

function normalize(text = "") {

    return String(text)
        .toLowerCase()
        .replace(/[₹,]/g, "")
        .replace(/[-_]/g, " ")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}

// --------------------------------------------------
// Remove conversational filler words
// --------------------------------------------------

function cleanQuestion(question = "") {

    const stopWords = [
        "show",
        "me",
        "find",
        "search",
        "buy",
        "need",
        "want",
        "looking",
        "looking for",
        "please",
        "camera",
        "cameras",
        "security",
        "system",

        "it",
        "its",
        "it's",
        "this",
        "that",
        "these",
        "those",

        "one",
        "ones",

        "also",
        "should",
        "must",
        "have",
        "has",
        "with",
        "without",

        "only",
        "just",

        "which",

        "under",
        "below",
        "over",
        "above",
        "between",

        "showing",
        "give",
        "need a",

        "can",
        "could",
        "would",

        "be"
    ];

    let text = normalize(question);

    for (const word of stopWords) {

        const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");

        text = text.replace(regex, " ");

    }

    return text
        .replace(/\s+/g, " ")
        .trim();

}

// --------------------------------------------------
// Escape regex
// --------------------------------------------------

function escapeRegex(str = "") {

    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}

// --------------------------------------------------
// Direct catalog match
// --------------------------------------------------

function detectDirect(question, catalogList = []) {

    const text = cleanQuestion(question);

    const items = [...catalogList].sort(
        (a, b) => b.length - a.length
    );

    for (const item of items) {

        const regex = new RegExp(
            `\\b${escapeRegex(normalize(item))}\\b`,
            "i"
        );

        if (regex.test(text)) {

            return item;

        }

    }

    return null;

}

// --------------------------------------------------
// Synonym match
// --------------------------------------------------

function detectBySynonym(question, synonymMap = {}) {

    const text = cleanQuestion(question);

    const entries = Object.entries(synonymMap).sort(
        (a, b) => b[0].length - a[0].length
    );

    for (const [key, value] of entries) {

        const regex = new RegExp(
            `\\b${escapeRegex(normalize(key))}\\b`,
            "i"
        );

        if (!regex.test(text)) continue;

        if (!value) continue;

        return value;

    }

    return null;

}

// --------------------------------------------------
// Brand
// --------------------------------------------------

function detectBrand(question, catalog) {

    return (
        detectDirect(question, catalog.brands) ||
        detectBySynonym(question, synonyms.brands)
    );

}

// --------------------------------------------------
// Category
// --------------------------------------------------

function detectCategory(question, catalog) {

    return (
        detectDirect(question, catalog.categories) ||
        detectBySynonym(question, synonyms.categories)
    );

}

// --------------------------------------------------
// Feature
// --------------------------------------------------

function detectFeature(question, catalog) {

    return (
        detectDirect(question, catalog.features) ||
        detectBySynonym(question, synonyms.features)
    );

}

// --------------------------------------------------
// Extract everything
// --------------------------------------------------

function extractAll(question, catalog) {

    const brand = detectBrand(question, catalog);

    const category = detectCategory(question, catalog);

    const feature = detectFeature(question, catalog);

    return {

        brand,

        category,

        feature,

        hasSignal: Boolean(
            brand ||
            category ||
            feature
        )

    };

}

module.exports = {

    detectBrand,

    detectCategory,

    detectFeature,

    extractAll

};