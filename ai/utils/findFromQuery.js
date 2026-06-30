
const synonyms = require("../data/synonyms.json");
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

function detectBySynonym(question, map) {

    const text = question.toLowerCase();

    let longest = "";

    for (const key of Object.keys(map)) {

        if (text.includes(key.toLowerCase())) {

            if (key.length > longest.length)
                longest = key;
        }
    }

    if (!longest) return "";

    return map[longest];
}

function detectBrand(question, catalog){

    const synonym = detectBySynonym(question, synonyms.brands);

    if(synonym) return synonym;

    return bestMatch(question, catalog.brands);
}

function detectCategory(question,catalog){

    const synonym = detectBySynonym(question, synonyms.categories);

    if(synonym) return synonym;

    return bestMatch(question,catalog.categories);
}

function detectFeature(question,catalog){

    const synonym = detectBySynonym(question,synonyms.features);

    if(synonym) return synonym;

    return bestMatch(question,catalog.features);
}

module.exports = {
    detectBrand,
    detectCategory,
    detectFeature,
    bestMatch
};