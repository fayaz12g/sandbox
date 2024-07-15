import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
    const [ip, setIp] = useState('');
    const [name, setName] = useState('');
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);

    const handleConnect = () => {
        socketRef.current = new WebSocket(`ws://${ip}`);
        socketRef.current.onopen = () => {
            setConnected(true);
        };
        socketRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, message]);
        };
    };

    const handleSend = () => {
        const message = { name, text: newMessage };
        socketRef.current.send(JSON.stringify(message));
        setMessages((prevMessages) => [...prevMessages, message]);
        setNewMessage('');
    };

    return (
        <div className="App">
            {!connected ? (
                <div className="joinScreen">
                    <input 
                        type="text" 
                        placeholder="Server IP" 
                        value={ip} 
                        onChange={(e) => setIp(e.target.value)} 
                    />
                    <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
                    <button onClick={handleConnect}>Join</button>
                </div>
            ) : (
                <div className="chatContainer">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.name === name ? 'sent' : 'received'}`}>
                                <p><strong>{msg.name}</strong>: {msg.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="inputContainer">
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
