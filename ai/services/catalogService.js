

const Product = require("../../models/productSchema");

let cache = {
    categories: [],
    brands: [],
    models: [],
    features: [],
    lastUpdated: 0
};

const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

async function loadCatalog() {

    const now = Date.now();

    if (now - cache.lastUpdated < CACHE_TIME) {
        return cache;
    }

    cache.categories = await Product.distinct("category");
    cache.brands = await Product.distinct("brand");
    cache.models = await Product.distinct("model");
    cache.features = await Product.distinct("feature");

    cache.lastUpdated = now;

    return cache;
}

module.exports = {
    loadCatalog
};