
const {
    extractOrder
} = require("../extractors/orderExtractor")

const {

    findLatestOrder,

    findAllOrders,

    findOrdersByStatus,

    findOrdersByProduct,

    findCancelledOrders,

    findDeliveredOrders,

    findPendingOrders

} = require("../repositories/orderRepository");

const orderResponse =
require("../services/orderResponse");

async function orderNode(state) {

    console.log("========================================");
    console.log("Inside Order Node");

    //----------------------------------
    // User Id
    //----------------------------------

    const userId = state.userId;

    if (!userId) {

        return {

            ...state,

            intent: "ORDER",

            context: [],

            answer: "Please login to view your orders."

        };

    }

    //----------------------------------
    // Extract
    //----------------------------------

    const filters =
        await extractOrder(state.question);

    console.log("Order Filters");

    console.log(filters);

    //----------------------------------
    // Repository
    //----------------------------------

    let orders = [];

    switch (filters.action) {

        case "track":

            if (filters.product) {

                orders =
                    await findOrdersByProduct(
                        userId,
                        filters.product
                    );

            }

            else {

                const latest =
                    await findLatestOrder(userId);

                if (latest)
                    orders = [latest];

            }

            break;

        case "history":

            orders =
                await findAllOrders(userId);

            break;

        case "cancel":

            orders =
                await findCancelledOrders(userId);

            break;

        case "delivery":

            orders =
                await findDeliveredOrders(userId);

            break;

        case "payment":

            orders =
                await findAllOrders(userId);

            break;

        default:

            orders =
                await findLatestOrder(userId);

            if (orders)
                orders = [orders];
            else
                orders = [];

    }

    //----------------------------------
    // Status Filter
    //----------------------------------

    if (filters.status) {

        orders = orders.filter(order =>

            order.status.toLowerCase() ===
            filters.status.toLowerCase()

        );

    }

    console.log("Orders Found :", orders.length);

    //----------------------------------
    // Response
    //----------------------------------

    const answer =
        await orderResponse(
            state.question,
            orders
        );

    return {

        ...state,

        intent: "ORDER",

        context: orders,

        answer

    };

}

module.exports = orderNode;