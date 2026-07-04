
function formatProducts(products = []) {

    if (!products.length)
        return "No products.";

    return products.map((item, index) => {

        return `${index + 1}. ${item.name}
   Qty : ${item.quantity}
   Price : ₹${item.price}`;

    }).join("\n\n");

}

async function orderResponse(question, orders) {

    if (!orders || !orders.length) {

        return "I couldn't find any orders matching your request.";

    }

    // Latest Order

    if (orders.length === 1) {

        const order = orders[0];

        return `Order Status

Order ID : ${order._id}

Status : ${order.status}

Payment : ${order.payment}

Total : ₹${order.totalPrice}

Ordered On : ${new Date(order.createdOn).toLocaleDateString()}

Products

${formatProducts(order.product)}`;

    }

    // Multiple Orders

    let text = `I found ${orders.length} orders.\n\n`;

    orders.forEach((order, index) => {

        text += `${index + 1}.

Order ID : ${order._id}

Status : ${order.status}

Payment : ${order.payment}

Total : ₹${order.totalPrice}

Ordered On : ${new Date(order.createdOn).toLocaleDateString()}

----------------------------

`;

    });

    return text;

}

module.exports = orderResponse;