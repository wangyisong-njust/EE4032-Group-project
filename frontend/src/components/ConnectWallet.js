import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia testnet chain ID

const ConnectWallet = ({ onAccountChange }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [network, setNetwork] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);

  const checkNetwork = async () => {
    try {
      if (!window.ethereum) return;

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkName = getNetworkName(chainId);
      setNetwork(networkName);
      setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
    } catch (err) {
      console.error('Error checking network:', err);
    }
  };

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet'
    };
    return networks[chainId] || `Unknown (${chainId})`;
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          setError('Failed to add Sepolia network');
          console.error('Error adding network:', addError);
        }
      } else {
        setError('Failed to switch network');
        console.error('Error switching network:', switchError);
      }
    }
  };

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

      // Check network after connecting
      await checkNetwork();
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
      <h2 style={{ marginBottom: '20px' }}>Chronos Vault</h2>

      {error && <div className="error">❌ {error}</div>}

      {network && (
        <div style={{
          marginBottom: '15px',
          padding: '10px',
          background: isCorrectNetwork ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isCorrectNetwork ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: isCorrectNetwork ? '#86efac' : '#fca5a5' }}>
            {isCorrectNetwork ? '✅' : '⚠️'} Network: {network}
          </span>
          {!isCorrectNetwork && (
            <button
              className="button"
              onClick={switchToSepolia}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Switch to Sepolia
            </button>
          )}
        </div>
      )}

      {!account ? (
        <button className="button" onClick={connectWallet} style={{ width: '100%' }}>
          🔗 Connect Wallet
        </button>
      ) : (
        <div>
          <p style={{ marginBottom: '15px', color: '#c0c0d0' }}>
            <strong>Connected:</strong>{' '}
            <span style={{
              fontFamily: 'monospace',
              color: '#a78bfa',
              background: 'rgba(167, 139, 250, 0.1)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
          </p>
          <button className="button" onClick={disconnectWallet} style={{ width: '100%' }}>
            🔌 Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
