
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

// Efficient retrieval of conversation history
conversationSchema.index({
  sessionId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Conversation", conversationSchema);