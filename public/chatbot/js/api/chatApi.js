export async function sendChatMessage(body) {

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(body)

        });

        return await response.json();

    }

    catch (err) {

        console.error(err);

        return { 

            success: false,

            error: err.message

        };

    }

}