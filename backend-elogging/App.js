import React, { useState } from 'react';
import axios from 'axios';
import RFIDReader from './rfidcomponents/RFIDReader';
import LCDDisplay from './rfidcomponents/LCDDisplay';
import WiFiManager from './rfidcomponents/WIFIManager';

function App() {
  const [lcdMessage, setLcdMessage] = useState('System Ready'); 
  const [isConnected, setIsConnected] = useState(false);
  const deviceID = 'UHF_RF915_RD_V2.0c-210628'; // Replace with actual device ID

  const handleWiFiConnect = (network) => {
    setIsConnected(true);
    setLcdMessage(`Connected to ${network}`);
  };

  const sendRfidData = async (rfidNumber) => {
    if (!isConnected) {
      setLcdMessage('WiFi Not Connected');
      return;
    }

    const serverUrl = 'http://localhost:3001/api/rfid'; // Replace with your server's URL
    const payload = {
      rfid_number: rfidNumber,
      device_id: deviceID,
    };

    try {
      const response = await axios.post(serverUrl, payload);
      const { data } = response;

      if (data.includes('Logged In')) {
        setLcdMessage('Logged In');
      } else if (data.includes('Logged Out')) {
        setLcdMessage('Logged Out');
      } else if (data.includes('Unauthorized')) {
        setLcdMessage('Unauthorized');
      } else if (data.includes('Expired')) {
        setLcdMessage('RFID tag Expired');
      } else {
        setLcdMessage('Unknown Status');
      }
    } catch (error) {
      console.error('Error sending RFID data:', error);
      setLcdMessage('POST Failed');
    }
  };

  return (
    <div>
      <WiFiManager onConnect={handleWiFiConnect} />
      <RFIDReader onScan={sendRfidData} />
      <LCDDisplay message={lcdMessage} />
    </div>
  );
}

export default App;
