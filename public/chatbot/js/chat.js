import { sendChatMessage } from "./api/chatApi.js";

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const typing = document.getElementById("typing");


const chatConfig = window.chatConfig || {};

let sessionId = chatConfig.sessionId || null;

let currentUserId = chatConfig.userId || "";

const isLoggedIn = !!currentUserId;

/* ==========================================
   Local Storage
========================================== */

function getStorageKey() {

    return currentUserId
        ? `chat_${currentUserId}`
        : "chat_guest";

}

function saveChat() {

    localStorage.setItem(
        getStorageKey(),
        chatBox.innerHTML
    );

}

function loadChat() {

    const history = localStorage.getItem(
        getStorageKey()
    );

    if (history) {

        chatBox.innerHTML = history;

        scrollBottom();

    }

}

function clearChatStorage(userId) {

    if (!userId) {

        localStorage.removeItem("chat_guest");

        return;

    }

    localStorage.removeItem(`chat_${userId}`);

}

/* ==========================================
   Escape HTML
========================================== */

function escapeHtml(text) {

    if (!text) return "";

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* ==========================================
   Scroll
========================================== */

function scrollBottom() {

    chatBox.scrollTop = chatBox.scrollHeight;

}

/* ==========================================
   Typing
========================================== */

function showTyping() {

    typing.style.display = "flex";

    scrollBottom();

}

function hideTyping() {

    typing.style.display = "none";

}

/* ==========================================
   User Message
========================================== */

function addUserMessage(message) {

    chatBox.insertAdjacentHTML(
        "beforeend",
        `
        <div class="user-message">
            <div class="bubble">
                ${escapeHtml(message)}
            </div>
        </div>
        `
    );

    saveChat();

    scrollBottom();

}

/* ==========================================
   Bot Message
========================================== */

function addBotMessage(message) {

    chatBox.insertAdjacentHTML(
        "beforeend",
        `
        <div class="bot-message">
            <div class="bubble">
                ${message}
            </div>
        </div>
        `
    );

    saveChat();

    scrollBottom();

}

/* ==========================================
   Product Card
========================================== */

function renderProduct(product) {

    const image = product.image
        ? `/uploads/product-images/${product.image}`
        : "/images/no-image.png";

    const stock =
        product.quantity > 0
            ? `<span class="stock in">In Stock</span>`
            : `<span class="stock out">Out of Stock</span>`;

    return `

    <div class="product-card">

        <img
            class="product-image"
            src="${image}"
        >

        <div class="product-info">

            <div class="product-title">
                ${escapeHtml(product.productName)}
            </div>

            <div class="product-brand">
                ${escapeHtml(product.brand)}
            </div>

            <div class="product-feature">
                ${escapeHtml(product.feature)}
            </div>

            <div class="product-price">
                ₹${Number(product.salePrice).toLocaleString("en-IN")}
            </div>

            <div class="product-actions">

                <a
                    class="view-btn"
                    href="/productDetails?id=${product._id}"
                >
                    View Product
                </a>

                ${stock}

            </div>

        </div>

    </div>

    `;

}

/* ==========================================
   Analytics
========================================== */

function renderAnalytics(text) {

    return `
        <div class="analytics-card">
            ${text}
        </div>
    `;

}

/* ==========================================
   Quick Buttons
========================================== */

document.addEventListener("click", e => {

    if (!e.target.classList.contains("quick-btn")) return;

    input.value = e.target.innerText;

    sendMessage();

});

/* ==========================================
   Send Message
========================================== */

async function sendMessage() {

    const message = input.value.trim();

    if (!message) return;

    addUserMessage(message);

    input.value = "";

    input.focus();

    showTyping();

    try {

        const result = await sendChatMessage({

            message,

            sessionId

        });

        hideTyping();

        if (!result.success) {

            addBotMessage("Something went wrong.");

            return;

        }

        const data = result.data;

        sessionId = data.sessionId;
if (data.userId && data.userId !== currentUserId) {

    const guestChat = localStorage.getItem("chat_guest");

    currentUserId = data.userId;

    if (guestChat) {

        localStorage.setItem(
            getStorageKey(),
            guestChat
        );

        localStorage.removeItem("chat_guest");

    }

}
        let html = "";

        if (data.answer) {

            html += `<p>${data.answer}</p>`;

        }

        if (data.analytics) {

            html += renderAnalytics(data.analytics);

        }

        if (data.products && data.products.length) {

            html += "<br>";

            html += "<h6>Recommended Products</h6>";

            data.products.forEach(product => {

                html += renderProduct(product);

            });

        }

        addBotMessage(html);

    }

    catch (err) {

        hideTyping();

        console.error(err);

        addBotMessage("Server Error");

    }

}

/* ==========================================
   Initialize
========================================== */

function init() {

    console.log("Chat Config:", chatConfig);

    console.log("Current User:", currentUserId || "Guest");

    console.log("Storage Key:", getStorageKey());

    loadChat();

}

init();

/* ==========================================
   Events
========================================== */

sendBtn.addEventListener(
    "click",
    sendMessage
);

input.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            e.preventDefault();

            sendMessage();

        }

    }
);

input.focus();

/* ==========================================
   Export
========================================== */

window.ChatStorage = {

    clearChatStorage

};