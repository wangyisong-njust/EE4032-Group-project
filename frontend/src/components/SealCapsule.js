import React, { useState } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { generateKey, encryptMessage } from '../utils/encryption';
import DateTimePicker from './DateTimePicker';

const SealCapsule = ({ account }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState(null);
  const [ethAmount, setEthAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSealCapsule = async (e) => {
    e.preventDefault();
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

      // Validate inputs
      if (!recipient || !message || !unlockDate) {
        throw new Error('Please fill in all fields!');
      }

      // Validate recipient address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
        throw new Error('Invalid recipient address format!');
      }

      // Convert unlock date to timestamp
      const unlockTimestamp = Math.floor(unlockDate.getTime() / 1000);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (unlockTimestamp <= currentTimestamp) {
        throw new Error('Unlock time must be in the future!');
      }

      // Generate encryption key and encrypt message
      const encryptionKey = generateKey();
      const encryptedMessage = encryptMessage(message, encryptionKey);

      // Convert encrypted message to bytes
      const encryptedBytes = new TextEncoder().encode(encryptedMessage);

      // Connect to contract
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Call sealCapsule function
      const tx = await contract.sealCapsule(
        recipient,
        encryptedBytes,
        encryptionKey,
        unlockTimestamp,
        {
          value: ethAmount === '0' ? 0 : parseEther(ethAmount)
        }
      );

      setSuccess('Transaction submitted! Waiting for confirmation...');

      const receipt = await tx.wait();

      // Extract capsule ID from event
      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log)?.name === 'CapsuleSealed';
        } catch {
          return false;
        }
      });

      let capsuleId = 'unknown';
      if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        capsuleId = parsedEvent.args[0].toString();
      }

      setSuccess(`Capsule sealed successfully! Capsule ID: ${capsuleId}`);

      // Reset form
      setRecipient('');
      setMessage('');
      setUnlockDate(null);
      setEthAmount('0');

    } catch (err) {
      console.error('Error sealing capsule:', err);
      setError(err.message || 'Failed to seal capsule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🔒 Seal a Time Capsule</h2>
      <p style={{ color: '#a0a0b0', fontSize: '0.95em', marginBottom: '25px' }}>
        Create an encrypted time capsule that unlocks at a specific future date
      </p>

      <form onSubmit={handleSealCapsule}>
        <div className="collapsible-section">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Recipient Address *
            </label>
            <input
              type="text"
              className="input"
              placeholder="0x... (Who will receive this capsule)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Unlock Date & Time *
            </label>
            <DateTimePicker
              selected={unlockDate}
              onChange={(date) => setUnlockDate(date)}
              disabled={loading}
              placeholderText="Select when to unlock the capsule..."
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Secret Message *
          </label>
          <textarea
            className="input"
            placeholder="Write your message here... It will be encrypted on the blockchain."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows="5"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            ETH Amount to Lock <span style={{ color: '#808090', fontSize: '0.9em' }}>(optional)</span>
          </label>
          <input
            type="number"
            className="input"
            placeholder="0.0 (Leave blank for message-only capsule)"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            disabled={loading}
            step="0.001"
            min="0"
          />
        </div>

        {error && <div className="error">❌ {error}</div>}
        {success && <div className="success">✅ {success}</div>}

        <button
          type="submit"
          className="button"
          disabled={loading || !account}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {loading ? '🔄 Sealing...' : '🔐 Seal Capsule'}
        </button>
      </form>
    </div>
  );
};

export default SealCapsule;
