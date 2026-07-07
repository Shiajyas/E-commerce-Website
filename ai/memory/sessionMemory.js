

const crypto = require("crypto");

class SessionMemory {
  /**
   * Generate a new session ID.
   */
  createSessionId() {
    return crypto.randomUUID();
  }

  /**
   * Validate session ID.
   */
  isValidSessionId(sessionId) {
    if (!sessionId) return false;

    return /^[0-9a-fA-F-]{36}$/.test(sessionId);
  }

  /**
   * Return an existing session ID
   * or create a new one.
   */
  getOrCreateSession(sessionId) {
    if (this.isValidSessionId(sessionId)) {
      return sessionId;
    }

    return this.createSessionId();
  }
}

module.exports = new SessionMemory();