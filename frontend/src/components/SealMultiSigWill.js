import React, { useState } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { encryptMessage } from '../utils/encryption';
import DateTimePicker from './DateTimePicker';

const SealMultiSigWill = ({ account }) => {
  const [recipient, setRecipient] = useState('');
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
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
      if (!recipient || !message || !unlockDate || !recipientPublicKey) {
        throw new Error('Please fill in all required fields including recipient public key!');
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

      const encryptedMessage = await encryptMessage(message, recipientPublicKey);

      // Convert JSON string to UTF-8 bytes for contract storage
      const { toUtf8Bytes } = await import('ethers');
      const encryptedMessageBytes = toUtf8Bytes(encryptedMessage);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.sealMultiSigWill(
        recipient,
        encryptedMessageBytes,  // bytes format
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
      setRecipientPublicKey('');
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
      <h2>📜 For Companies, Shareholders, and Boards of Directors</h2>
      <p style={{ color: '#a0a0b0', fontSize: '0.95em', marginBottom: '15px' }}>
        Multi-signature governance requiring consensus from designated trustees. Perfect for corporate decisions and organizational agreements.
      </p>

      <div style={{
        background: 'rgba(34, 197, 94, 0.08)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1em', color: '#86efac' }}>💡 Use Cases</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#a0a0b0', fontSize: '0.9em', lineHeight: '1.7' }}>
          <li><strong>Board Voting:</strong> Require director approval for dividend distributions or major decisions</li>
          <li><strong>Shareholder Agreements:</strong> Release funds or assets with majority shareholder consent</li>
          <li><strong>Investor Rights:</strong> Multi-partner approval for capital withdrawal or investment decisions</li>
          <li><strong>Emergency Access:</strong> Access reserves with supermajority trustee approval</li>
        </ul>
      </div>

      <form onSubmit={handleSealWill}>
        <div className="collapsible-section">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Recipient Address *
            </label>
            <input
              type="text"
              className="input"
              placeholder="0x... (Company account, shareholder, or beneficiary)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={loading}
            />
            <p style={{ fontSize: '0.8em', color: '#808090', margin: '5px 0 0 0' }}>
              💼 Examples: Company treasury, majority shareholder, distribution account
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Recipient's Public Key *
            </label>
            <input
              type="text"
              className="input"
              placeholder="Paste recipient's public key here"
              value={recipientPublicKey}
              onChange={(e) => setRecipientPublicKey(e.target.value)}
              disabled={loading}
            />
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px',
              borderRadius: '8px',
              marginTop: '8px'
            }}>
              <p style={{ fontSize: '0.85em', color: '#fca5a5', margin: '0', lineHeight: '1.5' }}>
                ⚠️ <strong>Public key must be from the recipient's account!</strong> Otherwise they cannot decrypt. Ask the recipient to export their public key from the View Capsules page.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Scheduled Release Date *
            </label>
            <DateTimePicker
              selected={unlockDate}
              onChange={(date) => setUnlockDate(date)}
              disabled={loading}
              placeholderText="Quarterly/Annual distribution date..."
            />
            <p style={{ color: '#808090', fontSize: '0.85em', marginTop: '5px' }}>
              📅 Auto-unlock on this date, or earlier with required trustee approvals
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Message / Details *
          </label>
          <textarea
            className="input"
            placeholder="Board resolution, distribution terms, shareholder agreement details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows="4"
          />
          <p style={{ fontSize: '0.8em', color: '#808090', margin: '5px 0 0 0' }}>
            💡 Examples: "Q4 dividend distribution", "Emergency fund access", "Capital reallocation"
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            ETH Amount to Lock <span style={{ color: '#808090', fontSize: '0.9em' }}>(optional)</span>
          </label>
          <input
            type="number"
            className="input"
            placeholder="0.0 (Dividend, profit distribution, or capital amount)"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            disabled={loading}
            step="0.001"
            min="0"
          />
          <p style={{ fontSize: '0.8em', color: '#808090', margin: '5px 0 0 0' }}>
            💰 Use cases: Quarterly dividends, emergency reserves, capital distribution
          </p>
        </div>

        <div className="collapsible-section">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Approvers / Signers *
            </label>
            <p style={{ color: '#808090', fontSize: '0.85em', marginBottom: '10px' }}>
              Add board members, shareholders, or partners who can vote on early release
            </p>
            {trustees.map((trustee, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder={`Approver ${index + 1} address (0x...) - Board member, shareholder, or partner`}
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
              ➕ Add Approver
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
              ⚖️ Requires {requiredApprovals} out of {trustees.filter(t => t.trim() !== '').length} approvers to unlock early (M-of-N multisig)
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
          {loading ? '🔄 Creating Governance Contract...' : '📜 Create Multi-Sig Governance'}
        </button>
      </form>
    </div>
  );
};

export default SealMultiSigWill;
