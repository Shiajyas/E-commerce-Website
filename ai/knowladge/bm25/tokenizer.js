
/**
 * tokenizer.js
 *
 * Responsible for converting text into searchable tokens.
 * Used by:
 *  - BM25 Index
 *  - Keyword Search
 *  - Query Processing
 */

const STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "he",
    "her",
    "his",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "me",
    "my",
    "of",
    "on",
    "or",
    "our",
    "she",
    "that",
    "the",
    "their",
    "them",
    "there",
    "they",
    "this",
    "to",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "will",
    "with",
    "you",
    "your",

    // Common chatbot words
    "please",
    "show",
    "tell",
    "give",
    "can",
    "could",
    "would",
    "should",
    "want",
    "need",

    // Ecommerce words
    "order",
    "orders",
    "product",
    "products",

    // Question helpers
    "how",
    "does",
    "do",
    "did"
]);

/**
 * Normalize text
 */
function normalize(text = "") {

    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}

/**
 * Tokenize text
 */
function tokenize(text = "") {

    const normalized = normalize(text);

    if (!normalized) {

        return [];

    }

    return normalized
        .split(" ")
        .filter(Boolean)
        .filter(word => !STOP_WORDS.has(word));

}

/**
 * Create frequency map
 */
function termFrequency(tokens = []) {

    const freq = {};

    for (const token of tokens) {

        freq[token] = (freq[token] || 0) + 1;

    }

    return freq;

}

/**
 * Unique tokens
 */
function uniqueTokens(tokens = []) {

    return [...new Set(tokens)];

}

module.exports = {

    normalize,

    tokenize,

    termFrequency,

    uniqueTokens

};