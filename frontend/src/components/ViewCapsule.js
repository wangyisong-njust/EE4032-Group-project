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
      <h2>🔍 View Time Capsule</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Capsule ID
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="number"
            className="input"
            placeholder="Enter capsule ID..."
            value={capsuleId}
            onChange={(e) => setCapsuleId(e.target.value)}
            disabled={loading}
            style={{ flex: 1, margin: 0 }}
          />
          <button
            className="button"
            onClick={queryCapsule}
            disabled={loading || !capsuleId}
          >
            {loading ? '🔄' : '🔎 Query'}
          </button>
        </div>
      </div>

      {error && <div className="error">❌ {error}</div>}
      {success && <div className="success">✅ {success}</div>}

      {capsuleData && (
        <div style={{ marginTop: '30px' }}>
          <h3>📦 Capsule Details</h3>

          <div className="info-box">
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>Status:</strong>
              <span style={{
                color: capsuleData.isUnsealed ? '#86efac' : '#fbbf24',
                fontWeight: '600'
              }}>
                {capsuleData.isUnsealed ? '🔓 Unsealed' : '🔒 Locked'}
              </span>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <strong>Owner:</strong>
              <div style={{
                color: '#a0a0b0',
                fontSize: '0.9em',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                marginTop: '4px'
              }}>
                {capsuleData.owner}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <strong>Recipient:</strong>
              <div style={{
                color: '#a0a0b0',
                fontSize: '0.9em',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                marginTop: '4px'
              }}>
                {capsuleData.recipient}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <strong>Unlock Time:</strong>
              <div style={{ color: '#c4b5fd', marginTop: '4px' }}>
                ⏰ {formatDate(capsuleData.unlockTimestamp)}
              </div>
            </div>

            {capsuleData.ethValue > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <strong>ETH Locked:</strong>
                <div style={{ color: '#86efac', marginTop: '4px' }}>
                  💰 {(Number(capsuleData.ethValue) / 1e18).toFixed(4)} ETH
                </div>
              </div>
            )}

            {capsuleData.nftContractAddress !== '0x0000000000000000000000000000000000000000' && (
              <div style={{ marginBottom: '12px' }}>
                <strong>NFT:</strong>
                <div style={{ color: '#c4b5fd', marginTop: '4px', fontSize: '0.9em' }}>
                  🎨 Token #{capsuleData.nftTokenId.toString()} from {capsuleData.nftContractAddress}
                </div>
              </div>
            )}
          </div>

          {isUnlockable() && (
            <button
              className="button"
              onClick={unsealCapsule}
              disabled={loading}
              style={{ marginTop: '20px', width: '100%' }}
            >
              🔓 Unseal Capsule
            </button>
          )}

          {capsuleData.isUnsealed && !decryptionKey && (
            <button
              className="button"
              onClick={viewDecryptionKey}
              disabled={loading}
              style={{ marginTop: '20px', width: '100%' }}
            >
              🔑 View Decryption Key
            </button>
          )}

          {decryptionKey && (
            <div style={{ marginTop: '25px' }}>
              <h3>🔑 Decryption Key</h3>
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '18px',
                borderRadius: '12px',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                color: '#86efac',
                fontSize: '0.95em'
              }}>
                {decryptionKey}
              </div>
            </div>
          )}

          {decryptedMessage && (
            <div style={{ marginTop: '25px' }}>
              <h3>💬 Decrypted Message</h3>
              <div style={{
                background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                padding: '18px',
                borderRadius: '12px',
                whiteSpace: 'pre-wrap',
                color: '#f9a8d4',
                lineHeight: '1.6'
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
