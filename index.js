const express = require('express')
const cors = require('cors')
const io = require('socket.io')(3000, {
  cors: {
    origin: ['http://localhost:8080']
  }
});

const twilioAccountSid = 'AC320c6e09f854c61a1f5099dc9d0cc1ec'
const twilioAuthToken = 'b43c7dbf88d226670eeff34fb662c263'
const client = require('twilio')(twilioAccountSid, twilioAuthToken)

const ConversationsModel = require('./ConversationsModel')
const MessagesModel = require('./MessagesModel')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

io.on('connection', (socket) => {
  // Twilio messaging webhook connection
  app.post('/txt-commander/sms/:license', async (req, res) => {
    try {
      const { license } = req.params
      const { Body, From } = req.body

      const conversation = new ConversationsModel(license, Body)

      const conv = await conversation.getConversationByPhone(From)

      if (conv.length < 1) {
        const newConv = await conversation.addConversation(From)

        const message = new MessagesModel(newConv.insertId, From, Body)
        message.addMessageToConversation(socket)
      } else {
        const message = new MessagesModel(conv[0].id, From, Body)

        conversation.updateConversation(conv[0].id)
        message.addMessageToConversation(socket)
      }

      socket.emit('updateConversations', license)
    }
    catch (error) {
      console.log(error)
    }
  })

  // Send Message
  app.post('/txt-commander/message', async (req, res) => {
    try {
      const { license, body, to, from } = req.body

      client.messages
        .create({ body, to, from })
        .then(async () => {
          const conversation = new ConversationsModel(license, body)

          const conv = await conversation.getConversationByPhone(to) // Who you're sending a message to

          if (conv.length < 1) {
            const newConv = await conversation.addConversation(to) // Who you're sending a message to

            const message = new MessagesModel(newConv.insertId, from, body)
            message.addMessageToConversation()
            res.send({ success: true, message: 'Message sent successfully'})
          } else {
            const message = new MessagesModel(conv[0].id, from, body)

            conversation.updateConversation(conv[0].id)
            message.addMessageToConversation()
            res.send({ success: true, message: 'Message sent successfully'})
          }
        
          socket.emit('updateConversations', license)
        })
        .catch(error => {
          console.log(error)
          res.send({ success: false, error})
        })
    }
    catch (error) {
      console.log(error)
      res.send({ success: false, error })
    }
  })
})

// Get Conversations by Client License
app.get('/txt-commander', async (req, res) => {
  try {
    const { license } = req.query

    const conversation = new ConversationsModel(license)
    const conversations = await conversation.getConversations()
    res.send({ success: true, data: conversations })
  }
  catch (error) {
    console.log(error)
    res.send({ success: false, error })
  }
})

// Get Messages by Conversation Id
app.get('/txt-commander/conversation', async (req, res) => {
  try {
    const { conversation_id } = req.query

    const message = new MessagesModel(conversation_id)
    const messages = await message.getMessagesByConversationId()
    res.send({ success: true, data: messages })
  }
  catch (error) {
    console.log(error)
    res.send({ success: false, error })
  }
})

app.listen(3001, () => console.log('Server listening on Port: 3001'))