const chatService = require("../services/chatService");
const { v4: uuidv4 } = require("uuid");

// ===============================
// Render Chat Page
// ===============================
const getChatPage = (req, res) => {

    console.log("Rendering chat page");

    // Create chat session if not exists
    if (!req.session.chatId) {
        req.session.chatId = uuidv4();
    }

    res.render("chat", {
        sessionId: req.session.chatId,
        user: req.session.user,
        userId: req.session.user || "",
        isLoggedIn: !!req.session.user
    });

};

// ===============================
// Handle Chat Message
// ===============================
const handleChatMessage = async (req, res) => {

    try {

        const userId = req.session.user || "";

        const { message } = req.body;

        // Create session if missing
        if (!req.session.chatId) {
            req.session.chatId = uuidv4();
        }

        const sessionId = req.session.chatId;

        console.log("================================");
        console.log("Incoming Chat");
        console.log({
            userId,
            sessionId,
            message
        });
        console.log("================================");

        const result = await chatService.handleChat({

            question: message,
            sessionId,
            userId

        });

        res.json({

            success: true,

            data: {

                answer: result.answer || "",

                products: result.products || [],

                analytics: result.analytics || null,

                orders: result.orders || [],

                sessionId,

                userId,

                isLoggedIn: !!userId

            }

        });

    }

    catch (error) {

        console.error("Chat Controller Error");
        console.error(error);

        res.status(500).json({

            success: false,

            error: error.message,

            data: {

                answer: "Sorry, something went wrong.",

                products: [],

                analytics: null,

                orders: [],

                sessionId: req.session.chatId || null,

                userId: req.session.user || "",

                isLoggedIn: !!req.session.user

            }

        });

    }

};

module.exports = {

    getChatPage,

    handleChatMessage

};