const { llm } = require("../config/ollama");

async function recommendationResponse(
    question,
    products,
    hints
) {

    if (!products.length) {

        return "Sorry, I couldn't find any products matching your requirements.";

    }

    const productList = products
        .map((p, index) => {

            return `
${index + 1}.
Name : ${p.productName}
Brand : ${p.brand}
Category : ${p.category}
Feature : ${p.feature}
Price : ₹${p.salePrice}
Stock : ${p.quantity}
`;

        })
        .join("\n");

    const prompt = `
You are an expert CCTV recommendation assistant.

User Question:

${question}

Recommendation Rules:

${JSON.stringify(hints, null, 2)}

Available Products:

${productList}

Instructions

Recommend ONLY from the available products.

Do NOT invent products.

Do NOT invent prices.

Explain briefly why each product is suitable.

Return a friendly response.
`;

console.log(">>> RECOMMENDATION RESPONSE INVOKE");

    const result = await llm.invoke(prompt);

    return result.content;

}

module.exports = recommendationResponse;