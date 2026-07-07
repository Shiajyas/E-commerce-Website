const { llm } = require("../config/ollama");

const productDetailsNode = async (state) => {

    console.log("\n================================");
    console.log("PRODUCT DETAILS NODE");
    console.log("================================");

    // Product is already selected by referenceResolverNode
    const product = state.selectedProduct;

    if (!product) {

        return {
            ...state,
            answer:
                "I couldn't determine which product you're referring to. Please mention the product number or ask for recommendations again."
        };

    }

    console.log("Selected Product:");
    console.log(product.productName);

    const prompt = `
You are an AI assistant for a CCTV ecommerce website.

The customer is asking about a previously recommended product.

Product Information:

Name: ${product.productName}
Brand: ${product.brand}
Category: ${product.category}
Model: ${product.model}
Feature: ${product.feature}
Regular Price: ₹${product.regularPrice}
Sale Price: ₹${product.salePrice}
Stock: ${product.quantity}

Customer Question:
${state.question}

Instructions:

- Answer ONLY using the product information above.
- Explain the product naturally.
- Mention the important features.
- Mention the sale price when relevant.
- If the user asks about something not available in the product data, politely say that information is unavailable.
- Keep the answer concise and helpful.
`;

    const response = await llm.invoke(prompt);

    return {

        ...state,

        answer: response.content,

        selectedProduct: product

    };

};

module.exports = productDetailsNode;