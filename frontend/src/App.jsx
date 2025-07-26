import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [typingStatus, setTypingStatus] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isJoined) {
      socket.emit('join', { username, room });

      fetch(`http://localhost:5000/messages?room=${room}`)
        .then((res) => res.json())
        .then((data) => setMessages(data));
    }
  }, [isJoined, room, username]);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing', (name) => {
      if (name !== username) {
        setTypingStatus(`${name} is typing...`);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingStatus(''), 2000);
      }
    });

    return () => {
      socket.off('chat message');
      socket.off('typing');
    };
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const msgObj = {
      text: trimmed,
      username,
      room,
      timestamp: new Date().toISOString(),
    };
    socket.emit('chat message', msgObj);
    setMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', username);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim() && room.trim()) {
      setIsJoined(true);
    }
  };

  const handleChangeRoom = () => {
    setIsJoined(false);
    setMessages([]);
    setRoom('general');
  };

  if (!isJoined) {
    return (
      <div className="chat-box">
        <div className="chat-header">Join Chat Room</div>
        <form className="message-form" onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room name..."
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>💬 Room: {room}</span>
        <button className="change-name-btn" onClick={handleChangeRoom}>
          Change Room
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.username === username ? 'self' : 'other'}`}
          >
            <div className="message-header">
              <strong>{msg.username}</strong>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingStatus && <div className="typing-status">{typingStatus}</div>}

      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
