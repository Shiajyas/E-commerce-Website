const ANALYTICS_PATTERNS = [
    "how many",
    "count",
    "total",
    "average",
    "avg",
    "most expensive",
    "highest",
    "lowest",
    "cheapest",
    "stock",
    "available",
    "inventory",
    "price range"
];

const RECOMMENDATION_PATTERNS = [

    // Recommendation words
    "recommend",
    "recommended",
    "suggest",
    "best",
    "ideal",
    "suitable",

    // Requirement based
    "camera for",
    "need camera",
    "which camera",
    "looking for",
    "looking camera",

    // Locations
    "office",
    "home",
    "house",
    "warehouse",
    "parking",
    "shop",
    "store",
    "school",
    "college",
    "hospital",
    "hotel",
    "factory",
    "farm",
    "bank",
    "atm",
    "road",
    "street",
    "gate",
    "garden",
    "villa",
    "building",
    "apartment",
    "hall",
    "restaurant",

    // Features
    "night vision",
    "wifi",
    "wireless",
    "poe",
    "audio",
    "two way audio",
    "motion detection",
    "human detection",
    "face detection",
    "face recognition",
    "number plate",
    "anpr",
    "full color",
    "ai",

    // Usage
    "indoor",
    "outdoor",
    "long range",
    "wide area",
    "360"
];

const PRODUCT_PATTERNS = [
    "show",
    "list",
    "display",
    "search",
    "find",
    "buy",
    "price",
    "under",
    "above",
    "below",

    "hikvision",
    "cpplus",

    "bullet",
    "bullet ip",
    "dome",
    "dome ip",
    "nvr",

    "camera",
    "cameras"
];

const ORDER_PATTERNS = [
    "order",
    "tracking",
    "track",
    "shipment",
    "delivery",
    "refund",
    "cancel order",
    "return order"
];

const ACCOUNT_PATTERNS = [
    "login",
    "register",
    "signup",
    "sign up",
    "password",
    "account",
    "profile"
];

const KNOWLEDGE_PATTERNS = [
    "what is",
    "what are",
    "how does",
    "difference between",
    "meaning of",
    "explain"
];

function score(question, patterns) {
    return patterns.reduce((total, pattern) => {
        return total + (question.includes(pattern) ? 1 : 0);
    }, 0);
}

function detectIntent(question) {

    const q = question.toLowerCase().trim();

    const scores = {
        ANALYTICS: score(q, ANALYTICS_PATTERNS),
        PRODUCT_RECOMMENDATION: score(q, RECOMMENDATION_PATTERNS),
        PRODUCT: score(q, PRODUCT_PATTERNS),
        ORDER: score(q, ORDER_PATTERNS),
        ACCOUNT: score(q, ACCOUNT_PATTERNS),
        KNOWLEDGE: score(q, KNOWLEDGE_PATTERNS)
    };

    console.log("Intent Scores:", scores);

    // High priority intents
    if (scores.ORDER > 0)
        return "ORDER";

    if (scores.ACCOUNT > 0)
        return "ACCOUNT";

    if (scores.KNOWLEDGE > 0)
        return "KNOWLEDGE";

    if (scores.ANALYTICS > 0)
        return "ANALYTICS";

    // Recommendation wins if it has stronger evidence
    if (
        scores.PRODUCT_RECOMMENDATION > 0 &&
        scores.PRODUCT_RECOMMENDATION >= scores.PRODUCT
    ) {
        return "PRODUCT_RECOMMENDATION";
    }

    return "PRODUCT";
}

module.exports = detectIntent;