async function orderNode(state) {

    console.log("Inside Order Node");

    return {
        ...state,
        intent: "ORDER",
        context: [],
        answer: "Order node is under development."
    };

}

module.exports = orderNode;