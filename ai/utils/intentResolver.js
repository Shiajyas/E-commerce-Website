/**
 * Resolve ambiguous intents using
 * conversation memory + business rules.
 */

const PRODUCT_BROWSE_KEYWORDS = [
    "show",
    "list",
    "find",
    "search",
    "display",
    "browse",
    "camera",
    "cameras",
    "hikvision",
    "cp plus",
    "cpplus",
    "dahua",
    "under",
    "below",
    "above",
    "between",
    "wifi",
    "wireless",
    "bullet",
    "dome",
    "ip",
    "ip camera",
    "nvr",
    "dvr"
];

const FOLLOW_UP_PATTERNS = [
    /\bit\b/i,
    /\bits\b/i,
    /\bthis\b/i,
    /\bthat\b/i,
    /\bthey\b/i,
    /\bthem\b/i,

    /\bfirst\b/i,
    /\bsecond\b/i,
    /\bthird\b/i,

    /\bwhich\b/i,
    /\bcompare\b/i,
    /\bmore\b/i,
    /\bagain\b/i,
    /\balso\b/i,

    /\bcheaper\b/i,
    /\bbetter\b/i,

    /\badvantages\b/i,
    /\bbenefits\b/i,
    /\bdrawbacks\b/i,

    /\bdetails\b/i,
    /\bfeatures\b/i,

    /\bhow\b/i,
    /\bwhy\b/i,
    /\bwhen\b/i,
    /\bwhere\b/i,

    /\bstatus\b/i,
    /\btrack\b/i
];

function resolveIntent(state, llmIntent) {

    const question =
        (state.rewrittenQuestion || state.question || "")
            .toLowerCase();

    const history =
        state.chatHistory || [];

    const memory =
        state.memory || {};

    const previousIntent =
        memory.lastIntent || null;

    const hasProducts =
        (memory.product?.products || []).length > 0;

    const hasRecommendations =
        (memory.recommendation?.products || []).length > 0;

    const hasKnowledge =
        (memory.knowledge?.docs || []).length > 0;

    const hasOrders =
        (memory.order?.orders || []).length > 0;

    const hasAnalytics =
        !!memory.analytics?.result;

    const previousUserMessage =
        [...history]
            .reverse()
            .find(msg => msg.role === "user");

    const previousQuestion =
        previousUserMessage?.content?.toLowerCase() || "";

    const wasBrowsingProducts =
        PRODUCT_BROWSE_KEYWORDS.some(word =>
            previousQuestion.includes(word)
        );

    const isFollowUp =
        FOLLOW_UP_PATTERNS.some(pattern =>
            pattern.test(question)
        );

    console.log("\n========== Intent Resolver ==========");
    console.log("LLM Intent:", llmIntent);
    console.log("Previous Intent:", previousIntent);
    console.log("Follow Up:", isFollowUp);

    // =====================================================
    // Trust the LLM unless it is uncertain
    // =====================================================

    if (llmIntent !== "GENERAL") {

        // Exception:
        // If the user was browsing products and asks
        // "which one", "better", etc., stay in PRODUCT.

        if (
            llmIntent === "PRODUCT_RECOMMENDATION" &&
            wasBrowsingProducts &&
            isFollowUp
        ) {
            return "PRODUCT";
        }

        return llmIntent;
    }

    // =====================================================
    // LLM returned GENERAL
    // Recover from memory
    // =====================================================

    if (!isFollowUp) {
        return "GENERAL";
    }

    if (
        previousIntent === "PRODUCT" &&
        hasProducts
    ) {

        console.log("Recovered PRODUCT");

        return "PRODUCT";
    }

    if (
        previousIntent === "PRODUCT_RECOMMENDATION" &&
        hasRecommendations
    ) {

        console.log("Recovered PRODUCT_RECOMMENDATION");

        return "PRODUCT_RECOMMENDATION";
    }

    if (
        previousIntent === "KNOWLEDGE" &&
        hasKnowledge
    ) {

        console.log("Recovered KNOWLEDGE");

        return "KNOWLEDGE";
    }

    if (
        previousIntent === "ORDER" &&
        hasOrders
    ) {

        console.log("Recovered ORDER");

        return "ORDER";
    }

    if (
        previousIntent === "ANALYTICS" &&
        hasAnalytics
    ) {

        console.log("Recovered ANALYTICS");

        return "ANALYTICS";
    }

    return "GENERAL";

}

module.exports = resolveIntent;