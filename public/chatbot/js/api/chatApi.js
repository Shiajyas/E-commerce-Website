export async function sendChatMessage({ message, sessionId }) {

    try {

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                sessionId
            })
        });

        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();

        return {
            success: true,
            data
        };

    } catch (error) {

        return {
            success: false,
            error: error.message || "Something went wrong"
        };
    }
}