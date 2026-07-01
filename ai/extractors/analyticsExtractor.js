const { llm } = require("../config/ollama");
const analyticsPrompt = require("../prompts/analyticsPrompt");
const parseJson = require("../utils/jsonParser");
const { getCatalog } = require("../services/catalogService");

async function extractAnalyticsFilter(question) {
    try {
        const catalog = await getCatalog();

        // analyticsPrompt already includes the user question
        const prompt = analyticsPrompt(question, catalog);

        console.log(">>> ANALYTICS INVOKE");

        const result = await llm.invoke(prompt);

        return parseJson(result.content);
    } catch (err) {
        console.error("Analytics Extractor:", err);

        return {
            operation: "",
            filters: {
                category: "",
                brand: "",
                model: "",
                feature: "",
                keyword: "",
                minPrice: null,
                maxPrice: null
            }
        };
    }
}

module.exports = {
    extractAnalyticsFilter
};