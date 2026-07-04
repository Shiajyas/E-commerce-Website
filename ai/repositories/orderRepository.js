const Order = require("../../models/orderSchema");

const DEFAULT_SORT = { createdOn: -1 };

// ========================================
// Common Helpers
// ========================================

async function findOne(filter) {
    return Order.findOne(filter);
}

async function findMany(filter) {
    return Order.find(filter).sort(DEFAULT_SORT);
}

function log(method, userId) {
    console.log(`[OrderRepository] ${method} | userId: ${userId}`);
}

// ========================================
// Latest Order
// ========================================

async function findLatestOrder(userId) {

    log("findLatestOrder", userId);

    return Order.findOne({ userId }).sort(DEFAULT_SORT);
}

// ========================================
// All Orders
// ========================================

async function findAllOrders(userId) {

    log("findAllOrders", userId);

    return findMany({ userId });
}

// ========================================
// By Status
// ========================================

async function findOrdersByStatus(userId, status) {

    log("findOrdersByStatus", userId);

    return findMany({
        userId,
        status: {
            $regex: `^${status}$`,
            $options: "i"
        }
    });
}

// ========================================
// By Payment
// ========================================

async function findOrdersByPayment(userId, payment) {

    log("findOrdersByPayment", userId);

    return findMany({
        userId,
        payment: {
            $regex: `^${payment}$`,
            $options: "i"
        }
    });
}

// ========================================
// By Mongo Order Id
// ========================================

async function findOrderById(userId, orderId) {

    log("findOrderById", userId);

    return findOne({
        userId,
        _id: orderId
    });
}

// ========================================
// By Razorpay Order Id
// ========================================

async function findOrderByRazorpayId(userId, razorpayOrderId) {

    log("findOrderByRazorpayId", userId);

    return findOne({
        userId,
        razorpayOrderId
    });
}

// ========================================
// By Product Name
// ========================================

async function findOrdersByProduct(userId, keyword) {

    log("findOrdersByProduct", userId);

    return findMany({
        userId,
        "product.name": {
            $regex: keyword,
            $options: "i"
        }
    });
}

// ========================================
// Convenience Methods
// ========================================

const findDeliveredOrders = (userId) =>
    findOrdersByStatus(userId, "Delivered");

const findPendingOrders = (userId) =>
    findOrdersByStatus(userId, "Pending");

const findProcessingOrders = (userId) =>
    findOrdersByStatus(userId, "Processing");

const findShippedOrders = (userId) =>
    findOrdersByStatus(userId, "Shipped");

const findCancelledOrders = (userId) =>
    findOrdersByStatus(userId, "Cancelled");

const findReturnedOrders = (userId) =>
    findMany({
        userId,
        return: {
            $exists: true,
            $ne: []
        }
    });

const findRefundOrders = (userId) =>
    findMany({
        userId,
        payment: "Refunded"
    });

// ========================================

module.exports = {
    findLatestOrder,
    findAllOrders,
    findOrdersByStatus,
    findOrdersByPayment,
    findOrderById,
    findOrderByRazorpayId,
    findOrdersByProduct,
    findDeliveredOrders,
    findPendingOrders,
    findProcessingOrders,
    findShippedOrders,
    findCancelledOrders,
    findReturnedOrders,
    findRefundOrders
};