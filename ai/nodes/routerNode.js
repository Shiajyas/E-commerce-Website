const routerPrompt = require("../prompts/routerPrompt");
const { llm } = require("../config/ollama");
const resolveIntent = require("../utils/intentResolver");

const VALID_INTENTS = new Set([
    "PRODUCT",
    "PRODUCT_RECOMMENDATION",
    "PRODUCT_DETAILS",
    "ANALYTICS",
    "ORDER",
    "ACCOUNT",
    "KNOWLEDGE",
    "GENERAL"
]);

async function routerNode(state) {

    console.log("Router received state:");
    console.dir(state, { depth: null });

    try {

        const question =
            state.rewrittenQuestion ??
            state.question ??
            state.message ??
            "";

        const lowerQuestion = question.toLowerCase();

        const history = (state.chatHistory || [])
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n");

        console.log("\n================================");
        console.log("ROUTER NODE");
        console.log("================================");
        console.log("Question :", question);

        const memory = state.memory || {};

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

        //----------------------------------------------------
        // Follow-up Detection
        //----------------------------------------------------

        const followUpPattern =
            /\b(it|its|this|that|these|those|they|them|he|she|first|second|third|one|ones|which|how|why|when|where|advantages|benefits|drawbacks|pros|cons|details|detail|features|specifications|support|compatible|works?|working|more|again|continue|expand|compare|same|also|another|cheaper|better|difference|instead)\b/i;

        const isFollowUp =
            followUpPattern.test(lowerQuestion);

        //----------------------------------------------------
        // Product Reference Detection
        //----------------------------------------------------

        const productReferencePattern =
            /\b(product\s*\d+|\d+\s*product|number\s*\d+|no\.?\s*\d+|tell me about\s*\d+|talk about\s*\d+|describe\s*\d+|show\s*\d+)\b/i;

        const numberMatch =
            lowerQuestion.match(/\b(\d+)\b/);

        const isProductReference =
            hasRecommendations &&
            (
                productReferencePattern.test(lowerQuestion) ||
                (
                    numberMatch &&
                    (
                        lowerQuestion.includes("product") ||
                        lowerQuestion.includes("about") ||
                        lowerQuestion.includes("tell") ||
                        lowerQuestion.includes("talk") ||
                        lowerQuestion.includes("describe")
                    )
                )
            );

        if (isProductReference) {

            console.log("Product Reference Detected");

            return {

                ...state,

                previousIntent,

                selectedProductIndex:
                    Number(numberMatch[1]) - 1,

                intent: "PRODUCT_DETAILS"

            };

        }

        //----------------------------------------------------
        // Ask LLM
        //----------------------------------------------------

        const prompt =
            await routerPrompt.formatMessages({
                history,
                question
            });

        const response =
            await llm.invoke(prompt);

        let llmIntent =
            String(response.content)
                .trim()
                .toUpperCase();

        if (!VALID_INTENTS.has(llmIntent)) {
            llmIntent = "GENERAL";
        }

        console.log("LLM Intent :", llmIntent);

        //----------------------------------------------------
        // Recover Previous Intent
        //----------------------------------------------------

        if (
            isFollowUp &&
            previousIntent &&
            llmIntent === "GENERAL"
        ) {

            switch (previousIntent) {

                case "PRODUCT":

                    if (hasProducts)
                        llmIntent = "PRODUCT";

                    break;

                case "PRODUCT_RECOMMENDATION":

                    if (hasRecommendations)
                        llmIntent =
                            "PRODUCT_RECOMMENDATION";

                    break;

                case "KNOWLEDGE":

                    if (hasKnowledge)
                        llmIntent = "KNOWLEDGE";

                    break;

                case "ORDER":

                    if (hasOrders)
                        llmIntent = "ORDER";

                    break;

                case "ANALYTICS":

                    if (hasAnalytics)
                        llmIntent = "ANALYTICS";

                    break;

            }

            console.log(
                "Recovered Intent:",
                llmIntent
            );

        }

        //----------------------------------------------------
        // Final Intent
        //----------------------------------------------------

        const finalIntent =
            resolveIntent(
                {
                    ...state,
                    memory
                },
                llmIntent
            );

        console.log("Final Intent :", finalIntent);

        return {

            ...state,

            previousIntent,

            intent: finalIntent

        };

    } catch (error) {

        console.error(error);

        return {

            ...state,

            previousIntent: null,

            intent: "GENERAL"

        };

    }

}

module.exports = routerNode;