import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [tempName, setTempName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (Notification.permission === 'granted') {
        new Notification(`💬 ${msg.username}`, {
          body: msg.message,
        });
      }
    });

    return () => socket.off('chat message');
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username.trim()) {
      const msgData = {
        username,
        message,
      };
      socket.emit('chat message', msgData);
      setMessage('');
    }
  };

  if (!username) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Enter your name to join chat</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (tempName.trim()) {
              setUsername(tempName.trim());
            }
          }}
        >
          <input
            type="text"
            placeholder="Your full name"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Chat App</h1>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{msg.username}:</strong> {msg.message}
          </li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
