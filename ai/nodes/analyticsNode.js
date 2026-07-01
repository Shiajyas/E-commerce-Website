const { extractAnalyticsFilter } = require("../extractors/analyticsExtractor");
const buildAnalyticsQuery = require("../builders/analyticsQueryBuilder");
const analyticsRepository = require("../repositories/analyticsRepository");
const analyticsResponse = require("../services/analyticsResponse");

async function analyticsNode(state) {

    console.log("Inside Analytics Node");

    const analytics = await extractAnalyticsFilter(state.question);

    console.log(analytics);

    // Pass only filters
    const query = buildAnalyticsQuery(analytics.filters);

    console.log(query);

    const result = await analyticsRepository(
        analytics.operation,
        query
    );

    console.log(result);

    const answer = analyticsResponse(
        analytics,
        result
    );

    return {
        ...state,
        intent: "ANALYTICS",
        context: result,
        answer
    };
}

module.exports = analyticsNode;