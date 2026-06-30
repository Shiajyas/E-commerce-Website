const { search } = require("fast-fuzzy");

function bestMatch(value, list) {

    if (!value) return "";

    const results = search(value, list, {
        returnMatchData: true
    });

    if (!results.length) return "";

    return results[0].score >= 0.75
        ? results[0].item
        : "";
}

function contains(question, value) {

    if (!value) return false;

    return question
        .toLowerCase()
        .includes(value.toLowerCase());
}

function validateFilters(filters, catalog, question) {

    filters.brand =
        bestMatch(filters.brand, catalog.brands);

    filters.category =
        bestMatch(filters.category, catalog.categories);

    filters.model =
        bestMatch(filters.model, catalog.models);

    filters.feature =
        bestMatch(filters.feature, catalog.features);

    // Remove hallucinated model
    if (
        filters.model &&
        !contains(question, filters.model)
    ) {
        filters.model = "";
    }

    // Remove hallucinated feature
    if (
        filters.feature &&
        !contains(question, filters.feature)
    ) {
        filters.feature = "";
    }

    return filters;
}

module.exports = {
    validateFilters
};