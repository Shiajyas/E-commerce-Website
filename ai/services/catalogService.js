const Product = require("../../models/productSchema");

let cache = {
    categories: [],
    brands: [],
    models: [],
    features: [],
    lastUpdated: 0
};

const CACHE_TIME = 10 * 60 * 1000;

// ----------------------------

async function getCatalog() {

    const now = Date.now();

    if (now - cache.lastUpdated < CACHE_TIME) {
        return cache;
    }

    try {
        const [categories, brands, models, features] = await Promise.all([
            Product.distinct("category"),
            Product.distinct("brand"),
            Product.distinct("model"),
            Product.distinct("feature")
        ]);

        cache = {
            categories,
            brands,
            models,
            features,
            lastUpdated: now
        };

        if (process.env.DEBUG_CATALOG) {
            console.log("\n========== CATALOG ==========");
            console.log("Categories:", categories);
            console.log("Brands:", brands);
            console.log("Models:", models);
            console.log("Features:", features);
            console.log("=============================\n");
        }

        return cache;

    } catch (err) {
        console.error("Catalog fetch failed:", err);
        return cache;
    }
}

module.exports = {
    getCatalog
};