const mongoose = require("mongoose");

const conversationContextSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        // =====================================================
        // Last Intent
        // =====================================================

        lastIntent: {
            type: String,
            default: null
        },

        // =====================================================
        // Product Memory
        // =====================================================

        product: {
            filters: {
                type: Object,
                default: {}
            },

            products: {
                type: Array,
                default: []
            }
        },

        // =====================================================
        // Recommendation Memory
        // =====================================================

        recommendation: {
            filters: {
                type: Object,
                default: {}
            },

            products: {
                type: Array,
                default: []
            }
        },

        // =====================================================
        // Order Memory
        // =====================================================

        order: {
            filters: {
                type: Object,
                default: {}
            },

            orders: {
                type: Array,
                default: []
            }
        },

        // =====================================================
        // Knowledge Memory
        // =====================================================

        knowledge: {
            docs: {
                type: Array,
                default: []
            }
        },

        // =====================================================
        // Analytics Memory
        // =====================================================

        analytics: {
            result: {
                type: Object,
                default: null
            }
        }

    },
    {
        timestamps: true
    }
);

const ConversationContext = mongoose.model(
    "ConversationContext",
    conversationContextSchema
);

class ContextStore {

    // =====================================================
    // Load
    // =====================================================

    async getContext(sessionId) {

        return await ConversationContext
            .findOne({ sessionId })
            .lean();

    }

    // =====================================================
    // Save Complete Context
    // =====================================================

    async saveContext(sessionId, data) {

        return await ConversationContext.findOneAndUpdate(

            { sessionId },

            {
                $set: data
            },

            {
                new: true,
                upsert: true
            }

        ).lean();

    }

    // =====================================================
    // Partial Update
    // =====================================================

    async updateContext(sessionId, updates) {

        return await ConversationContext.findOneAndUpdate(

            { sessionId },

            {
                $set: updates
            },

            {
                new: true,
                upsert: true
            }

        ).lean();

    }

    // =====================================================
    // Exists
    // =====================================================

    async hasContext(sessionId) {

        return !!await ConversationContext.exists({
            sessionId
        });

    }

    // =====================================================
    // Delete
    // =====================================================

    async deleteContext(sessionId) {

        return await ConversationContext.deleteOne({
            sessionId
        });

    }

    // =====================================================
    // Clear
    // =====================================================

    async clearContext(sessionId) {

        return await ConversationContext.findOneAndUpdate(

            { sessionId },

            {
                $set: {

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
            },

            {
                new: true,
                upsert: true
            }

        ).lean();

    }

}

module.exports = new ContextStore();