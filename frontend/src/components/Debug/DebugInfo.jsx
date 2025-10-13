import React, { useState } from 'react';

export const DebugInfo = ({ show = false }) => {
  const [isVisible, setIsVisible] = useState(show);
  
  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: '#666',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 9999
        }}
      >
        Debug
      </button>
    );
  }

  const debugInfo = {
    'Frontend URL': window.location.origin,
    'Backend URL': 'http://localhost:3000',
    'API Base': 'http://localhost:3000/api',
    'Current Page': window.location.pathname,
    'User Agent': navigator.userAgent.substring(0, 50) + '...',
    'Local Storage Token': localStorage.getItem('token') ? 'Presente' : 'Ausente',
    'Console Logs': 'Abra o DevTools (F12) para ver logs detalhados'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>Debug Info</strong>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '2px 6px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      {Object.entries(debugInfo).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '5px' }}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
      
      <div style={{ marginTop: '10px', padding: '5px', background: 'rgba(255,255,255,0.1)' }}>
        <strong>Teste de Conectividade:</strong>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'OPTIONS'
              });
              alert(`Backend: ${response.ok ? 'Online' : 'Offline'} (${response.status})`);
            } catch (error) {
              alert(`Backend: Offline - ${error.message}`);
            }
          }}
          style={{
            marginLeft: '10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '2px 6px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Testar Backend
        </button>
      </div>
    </div>
  );
};