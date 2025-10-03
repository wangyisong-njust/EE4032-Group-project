import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const ConnectWallet = ({ onAccountChange }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const address = accounts[0].address;
        setAccount(address);
        onAccountChange(address);
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      const address = accounts[0];
      setAccount(address);
      onAccountChange(address);
      setError('');
    } catch (err) {
      setError('Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    onAccountChange(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onAccountChange(accounts[0]);
        } else {
          setAccount(null);
          onAccountChange(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [onAccountChange]);

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Chronos Vault 时间胶囊</h2>

      {error && <div className="error">{error}</div>}

      {!account ? (
        <button className="button" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p style={{ marginBottom: '10px' }}>
            <strong>Connected:</strong>{' '}
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </p>
          <button className="button" onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
