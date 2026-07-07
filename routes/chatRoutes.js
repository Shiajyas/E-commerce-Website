
const express = require("express");
const chatController = require("../controllers/chatController");
const router = express.Router();

router.post("/", chatController.handleChatMessage);

module.exports = router;