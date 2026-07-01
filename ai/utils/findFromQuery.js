const synonyms = require("../data/synonyms.json");

// --------------------------------------------------
// Normalize text
// --------------------------------------------------

function normalize(text = "") {
    return String(text)
        .toLowerCase()
        .replace(/[-_]/g, " ")
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
// Direct Catalog Match
// --------------------------------------------------

function detectDirect(question, catalogList = []) {

    const text = normalize(question);

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
// Synonym Match
// (DO NOT depend on catalog)
// --------------------------------------------------

function detectBySynonym(question, synonymMap = {}) {

    const text = normalize(question);

    const entries = Object.entries(synonymMap).sort(
        (a, b) => b[0].length - a[0].length
    );

    for (const [key, value] of entries) {

        const regex = new RegExp(
            `\\b${escapeRegex(normalize(key))}\\b`,
            "i"
        );

        if (!regex.test(text)) {
            continue;
        }

        // Ignore generic words like "camera"
        if (!value) {
            continue;
        }

        // Return normalized synonym value.
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
// Extract All
// --------------------------------------------------

function extractAll(question, catalog) {

    const brand = detectBrand(question, catalog);

    const category = detectCategory(question, catalog);

    const feature = detectFeature(question, catalog);

    return {
        brand,
        category,
        feature,
        hasSignal: !!(brand || category || feature)
    };

}

module.exports = {
    detectBrand,
    detectCategory,
    detectFeature,
    extractAll
};