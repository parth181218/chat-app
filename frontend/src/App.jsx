// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Backend server

function App() {
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit('joinRoom', room);
    socket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, [room]);

  const handleSend = () => {
    socket.emit('sendMessage', { room, message });
    setMessage('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Room: {room}</h2>
      <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room name" />
      <div style={{ marginTop: 20 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
        />
        <button onClick={handleSend}>Send</button>
      </div>
      <ul style={{ marginTop: 20 }}>
        {messages.map((msg, i) => (
          <li key={i}>{msg.sender}: {msg.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
