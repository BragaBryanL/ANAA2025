// src/components/RFIDReader.js
import React, { useState } from 'react';
import axios from 'axios';

const RFIDReader = () => {
  const [rfidCode, setRfidCode] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/validate-rfid', { rfidCode });
      const data = response.data;
      if (data.success) {
        setStatus(`ID: ${data.data.id}, Name: ${data.data.name}, Status: ${data.data.status}`);
      } else {
        setStatus('RFID not recognized');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error connecting to server');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter RFID"
          value={rfidCode}
          onChange={(e) => setRfidCode(e.target.value)}
        />
        <button type="submit">Check Status</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default RFIDReader;
