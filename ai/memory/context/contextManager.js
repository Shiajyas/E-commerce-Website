const contextStore = require("./contextStore");

class ContextManager {

    // =====================================================
    // Load Context
    // =====================================================

    async loadContext(sessionId) {

        if (!sessionId) {
            throw new Error("Session ID is required.");
        }

        const context = await contextStore.getContext(sessionId);

        return (
            context || {

                sessionId,

                lastIntent: null,

                product: {
                    filters: {},
                    products: []
                },

                recommendation: {
                    filters: {},
                    products: []
                },

                order: {
                    filters: {},
                    orders: []
                },

                knowledge: {
                    docs: []
                },

                analytics: {
                    result: null
                }

            }
        );

    }

    // =====================================================
    // Save Intent
    // =====================================================

    async saveIntent(sessionId, intent) {

        return contextStore.updateContext(sessionId, {
            lastIntent: intent
        });

    }

    // =====================================================
    // Save Filters
    // =====================================================

    async saveFilters(sessionId, domain, filters = {}) {

        return contextStore.updateContext(sessionId, {
            [`${domain}.filters`]: filters
        });

    }

    // =====================================================
    // Merge Filters
    // =====================================================

    mergeFilters(previous = {}, current = {}) {

        const merged = { ...previous };

        for (const key of Object.keys(current)) {

            const value = current[key];

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                merged[key] = value;
            }

        }

        return merged;

    }

    // =====================================================
    // Save Products
    // =====================================================

    async saveProducts(sessionId, products = []) {

        return contextStore.updateContext(sessionId, {
            "product.products": products
        });

    }

    // =====================================================
    // Save Orders
    // =====================================================

    async saveOrders(sessionId, orders = []) {

        return contextStore.updateContext(sessionId, {
            "order.orders": orders
        });

    }

    // =====================================================
    // Save Knowledge
    // =====================================================

    async saveKnowledge(sessionId, docs = []) {

        return contextStore.updateContext(sessionId, {
            "knowledge.docs": docs
        });

    }

    // =====================================================
    // Save Recommendation
    // =====================================================

    async saveRecommendation(sessionId, products = []) {

        return contextStore.updateContext(sessionId, {
            "recommendation.products": products
        });

    }

    // =====================================================
    // Get Product Filters
    // =====================================================

    getPreviousProductFilters(context) {

        return context?.product?.filters || {};

    }

    // =====================================================
    // Get Product List
    // =====================================================

    getPreviousProducts(context) {

        return context?.product?.products || [];

    }

    // =====================================================
    // Get Order Filters
    // =====================================================

    getPreviousOrderFilters(context) {

        return context?.order?.filters || {};

    }

    // =====================================================
    // Get Orders
    // =====================================================

    getPreviousOrders(context) {

        return context?.order?.orders || [];

    }

    // =====================================================
    // Get Knowledge Docs
    // =====================================================

    getPreviousKnowledge(context) {

        return context?.knowledge?.docs || [];

    }

    // =====================================================
    // Get Recommendation Products
    // =====================================================

    getPreviousRecommendation(context) {

        return context?.recommendation?.products || [];

    }

    // =====================================================
    // Clear
    // =====================================================

    async clear(sessionId) {

        return contextStore.clearContext(sessionId);

    }

    // =====================================================
    // Delete
    // =====================================================

    async delete(sessionId) {

        return contextStore.deleteContext(sessionId);

    }

}

module.exports = new ContextManager();