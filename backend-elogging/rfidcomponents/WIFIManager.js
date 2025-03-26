import React, { useState } from 'react';

function WiFiManager({ onConnect }) {
  const [network, setNetwork] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Disconnected');

  const handleConnect = () => {
    if (network && password) {
      setStatus('Connecting...');
      setTimeout(() => {
        setStatus('Connected');
        onConnect(network); // Notify the parent component of the connection
      }, 1000);
    }
  };

  return (
    <div>
      <h3>WiFi Manager</h3>
      <input
        type="text"
        placeholder="WiFi Network"
        value={network}
        onChange={(e) => setNetwork(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleConnect}>Connect</button>
      <p>Status: {status}</p>
    </div>
  );
}

export default WiFiManager;
