
const Conversation = require("../../models/Conversation");

class ConversationStore {
  /**
   * Save a single message
   */
  async saveMessage({ sessionId, role, content }) {
    return Conversation.create({
      sessionId,
      role,
      content,
    });
  }

  /**
   * Get the latest messages for a session.
   * Returned in chronological order.
   */
  async getMessages(sessionId, limit = 20) {
    const messages = await Conversation.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages.reverse();
  }

  /**
   * Delete an entire conversation.
   */
  async deleteSession(sessionId) {
    return Conversation.deleteMany({
      sessionId,
    });
  }

  /**
   * Count messages in a session.
   */
  async countMessages(sessionId) {
    return Conversation.countDocuments({
      sessionId,
    });
  }

  /**
   * Get the most recent message.
   */
  async getLatestMessage(sessionId) {
    return Conversation.findOne({ sessionId })
      .sort({ createdAt: -1 })
      .lean();
  }
}

module.exports = new ConversationStore();