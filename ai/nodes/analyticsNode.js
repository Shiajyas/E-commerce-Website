const {
    extractAnalyticsFilter
} = require("../extractors/analyticsExtractor");

const buildAnalyticsQuery =
    require("../builders/analyticsQueryBuilder");

const analyticsRepository =
    require("../repositories/analyticsRepository");

const analyticsResponse =
    require("../services/analyticsResponse");

const contextManager =
    require("../memory/context/contextManager");

async function analyticsNode(state) {

    console.log("========================================");
    console.log("Inside Analytics Node (DOMAIN MEMORY)");
    console.log("========================================");

    // =====================================================
    // Conversation Memory
    // =====================================================

    const memory = state.memory || {};

    const previousFilters =
        memory.analytics?.filters || {};

    const previousResult =
        memory.analytics?.result || null;

    // =====================================================
    // Question
    // =====================================================

    const question =
        state.rewrittenQuestion ||
        state.question ||
        "";

    const lowerQuestion =
        question.toLowerCase();

    // =====================================================
    // Detect Follow-up
    // =====================================================

    const followUpPattern =
        /\b(it|this|that|these|those|same|again|previous|continue|compare|more|details|what about|how about|why|how)\b/i;

    const isFollowUp =
        !!previousResult &&
        followUpPattern.test(lowerQuestion);

    // =====================================================
    // Extract Analytics Request
    // =====================================================

    const analytics =
        await extractAnalyticsFilter(question);

    console.log("Raw Analytics:");
    console.log(analytics);

    // =====================================================
    // Merge Filters
    // =====================================================

    const mergedFilters =
        contextManager.mergeFilters(
            previousFilters,
            analytics.filters || {}
        );

    analytics.filters = mergedFilters;

    console.log("Merged Filters:");
    console.log(mergedFilters);

    let result;

    // =====================================================
    // Detect Filter Changes
    // =====================================================

    const filtersChanged =
        JSON.stringify(previousFilters) !==
        JSON.stringify(mergedFilters);

    // =====================================================
    // Reuse Previous Result
    // =====================================================

    if (
        isFollowUp &&
        previousResult &&
        !filtersChanged
    ) {

        console.log("Using Previous Analytics Result");

        result = previousResult;

    } else {

        const query =
            buildAnalyticsQuery(mergedFilters);

        console.log("Analytics Query:");
        console.log(query);

        result =
            await analyticsRepository(
                analytics.operation,
                query
            );

    }

    console.log("Analytics Result:");
    console.log(result);

    // =====================================================
    // Generate Response
    // =====================================================

    const answer =
        analyticsResponse(
            analytics,
            result
        );

    // =====================================================
    // Save Domain Memory
    // =====================================================

    return {

        ...state,

        intent: "ANALYTICS",

        answer,

        memory: {

            ...memory,

            lastIntent: "ANALYTICS",

            analytics: {

                filters: mergedFilters,

                result

            }

        }

    };

}

module.exports = analyticsNode;