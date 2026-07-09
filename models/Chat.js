import { sendChatMessage } from "./api/chatApi.js";
import {
    addMessage,
    showTyping,
    removeTyping,
    renderBotResponse
} from "./ui/messageRenderer.js";

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

let sessionId = null;

input.focus();

async function sendMessage() {

    const message = input.value.trim();

    if (!message) return;

    addMessage(chatBox, message, "user");

    input.value = "";

    const typing = showTyping(chatBox);

    try {

        const response = await sendChatMessage({
            message,
            sessionId
        });

        removeTyping(typing);

        if (!response.success) {

            addMessage(chatBox, "Something went wrong.", "bot");
            return;

        }

        const data = response.data;

        sessionId = data.sessionId;

        renderBotResponse(chatBox, data);

    }

    catch (err) {

        removeTyping(typing);

        console.error(err);

        addMessage(chatBox, "Server Error", "bot");

    }

}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        e.preventDefault();

        sendMessage();

    }

});