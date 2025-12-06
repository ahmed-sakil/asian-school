import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', fontFamily: 'Segoe UI' }}>
      <ShieldAlert size={64} color="#dc2626" style={{ marginBottom: '20px' }} />
      <h1 style={{ color: '#991b1b' }}>403 - Access Denied</h1>
      <p style={{ color: '#7f1d1d', marginBottom: '20px' }}>You do not have permission to view this page.</p>
      
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Go Back to Safety
      </button>
    </div>
  );
};

export default AccessDenied;