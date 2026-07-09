const { llm } = require("../config/ollama");

async function recommendationResponse(
    question,
    products,
    hints
) {
    console.log("=================================");
    console.log(">>> RECOMMENDATION RESPONSE");
    console.log("=================================");

    if (!products || products.length === 0) {
        return {
            answer:
                "Sorry, I couldn't find any products matching your requirements.",
            products: [],
        };
    }

    // Sort by cheapest first
    products.sort((a, b) => a.salePrice - b.salePrice);

    const MAX_RESULTS = 10;
    const displayProducts = products.slice(0, MAX_RESULTS);

    const productList = displayProducts
        .map(
            (p, index) => `
${index + 1}.
Name : ${p.productName}
Brand : ${p.brand}
Category : ${p.category}
Feature : ${p.feature}
Price : ₹${p.salePrice}
Stock : ${p.quantity}
`
        )
        .join("\n");

    const prompt = `
You are an expert CCTV recommendation assistant.

User Question:
${question}

Recommendation Rules:
${JSON.stringify(hints, null, 2)}

Available Products:
${productList}

Instructions:
- Recommend ONLY from the available products.
- Never invent products.
- Never invent prices.
- Explain briefly why each product is suitable.
- Mention the important features.
- Keep the response friendly and concise.
`;

    // Ask the LLM
    const result = await llm.invoke(prompt);

    // Build response object
    const response = {
        answer: result.content,
        products: displayProducts.map((product) => ({
            _id: product._id,
            productName: product.productName,
            brand: product.brand,
            category: product.category,
            feature: product.feature,
            salePrice: product.salePrice,
            regularPrice: product.regularPrice,
            quantity: product.quantity,
            image:
                product.productImage?.[0] ||
                "/images/no-image.png",
        })),
    };

    // Debug logs
    console.log("\n========== LLM RESPONSE ==========");
    console.log(response.answer);

    console.log("\n========== PRODUCTS ==========");
    console.dir(response.products, { depth: null });

    console.log("\n========== FULL RESPONSE ==========");
    console.dir(response, { depth: null });

    return response;
}

module.exports = recommendationResponse;