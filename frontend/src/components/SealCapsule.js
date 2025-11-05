import React, { useState } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { encryptMessage } from '../utils/encryption';
import DateTimePicker from './DateTimePicker';

const SealCapsule = ({ account }) => {
  const [recipient, setRecipient] = useState('');
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
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
      if (!recipient || !message || !unlockDate || !recipientPublicKey) {
        throw new Error('Please fill in all fields and get recipient\'s public key!');
      }

      // Clean and validate recipient address format
      const cleanRecipient = recipient.trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(cleanRecipient)) {
        throw new Error(`Invalid recipient address format! Address must be 42 characters (0x + 40 hex). Your input: "${cleanRecipient}" (length: ${cleanRecipient.length})`);
      }

      // CRITICAL: Log warning about public key matching
      console.log('⚠️ IMPORTANT: Make sure the public key you entered belongs to the recipient address!');
      console.log('Recipient address:', cleanRecipient);
      console.log('Public key provided:', recipientPublicKey);
      console.log('If these don\'t match, the recipient will NOT be able to decrypt the message!');

      // Convert unlock date to timestamp
      const unlockTimestamp = Math.floor(unlockDate.getTime() / 1000);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (unlockTimestamp <= currentTimestamp) {
        throw new Error('Unlock time must be in the future!');
      }

      // Encrypt message with recipient's public key
      const encryptedMessage = await encryptMessage(message, recipientPublicKey);

      // Convert JSON string to UTF-8 bytes for contract storage
      const { toUtf8Bytes } = await import('ethers');
      const encryptedMessageBytes = toUtf8Bytes(encryptedMessage);

      console.log('Encrypted message JSON:', encryptedMessage.substring(0, 100));
      console.log('Encrypted message as bytes (hex):', encryptedMessageBytes);

      // Connect to contract
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Call sealCapsule function
      const tx = await contract.sealCapsule(
        cleanRecipient,
        encryptedMessageBytes,  // bytes format
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
      setRecipientPublicKey('');
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
      <h2>🔒 For Individuals and Personal Use</h2>
      <p style={{ color: '#a0a0b0', fontSize: '0.95em', marginBottom: '15px' }}>
        Create time-locked capsules with encrypted messages and assets. Perfect for personal life planning and future goals.
      </p>

      <div style={{
        background: 'rgba(139, 92, 246, 0.08)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1em', color: '#c4b5fd' }}>💡 Use Cases</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#a0a0b0', fontSize: '0.9em', lineHeight: '1.7' }}>
          <li><strong>Personal Time Capsules:</strong> Future messages and memories for yourself or loved ones</li>
          <li><strong>Digital Wills:</strong> Store inheritance instructions and important documents</li>
          <li><strong>Trust Funds & Scheduled Payments:</strong> Set up automated future transfers</li>
          <li><strong>Personal Contracts:</strong> Escrow for agreements, milestones, or future commitments</li>
        </ul>
      </div>

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
              Recipient's Public Key *
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="Paste recipient's public key here (they need to export it first)"
                value={recipientPublicKey}
                onChange={(e) => setRecipientPublicKey(e.target.value)}
                disabled={loading}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '8px'
            }}>
              <p style={{ fontSize: '0.9em', color: '#fca5a5', margin: '0 0 8px 0', fontWeight: '600' }}>
                ⚠️ CRITICAL WARNING: Public key must match recipient address!
              </p>
              <p style={{ fontSize: '0.85em', color: '#fca5a5', margin: '0', lineHeight: '1.6' }}>
                If the public key and recipient address don't match, the recipient will <strong>NOT be able to decrypt</strong> the message!<br/>
                Please ensure:<br/>
                1. Ask the recipient to export their public key from the "View Capsules" page<br/>
                2. Copy the public key provided by the recipient (don't use your own or someone else's)<br/>
                3. Recipient address and public key must be from the <strong>same account</strong>
              </p>
            </div>
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
            Message Content *
          </label>
          <textarea
            className="input"
            placeholder="Will instructions, transfer notes, contract details, or personal messages... (End-to-end encrypted)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows="5"
          />
          <p style={{ fontSize: '0.8em', color: '#808090', margin: '5px 0 0 0' }}>
            💡 Examples: "Last will and testament...", "Happy 18th birthday...", "Project payment for..."
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            ETH Amount to Lock <span style={{ color: '#808090', fontSize: '0.9em' }}>(optional)</span>
          </label>
          <input
            type="number"
            className="input"
            placeholder="0.0 (Inheritance, payment, or gift amount)"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            disabled={loading}
            step="0.001"
            min="0"
          />
          <p style={{ fontSize: '0.8em', color: '#808090', margin: '5px 0 0 0' }}>
            💰 Use cases: Inheritance funds, scheduled rent payment, trust fund, project escrow
          </p>
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
