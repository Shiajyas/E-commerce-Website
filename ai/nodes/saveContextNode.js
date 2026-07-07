const contextStore =
    require("../memory/context/contextStore");

async function saveContextNode(state) {

    try {

        console.log("\n================================");
        console.log("CONTEXT NODE (SAVE)");
        console.log("================================");

        const sessionId = state.sessionId;

        if (!sessionId) {
            throw new Error("Session ID missing in state");
        }

        const memory = state.memory || {};

        await contextStore.saveContext(sessionId, {

            lastIntent:
                state.intent ??
                memory.lastIntent ??
                null,

            product: {

                filters:
                    memory.product?.filters ?? {},

                products:
                    memory.product?.products ?? []

            },

            recommendation: {

                filters:
                    memory.recommendation?.filters ?? {},

                products:
                    memory.recommendation?.products ?? []

            },

            order: {

                filters:
                    memory.order?.filters ?? {},

                orders:
                    memory.order?.orders ?? []

            },

            knowledge: {

                docs:
                    memory.knowledge?.docs ?? []

            },

            analytics: {

                result:
                    memory.analytics?.result ?? null

            }

        });

        console.log("Memory Saved Successfully");

        return state;

    }

    catch (error) {

        console.error(
            "Save Context Node Error:",
            error
        );

        return state;

    }

}

module.exports = saveContextNode;