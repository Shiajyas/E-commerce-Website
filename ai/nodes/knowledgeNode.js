async function knowledgeNode(state) {

    console.log("Inside Knowledge Node");

    return {
        ...state,
        intent: "KNOWLEDGE",
        context: [],
        answer: "Knowledge node is under development."
    };

}

module.exports = knowledgeNode;