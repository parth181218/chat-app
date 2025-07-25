import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  // Ask for notification permission
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Ask for name on first load
  useEffect(() => {
    const savedName = localStorage.getItem('chatUsername');
    if (savedName) {
      setUsername(savedName);
    } else {
      const name = prompt('Enter your name:') || 'Anonymous';
      setUsername(name);
      localStorage.setItem('chatUsername', name);
    }
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (
        Notification.permission === 'granted' &&
        msg.username !== username
      ) {
        new Notification(`💬 ${msg.username}`, {
          body: msg.message,
        });
      }
    });

    return () => socket.off('chat message');
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', {
        username,
        message,
      });
      setMessage('');
    }
  };

  const handleChangeName = () => {
    const newName = prompt('Enter your new name:');
    if (newName) {
      setUsername(newName);
      localStorage.setItem('chatUsername', newName);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>💬 Chat App</h1>
        <button className="change-name" onClick={handleChangeName}>
          Change Name
        </button>
      </div>

      <ul className="messages">
        {messages.map((msg, idx) => (
          <li
            key={idx}
            className={`message ${
              msg.username === username ? 'self' : 'other'
            }`}
          >
            <span className="sender">{msg.username}</span>
            {msg.message}
          </li>
        ))}
      </ul>

      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          placeholder="Type your message..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
