import React from 'react';

function LCDDisplay({ message }) {
  return (
    <div style={{ border: '1px solid black', padding: '10px', width: '300px' }}>
      <h3>LCD Display</h3>
      <p>{message}</p>
    </div>
  );
}

export default LCDDisplay;
