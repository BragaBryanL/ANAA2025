import React, { useState } from 'react';

function RFIDReader({ onScan }) {
  const [rfidInput, setRfidInput] = useState('');

  const handleScan = () => {
    if (rfidInput) {
      onScan(rfidInput.toUpperCase());
      setRfidInput('');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={rfidInput}
        onChange={(e) => setRfidInput(e.target.value)}
        placeholder="Scan RFID"
      />
      <button onClick={handleScan}>Scan</button>
    </div>
  );
}

export default RFIDReader;
