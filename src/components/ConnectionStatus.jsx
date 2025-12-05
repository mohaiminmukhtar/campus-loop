import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check browser online status
    const handleOnline = () => {
      setIsOnline(true);
      setShowWarning(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowWarning(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Supabase connection periodically
    let consecutiveFailures = 0;
    
    const checkSupabaseConnection = async () => {
      try {
        const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
        
        if (error) {
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('ERR_HTTP2_PROTOCOL_ERROR') ||
              error.message.includes('ERR_CONNECTION')) {
            consecutiveFailures++;
            // Only show warning after 2 consecutive failures
            if (consecutiveFailures >= 2) {
              setShowWarning(true);
            }
          } else {
            consecutiveFailures = 0;
          }
        } else {
          consecutiveFailures = 0;
          setShowWarning(false);
        }
      } catch (err) {
        consecutiveFailures++;
        // Only show warning after 2 consecutive failures
        if (consecutiveFailures >= 2) {
          setShowWarning(true);
        }
      }
    };

    // Check connection every 60 seconds (reduced frequency)
    const interval = setInterval(checkSupabaseConnection, 60000);
    
    // Initial check after 5 seconds (give time for initial load)
    const initialTimeout = setTimeout(checkSupabaseConnection, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  if (!showWarning || isDismissed) return null;
  if (!showWarning && isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        background: isOnline ? '#FFF4E6' : '#FFE5E5',
        border: `2px solid ${isOnline ? '#FF6A2A' : '#FF4444'}`,
        borderRadius: '12px',
        padding: '12px 20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {isOnline ? (
        <FaExclamationTriangle style={{ color: '#FF6A2A', fontSize: '20px' }} />
      ) : (
        <FaWifi style={{ color: '#FF4444', fontSize: '20px' }} />
      )}
      <div>
        <div style={{ fontWeight: 600, color: '#2B2B2C', marginBottom: '4px' }}>
          {isOnline ? 'Connection Issues' : 'No Internet Connection'}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#2B2B2C', opacity: 0.8 }}>
          {isOnline 
            ? 'Having trouble connecting to the server. Some features may not work properly.'
            : 'Please check your internet connection and try again.'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#FF6A2A',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Retry
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'transparent',
            color: '#2B2B2C',
            border: '1px solid rgba(43, 43, 44, 0.2)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Dismiss
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
