async function accountNode(state) {

    console.log("Inside Account Node");

    return {
        ...state,
        intent: "ACCOUNT",
        memory: [],
        answer: "Account node is under development."
    };

}

module.exports = accountNode;