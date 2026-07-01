async function accountNode(state) {

    console.log("Inside Account Node");

    return {
        ...state,
        intent: "ACCOUNT",
        context: [],
        answer: "Account node is under development."
    };

}

module.exports = accountNode;