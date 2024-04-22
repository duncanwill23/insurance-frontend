import React, { useState } from 'react';
import axios from 'axios';
import './chatbot.css';

function ChatBot() {
  const [messages, setMessages] = useState([]);

  const handleUserMessage = async (text) => {
    try{
    const response = await axios.post('http://localhost:8000/chatbot/', {
      query: text,
    });

    const newUserMessage = {
      text: `You said: ${text}`,
      sender: 'user',
    };

    setMessages((messages) => [...messages, newUserMessage]);

    setTimeout(() => {
      const newBotMessage = {
        text: `Medibot says: ${response.data.message}`,
        sender: 'bot',
      };

      setMessages((messages) => [...messages, newBotMessage]);
    }, 1000);
  } catch (error) {
    console.log('Error:', error);
  }
  };

  return (
    <div className="chat-container">
      <div className="message-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type your message..."
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              handleUserMessage(event.target.value);
              event.target.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}

export default ChatBot;