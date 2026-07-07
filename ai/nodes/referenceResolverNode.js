

const ORDINAL_MAP = {
    first: 0,
    second: 1,
    third: 2,
    fourth: 3,
    fifth: 4,
    sixth: 5,
    seventh: 6,
    eighth: 7,
    ninth: 8,
    tenth: 9
};

async function referenceResolverNode(state) {

    console.log("\n================================");
    console.log("REFERENCE RESOLVER NODE");
    console.log("================================");

    const question = (state.question || "").toLowerCase();

    const products =
        state.memory?.recommendation?.products || [];

    // Nothing to resolve
    if (!products.length) {

        console.log("No recommended products found.");

        return state;
    }

    //------------------------------------------------
    // 1. Numeric Reference
    //------------------------------------------------

    let index = null;

    const numberMatch =
        question.match(/\b(\d+)\b/);

    if (numberMatch) {

        index = Number(numberMatch[1]) - 1;

    }

    //------------------------------------------------
    // 2. Ordinal Reference
    //------------------------------------------------

    if (index === null) {

        for (const word of Object.keys(ORDINAL_MAP)) {

            if (question.includes(word)) {

                index = ORDINAL_MAP[word];

                break;

            }

        }

    }

    //------------------------------------------------
    // 3. First / Last
    //------------------------------------------------

    if (index === null) {

        if (question.includes("last")) {

            index = products.length - 1;

        }

        if (question.includes("first")) {

            index = 0;

        }

    }

    //------------------------------------------------
    // 4. Cheapest
    //------------------------------------------------

    if (
        question.includes("cheapest") ||
        question.includes("lowest price")
    ) {

        const cheapest =
            [...products].sort(
                (a, b) =>
                    a.salePrice - b.salePrice
            )[0];

        console.log(
            "Resolved: Cheapest Product"
        );

        return {

            ...state,

            selectedProduct: cheapest,

            intent: "PRODUCT_DETAILS"

        };

    }

    //------------------------------------------------
    // 5. Costliest
    //------------------------------------------------

    if (
        question.includes("costliest") ||
        question.includes("most expensive")
    ) {

        const expensive =
            [...products].sort(
                (a, b) =>
                    b.salePrice - a.salePrice
            )[0];

        console.log(
            "Resolved: Costliest Product"
        );

        return {

            ...state,

            selectedProduct: expensive,

            intent: "PRODUCT_DETAILS"

        };

    }

    //------------------------------------------------
    // 6. Brand Reference
    //------------------------------------------------

    for (const product of products) {

        if (
            question.includes(product.brand.toLowerCase())
        ) {

            console.log(
                "Resolved By Brand:",
                product.brand
            );

            return {

                ...state,

                selectedProduct: product,

                intent: "PRODUCT_DETAILS"

            };

        }

    }

    //------------------------------------------------
    // 7. Index Reference
    //------------------------------------------------

    if (
        index !== null &&
        index >= 0 &&
        index < products.length
    ) {

        console.log(
            "Resolved Product Index:",
            index + 1
        );

        return {

            ...state,

            selectedProduct: products[index],

            intent: "PRODUCT_DETAILS"

        };

    }

    console.log("No reference detected.");

    return state;

}

module.exports = referenceResolverNode;