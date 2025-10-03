import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';

const Notification = ({ account }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!account || !window.ethereum) return;

    let contract;

    const setupEventListener = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // Listen for CapsuleUnsealed events
        contract.on('CapsuleUnsealed', (capsuleId, recipient, event) => {
          // Check if the current user is the recipient
          if (recipient.toLowerCase() === account.toLowerCase()) {
            const notification = {
              id: Date.now(),
              capsuleId: capsuleId.toString(),
              message: `A time capsule is now unlocked for you! Check capsule ID: ${capsuleId.toString()}`,
              timestamp: new Date().toLocaleString()
            };

            setNotifications(prev => [notification, ...prev]);

            // Auto-remove notification after 10 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, 10000);
          }
        });

        console.log('Event listener setup complete');
      } catch (err) {
        console.error('Error setting up event listener:', err);
      }
    };

    setupEventListener();

    // Cleanup function
    return () => {
      if (contract) {
        contract.removeAllListeners('CapsuleUnsealed');
      }
    };
  }, [account]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="notification"
          style={{
            position: 'fixed',
            top: `${20 + notifications.indexOf(notification) * 80}px`,
            right: '20px',
            background: '#4caf50',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '6px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            animation: 'slideIn 0.3s ease-out',
            cursor: 'pointer',
            zIndex: 1000,
            maxWidth: '400px'
          }}
          onClick={() => removeNotification(notification.id)}
        >
          <div style={{ fontWeight: '600', marginBottom: '5px' }}>
            Time Capsule Unlocked!
          </div>
          <div style={{ fontSize: '14px' }}>
            {notification.message}
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>
            {notification.timestamp}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
