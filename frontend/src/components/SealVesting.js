import React, { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { generateKey, encryptMessage } from '../utils/encryption';
import DateTimePicker from './DateTimePicker';

const SealVesting = ({ account }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [vestingPeriods, setVestingPeriods] = useState([
    { date: null, amount: '' },
    { date: null, amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePeriodChange = (index, field, value) => {
    const newPeriods = [...vestingPeriods];
    if (field === 'date') {
      newPeriods[index][field] = value;
    } else {
      newPeriods[index][field] = value;
    }
    setVestingPeriods(newPeriods);
  };

  const addPeriod = () => {
    setVestingPeriods([...vestingPeriods, { date: null, amount: '' }]);
  };

  const removePeriod = (index) => {
    if (vestingPeriods.length > 1) {
      setVestingPeriods(vestingPeriods.filter((_, i) => i !== index));
    }
  };

  const getTotalAmount = () => {
    return vestingPeriods.reduce((sum, period) => {
      const amount = parseFloat(period.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const handleSealVesting = async (e) => {
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

      if (!recipient || !message || !tokenAddress) {
        throw new Error('Please fill in all required fields!');
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
        throw new Error('Invalid token address format!');
      }

      // Validate periods
      const validPeriods = vestingPeriods.filter(p => p.date && p.amount);
      if (validPeriods.length === 0) {
        throw new Error('Please add at least one vesting period!');
      }

      const timestamps = [];
      const amounts = [];

      for (const period of validPeriods) {
        const timestamp = Math.floor(period.date.getTime() / 1000);
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (timestamp <= currentTimestamp) {
          throw new Error('All unlock times must be in the future!');
        }

        // Convert amount to wei (assuming 18 decimals)
        const amountWei = BigInt(Math.floor(parseFloat(period.amount) * 1e18));

        timestamps.push(timestamp);
        amounts.push(amountWei);
      }

      const encryptionKey = generateKey();
      const encryptedMessage = encryptMessage(message, encryptionKey);
      const encryptedBytes = new TextEncoder().encode(encryptedMessage);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // First approve token transfer
      const tokenContract = new Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );

      const totalAmount = amounts.reduce((a, b) => a + b, BigInt(0));

      setSuccess('Approving token transfer...');
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, totalAmount);
      await approveTx.wait();

      // Then seal vesting
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setSuccess('Creating vesting schedule...');
      const tx = await contract.sealVestingSchedule(
        recipient,
        encryptedBytes,
        encryptionKey,
        tokenAddress,
        timestamps,
        amounts
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

      setSuccess(`Vesting schedule created successfully! Capsule ID: ${capsuleId}`);

      // Reset form
      setRecipient('');
      setMessage('');
      setTokenAddress('');
      setVestingPeriods([
        { date: null, amount: '' },
        { date: null, amount: '' },
      ]);

    } catch (err) {
      console.error('Error creating vesting:', err);
      setError(err.message || 'Failed to create vesting schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📊 Token Vesting Schedule</h2>
      <p style={{ color: '#a0a0b0', fontSize: '0.95em', marginBottom: '20px' }}>
        Create a vesting schedule for employee token distribution
      </p>

      <form onSubmit={handleSealVesting}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Employee Address
          </label>
          <input
            type="text"
            className="input"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Vesting Terms
          </label>
          <textarea
            className="input"
            placeholder="Employment terms and vesting conditions..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows="3"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Token Contract Address (ERC20)
          </label>
          <input
            type="text"
            className="input"
            placeholder="0x..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Vesting Schedule
          </label>
          {vestingPeriods.map((period, index) => (
            <div key={index} style={{
              background: 'rgba(139, 92, 246, 0.05)',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
                  Unlock Date {index + 1}
                </label>
                <DateTimePicker
                  selected={period.date}
                  onChange={(date) => handlePeriodChange(index, 'date', date)}
                  disabled={loading}
                  placeholderText={`Vesting unlock ${index + 1}...`}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
                    Token Amount
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0.0"
                    value={period.amount}
                    onChange={(e) => handlePeriodChange(index, 'amount', e.target.value)}
                    disabled={loading}
                    step="0.01"
                    min="0"
                    style={{ margin: 0 }}
                  />
                </div>
                {vestingPeriods.length > 1 && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => removePeriod(index)}
                    disabled={loading}
                    style={{ padding: '10px 20px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="button"
            onClick={addPeriod}
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            ➕ Add Period
          </button>
        </div>

        <div style={{
          background: 'rgba(167, 139, 250, 0.1)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <strong>Total Tokens:</strong> {getTotalAmount().toLocaleString()}
        </div>

        {error && <div className="error">❌ {error}</div>}
        {success && <div className="success">✅ {success}</div>}

        <button
          type="submit"
          className="button"
          disabled={loading || !account}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {loading ? '🔄 Creating Schedule...' : '📊 Create Vesting Schedule'}
        </button>
      </form>
    </div>
  );
};

export default SealVesting;
