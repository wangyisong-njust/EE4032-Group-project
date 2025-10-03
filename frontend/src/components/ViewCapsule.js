import React, { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { decryptMessage } from '../utils/encryption';

const ViewCapsule = ({ account }) => {
  const [capsuleId, setCapsuleId] = useState('');
  const [capsuleData, setCapsuleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [decryptionKey, setDecryptionKey] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

  const queryCapsule = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    setCapsuleData(null);
    setDecryptionKey('');
    setDecryptedMessage('');

    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      if (capsuleId === '') {
        throw new Error('Please enter a capsule ID!');
      }

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Query capsule data
      const capsule = await contract.capsules(capsuleId);

      const data = {
        owner: capsule[0],
        recipient: capsule[1],
        encryptedData: capsule[2],
        unlockTimestamp: Number(capsule[4]),
        ethValue: capsule[5],
        nftContractAddress: capsule[6],
        nftTokenId: capsule[7],
        isUnsealed: capsule[8]
      };

      setCapsuleData(data);
      setSuccess('Capsule data loaded successfully!');

    } catch (err) {
      console.error('Error querying capsule:', err);
      setError(err.message || 'Failed to query capsule');
    } finally {
      setLoading(false);
    }
  };

  const unsealCapsule = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      if (!account) {
        throw new Error('Please connect your wallet first!');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Call unsealCapsule function
      const tx = await contract.unsealCapsule(capsuleId);
      setSuccess('Transaction submitted! Waiting for confirmation...');

      await tx.wait();
      setSuccess('Capsule unsealed successfully!');

      // Refresh capsule data
      await queryCapsule();

    } catch (err) {
      console.error('Error unsealing capsule:', err);
      setError(err.message || 'Failed to unseal capsule');
    } finally {
      setLoading(false);
    }
  };

  const viewDecryptionKey = async () => {
    setError('');
    setLoading(true);

    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Get decryption key
      const key = await contract.getDecryptionKey(capsuleId);
      setDecryptionKey(key);

      // Auto-decrypt if we have the encrypted data
      if (capsuleData && capsuleData.encryptedData) {
        try {
          const encryptedText = new TextDecoder().decode(capsuleData.encryptedData);
          const decrypted = decryptMessage(encryptedText, key);
          setDecryptedMessage(decrypted);
        } catch (err) {
          console.error('Error decrypting:', err);
        }
      }

    } catch (err) {
      console.error('Error getting decryption key:', err);
      setError(err.message || 'Failed to get decryption key');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isUnlockable = () => {
    if (!capsuleData) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= capsuleData.unlockTimestamp && !capsuleData.isUnsealed;
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>View Time Capsule</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
          Capsule ID:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            className="input"
            placeholder="Enter capsule ID..."
            value={capsuleId}
            onChange={(e) => setCapsuleId(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            className="button"
            onClick={queryCapsule}
            disabled={loading || !capsuleId}
          >
            {loading ? 'Loading...' : 'Query'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {capsuleData && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px' }}>Capsule Details</h3>

          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong>{' '}
              <span style={{ color: capsuleData.isUnsealed ? '#4caf50' : '#ff9800' }}>
                {capsuleData.isUnsealed ? 'Unsealed' : 'Locked'}
              </span>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>Owner:</strong> {capsuleData.owner}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>Recipient:</strong> {capsuleData.recipient}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>Unlock Time:</strong> {formatDate(capsuleData.unlockTimestamp)}
            </div>

            {capsuleData.ethValue > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <strong>ETH Locked:</strong> {(Number(capsuleData.ethValue) / 1e18).toFixed(4)} ETH
              </div>
            )}

            {capsuleData.nftContractAddress !== '0x0000000000000000000000000000000000000000' && (
              <div style={{ marginBottom: '10px' }}>
                <strong>NFT:</strong> Token #{capsuleData.nftTokenId.toString()} from{' '}
                {capsuleData.nftContractAddress}
              </div>
            )}
          </div>

          {isUnlockable() && (
            <button
              className="button"
              onClick={unsealCapsule}
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              Unseal Capsule
            </button>
          )}

          {capsuleData.isUnsealed && !decryptionKey && (
            <button
              className="button"
              onClick={viewDecryptionKey}
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              View Decryption Key
            </button>
          )}

          {decryptionKey && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Decryption Key:</h3>
              <div style={{
                background: '#e8f5e9',
                padding: '15px',
                borderRadius: '8px',
                wordBreak: 'break-all',
                fontFamily: 'monospace'
              }}>
                {decryptionKey}
              </div>
            </div>
          )}

          {decryptedMessage && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Decrypted Message:</h3>
              <div style={{
                background: '#fff3e0',
                padding: '15px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap'
              }}>
                {decryptedMessage}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewCapsule;
