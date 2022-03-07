const db = require('./db')

// Tables
const TConversations = 'conversations'

class ConversationsModel {
  constructor(license, message) {
    this.license = license
    this.message = message
  }

  async getConversations() {
    const sql = `SELECT * FROM ${TConversations} WHERE license = ?`
    const [conversations, _] = await db.execute(sql, [this.license])
    return conversations
  }

  async getConversationByPhone(phone) {
    const sql = `SELECT * FROM ${TConversations} WHERE phone = ?`
    const [conversation, _] = await db.execute(sql, [phone])
    return conversation
  }

  async addConversation(phone) {
    const sql = `INSERT INTO ${TConversations} (license, phone, last_message) VALUES (?, ?, ?)`
    const [conversation , _] = await db.query(sql, [this.license, phone, this.message])
    return conversation
  }

  async updateConversation(conversation_id) {
    const sql = `UPDATE ${TConversations} SET last_message = ? WHERE id = ?`
    await db.query(sql, [this.message, conversation_id])
  }
}

module.exports = ConversationsModel