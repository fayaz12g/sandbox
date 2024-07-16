import React, { useState, useRef } from 'react';
import './App.css';

function App() {
    const [ip, setIp] = useState('localhost'); // Default to localhost for testing
    const [name, setName] = useState('');
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);

    const handleConnect = () => {
        try {
            socketRef.current = new WebSocket(`ws://${ip}:8080`); // Ensure correct port
            socketRef.current.onopen = () => {
                console.log('WebSocket connection established');
                setConnected(true);
            };
            socketRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            socketRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'initialMessages') {
                        setMessages(message.data);
                    } else {
                        setMessages((prevMessages) => [...prevMessages, message]);
                    }
                } catch (error) {
                    console.error('Message parsing error:', error);
                }
            };
            socketRef.current.onclose = () => {
                console.log('WebSocket connection closed');
                setConnected(false);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    };

    const handleSend = () => {
        const message = { name, text: newMessage };
        socketRef.current.send(JSON.stringify(message));
        setMessages((prevMessages) => [...prevMessages, { ...message, timestamp: new Date().toLocaleString() }]);
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
                                <p className="timestamp">{msg.timestamp}</p>
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
