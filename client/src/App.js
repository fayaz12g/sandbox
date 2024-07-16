import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
    const [name, setName] = useState('');
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        connectToWebSocket();
    }, []); // Connect to WebSocket on component mount

    const connectToWebSocket = () => {
        const wsURL = `wss://fmess.fly.dev`;

        try {
            socketRef.current = new WebSocket(wsURL);
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
                    handleReceivedMessage(message);
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

    const handleReceivedMessage = (message) => {
        if (message.type === 'initialMessages') {
            setMessages(message.data);
        } else {
            setMessages((prevMessages) => [...prevMessages, message]);
        }
    };

    const handleSend = () => {
        const message = { text: newMessage };
        socketRef.current.send(JSON.stringify(message));
        setMessages((prevMessages) => [...prevMessages, { ...message, name, timestamp: new Date().toLocaleString() }]);
        setNewMessage('');
        scrollToBottom();
    };

    const scrollToBottom = () => {
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    const renderMessages = () => {
        return messages.map((msg, index) => {
            if (msg.type === 'system') {
                return (
                    <div key={index} className="message system">
                        <p>{msg.text}</p>
                        <p className="timestamp">{msg.timestamp}</p>
                    </div>
                );
            } else {
                const isSent = msg.name === name;
                const messageClass = isSent ? 'sent' : 'received';
                const messageColor = isSent ? 'blue' : 'green';
                const messageBgColor = isSent ? '#e0f7fa' : '#f0f0f0';
                return (
                    <div key={index} className={`message ${messageClass}`} style={{ backgroundColor: messageBgColor }}>
                        {!isSent && <p className="name">{msg.name}</p>}
                        <p className="content" style={{ color: messageColor }}>{msg.text}</p>
                        <p className="timestamp">{msg.timestamp}</p>
                    </div>
                );
            }
        });
    };

    return (
        <div className="App">
            {!connected ? (
                <div className="loadingScreen">
                    <p>Connecting to chat server...</p>
                </div>
            ) : (
                <div className="chatContainer" id="chatContainer">
                    <div className="messages">
                        {renderMessages()}
                    </div>
                    <div className="inputContainer">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSend();
                                }
                            }}
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
