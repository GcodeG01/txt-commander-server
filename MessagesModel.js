const db = require('./db')

// Tables
const TMessages = 'messages'

class MessagesModel {
  constructor(conversation_id, phone, message) {
    this.conversation_id = conversation_id
    this.phone = phone
    this.message = message
  }

  async getMessagesByConversationId() {
    const sql = `SELECT * FROM ${TMessages} WHERE conversation_id = ?`
    const [messages, _] = await db.query(sql, [this.conversation_id])
    return messages
  }

  async addMessageToConversation() {
    const sql = `INSERT INTO ${TMessages} (conversation_id, phone, message) VALUES (?, ?, ?)`

    await db.query(sql, [this.conversation_id, this.phone, this.message])
  }
}

module.exports = MessagesModel