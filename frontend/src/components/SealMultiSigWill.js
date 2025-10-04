import React, { useState } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { generateKey, encryptMessage } from '../utils/encryption';
import DateTimePicker from './DateTimePicker';

const SealMultiSigWill = ({ account }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState(null);
  const [ethAmount, setEthAmount] = useState('0');
  const [trustees, setTrustees] = useState(['', '', '']);
  const [requiredApprovals, setRequiredApprovals] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTrusteeChange = (index, value) => {
    const newTrustees = [...trustees];
    newTrustees[index] = value;
    setTrustees(newTrustees);
  };

  const addTrustee = () => {
    setTrustees([...trustees, '']);
  };

  const removeTrustee = (index) => {
    if (trustees.length > 1) {
      setTrustees(trustees.filter((_, i) => i !== index));
    }
  };

  const handleSealWill = async (e) => {
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
        throw new Error('Please fill in all required fields!');
      }

      // Filter out empty trustees
      const validTrustees = trustees.filter(t => t.trim() !== '');
      if (validTrustees.length < requiredApprovals) {
        throw new Error('Not enough trustees for required approvals!');
      }

      // Validate trustee addresses
      for (const trustee of validTrustees) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(trustee)) {
          throw new Error(`Invalid trustee address: ${trustee}`);
        }
      }

      const unlockTimestamp = Math.floor(unlockDate.getTime() / 1000);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (unlockTimestamp <= currentTimestamp) {
        throw new Error('Unlock time must be in the future!');
      }

      const encryptionKey = generateKey();
      const encryptedMessage = encryptMessage(message, encryptionKey);
      const encryptedBytes = new TextEncoder().encode(encryptedMessage);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.sealMultiSigWill(
        recipient,
        encryptedBytes,
        encryptionKey,
        unlockTimestamp,
        validTrustees,
        requiredApprovals,
        {
          value: ethAmount === '0' ? 0 : parseEther(ethAmount)
        }
      );

      setSuccess('Transaction submitted! Waiting for confirmation...');

      const receipt = await tx.wait();

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

      setSuccess(`Multi-Sig Will sealed successfully! Capsule ID: ${capsuleId}`);

      // Reset form
      setRecipient('');
      setMessage('');
      setUnlockDate(null);
      setEthAmount('0');
      setTrustees(['', '', '']);
      setRequiredApprovals(2);

    } catch (err) {
      console.error('Error sealing will:', err);
      setError(err.message || 'Failed to seal will');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📜 Multi-Signature Will</h2>
      <p style={{ color: '#a0a0b0', fontSize: '0.95em', marginBottom: '20px' }}>
        Set up a will that requires multiple trustees to approve early unlock
      </p>

      <form onSubmit={handleSealWill}>
        <div className="collapsible-section">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Beneficiary Address *
            </label>
            <input
              type="text"
              className="input"
              placeholder="0x... (Who inherits this will)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Auto-Unlock Date *
            </label>
            <DateTimePicker
              selected={unlockDate}
              onChange={(date) => setUnlockDate(date)}
              disabled={loading}
              placeholderText="Select far future date (e.g., 50 years)..."
            />
            <p style={{ color: '#808090', fontSize: '0.85em', marginTop: '5px' }}>
              Will auto-unlock on this date, or earlier with trustee approvals
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Will Message *
          </label>
          <textarea
            className="input"
            placeholder="Your final message and instructions..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows="4"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            ETH Amount to Lock <span style={{ color: '#808090', fontSize: '0.9em' }}>(optional)</span>
          </label>
          <input
            type="number"
            className="input"
            placeholder="0.0 (Inheritance amount)"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            disabled={loading}
            step="0.001"
            min="0"
          />
        </div>

        <div className="collapsible-section">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Trustees *
            </label>
            <p style={{ color: '#808090', fontSize: '0.85em', marginBottom: '10px' }}>
              Add trusted contacts who can approve early unlock (e.g., family, lawyers)
            </p>
            {trustees.map((trustee, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder={`Trustee ${index + 1} address (0x...)`}
                  value={trustee}
                  onChange={(e) => handleTrusteeChange(index, e.target.value)}
                  disabled={loading}
                  style={{ flex: 1, margin: 0 }}
                />
                {trustees.length > 1 && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => removeTrustee(index)}
                    disabled={loading}
                    style={{ padding: '10px 20px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="button"
              onClick={addTrustee}
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              ➕ Add Trustee
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Required Approvals (M-of-N) *
            </label>
            <input
              type="number"
              className="input"
              value={requiredApprovals}
              onChange={(e) => setRequiredApprovals(parseInt(e.target.value))}
              disabled={loading}
              min="1"
              max={trustees.length}
            />
            <p style={{ color: '#808090', fontSize: '0.85em', marginTop: '5px' }}>
              Requires {requiredApprovals} out of {trustees.filter(t => t.trim() !== '').length} trustees to approve early unlock
            </p>
          </div>
        </div>

        {error && <div className="error">❌ {error}</div>}
        {success && <div className="success">✅ {success}</div>}

        <button
          type="submit"
          className="button"
          disabled={loading || !account}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {loading ? '🔄 Creating Will...' : '📜 Create Multi-Sig Will'}
        </button>
      </form>
    </div>
  );
};

export default SealMultiSigWill;
