const chatService = require("../services/chatService");
const { v4: uuidv4 } = require("uuid");



const getChatPage = (req, res) => {

    console.log("Rendering chat page");

    if (!req.session.chatId) {
        req.session.chatId = uuidv4();
    }

    res.render("chat", {
        sessionId: req.session.chatId,
        user: req.session.user
    });
};


// Handle User Message
const handleChatMessage = async (req, res) => {

    try {


        const userId = req.session.user || null;


        const {
            message
        } = req.body;



        // Get existing chat session
        let sessionId = req.session.chatId;



        // If chatId does not exist create one
        if (!sessionId) {

            sessionId = uuidv4();

            req.session.chatId = sessionId;
        }



        console.log({
            userId,
            sessionId,
            message
        });



        const result = await chatService.handleChat({

            question: message,

            sessionId,

            userId

        });



        res.json({

            success: true,

            answer: result.answer,

            sessionId

        });



    } catch (error) {


        console.log(
            "Chat Controller Error:",
            error
        );


        res.status(500).json({

            success:false,

            answer:"Error in AI system"

        });

    }
};



module.exports = {

    getChatPage,

    handleChatMessage

};