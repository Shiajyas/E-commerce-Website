const conversationStore = require("./conversationStore");

class MemoryManager {
  constructor(options = {}) {
    /**
     * Maximum number of recent messages
     * to send to the LLM.
     *
     * Can later be moved to process.env.
     */
    this.MAX_HISTORY = options.maxHistory || 20;
  }

  /**
   * Load recent conversation history.
   *
   * Messages are returned in chronological order
   * because conversationStore already reverses them.
   */
  async loadConversation(sessionId) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    return await conversationStore.getMessages(
      sessionId,
      this.MAX_HISTORY
    );
  }

  /**
   * Convert database documents into
   * generic chat messages.
   *
   * Compatible with:
   * - Ollama
   * - OpenAI
   * - LangChain
   * - Most chat APIs
   */
  buildChatHistory(messages = []) {
    return messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }

  /**
   * Load conversation and return it
   * in chat format.
   */
  async getChatHistory(sessionId) {
    const messages = await this.loadConversation(sessionId);

    return this.buildChatHistory(messages);
  }

  /**
   * Save a user message.
   */
  async saveUserMessage(sessionId, content) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    if (!content || !content.trim()) {
      throw new Error("User message cannot be empty.");
    }

    return await conversationStore.saveMessage({
      sessionId,
      role: "user",
      content: content.trim(),
    });
  }

  /**
   * Save an assistant message.
   */
  async saveAssistantMessage(sessionId, content) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    if (!content || !content.trim()) {
      throw new Error("Assistant message cannot be empty.");
    }

    return await conversationStore.saveMessage({
      sessionId,
      role: "assistant",
      content: content.trim(),
    });
  }

  /**
   * Save a system message.
   * Useful later for summaries,
   * internal prompts, etc.
   */
  async saveSystemMessage(sessionId, content) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    if (!content || !content.trim()) {
      throw new Error("System message cannot be empty.");
    }

    return await conversationStore.saveMessage({
      sessionId,
      role: "system",
      content: content.trim(),
    });
  }

  /**
   * Delete an entire conversation.
   */
  async clearConversation(sessionId) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    return await conversationStore.deleteSession(sessionId);
  }

  /**
   * Count total messages
   * in a conversation.
   */
  async getMessageCount(sessionId) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    return await conversationStore.countMessages(sessionId);
  }

  /**
   * Get the latest message
   * in a conversation.
   */
  async getLatestMessage(sessionId) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    return await conversationStore.getLatestMessage(sessionId);
  }

  /**
   * Check whether
   * conversation exists.
   */
  async hasConversation(sessionId) {
    const count = await this.getMessageCount(sessionId);

    return count > 0;
  }
}

module.exports = new MemoryManager();