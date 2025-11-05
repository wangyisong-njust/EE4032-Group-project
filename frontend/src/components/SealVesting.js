import React, { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { encryptMessage } from '../utils/encryption';
import DateTimePicker from './DateTimePicker';

const SealVesting = ({ account }) => {
  const [recipient, setRecipient] = useState('');
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
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

      if (!recipient || !message || !tokenAddress || !recipientPublicKey) {
        throw new Error('Please fill in all required fields including recipient public key!');
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
        throw new Error('Invalid token address format!');
      }

      // Check if token address is same as user's address (common mistake)
      const currentAddress = await (new BrowserProvider(window.ethereum)).getSigner().then(s => s.getAddress());
      if (tokenAddress.toLowerCase() === currentAddress.toLowerCase()) {
        throw new Error('Token address cannot be your wallet address! Please enter the ERC20 token contract address.');
      }

      // Check if token address is a contract
      const provider = new BrowserProvider(window.ethereum);
      const code = await provider.getCode(tokenAddress);
      if (code === '0x') {
        throw new Error('The address you entered is not a contract! Please enter a valid ERC20 token contract address. If you need a test token, you must deploy one first.');
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

      const encryptedMessage = await encryptMessage(message, recipientPublicKey);

      // Convert JSON string to UTF-8 bytes for contract storage
      const { toUtf8Bytes } = await import('ethers');
      const encryptedMessageBytes = toUtf8Bytes(encryptedMessage);

      // Reuse provider from line 77
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
        encryptedMessageBytes,  // bytes format
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
      setRecipientPublicKey('');
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
      <h2>📊 For Employee Compensation and Equity Incentive Programs</h2>
      <p style={{ color: '#a0a0b0', fontSize: '0.95em', marginBottom: '15px' }}>
        Automated token vesting schedules for employee equity, contractor payments, and long-term incentive programs. Bankruptcy-proof and fully automated.
      </p>

      <div style={{
        background: 'rgba(236, 72, 153, 0.08)',
        border: '1px solid rgba(236, 72, 153, 0.2)',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1em', color: '#f9a8d4' }}>💡 Use Cases & Benefits</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#a0a0b0', fontSize: '0.9em', lineHeight: '1.7' }}>
          <li><strong>Employee Equity:</strong> Multi-year vesting schedules with quarterly or annual token releases</li>
          <li><strong>Advisor & Contractor Compensation:</strong> Vesting with cliff periods and milestone-based releases</li>
          <li><strong>Risk Protection:</strong> Tokens secured in smart contract, protected from company bankruptcy</li>
          <li><strong>Fully Automated:</strong> Recipients claim directly without company involvement or manual distribution</li>
        </ul>
      </div>

      <form onSubmit={handleSealVesting}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Employee / Recipient Address *
          </label>
          <input
            type="text"
            className="input"
            placeholder="0x... (Employee, contractor, or advisor wallet)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={loading}
          />
          <p style={{ fontSize: '0.8em', color: '#808090', margin: '5px 0 0 0' }}>
            👤 This wallet will receive vested tokens on the schedule below
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
            Employment Terms / Grant Details *
          </label>
          <textarea
            className="input"
            placeholder="Stock option agreement, employment terms, vesting conditions..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows="3"
          />
          <p style={{ fontSize: '0.8em', color: '#808090', margin: '5px 0 0 0' }}>
            💡 Examples: "Employee stock options - 4yr vest", "Advisor grant - 2yr w/ 6mo cliff"
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Token Contract Address (ERC20) *
          </label>
          <input
            type="text"
            className="input"
            placeholder="0x... (ERC20 token contract, NOT your wallet address!)"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            disabled={loading}
          />
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '10px',
            borderRadius: '8px',
            marginTop: '8px'
          }}>
            <p style={{ fontSize: '0.85em', color: '#fca5a5', margin: '0 0 8px 0', lineHeight: '1.5' }}>
              ⚠️ <strong>IMPORTANT: Enter the ERC20 token contract address, NOT your wallet address!</strong>
            </p>
            <p style={{ fontSize: '0.8em', color: '#fca5a5', margin: '0', lineHeight: '1.5' }}>
              💡 If you don't have a token contract, you need to deploy a test ERC20 token first. You can use Remix or other tools to deploy.
            </p>
          </div>
          <p style={{ fontSize: '0.8em', color: '#808090', margin: '8px 0 0 0' }}>
            🪙 Must be an ERC20-compatible token contract. Ensure you have approved tokens for this contract.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Vesting Schedule *
          </label>
          <p style={{ fontSize: '0.85em', color: '#808090', marginBottom: '10px' }}>
            📅 Define when and how many tokens unlock. Common: 4 years with quarterly distributions.
          </p>
          {vestingPeriods.map((period, index) => (
            <div key={index} style={{
              background: 'rgba(139, 92, 246, 0.05)',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', fontWeight: '600' }}>
                  📆 Unlock Date {index + 1}
                </label>
                <DateTimePicker
                  selected={period.date}
                  onChange={(date) => handlePeriodChange(index, 'date', date)}
                  disabled={loading}
                  placeholderText={`Year ${Math.floor(index / 4) + 1}, Quarter ${(index % 4) + 1}...`}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', fontWeight: '600' }}>
                    🪙 Token Amount
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="2500 (e.g., 10,000 total / 4 years)"
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
            ➕ Add Vesting Period
          </button>
        </div>

        <div style={{
          background: 'rgba(167, 139, 250, 0.1)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <strong>Total Tokens to Vest:</strong> {getTotalAmount().toLocaleString()}
          <p style={{ fontSize: '0.85em', color: '#a0a0b0', marginTop: '5px', marginBottom: 0 }}>
            💡 These tokens will be locked in the smart contract and released automatically
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
          {loading ? '🔄 Locking Tokens & Creating Schedule...' : '📊 Lock Tokens & Create Vesting'}
        </button>
        <p style={{ fontSize: '0.8em', color: '#808090', marginTop: '10px', textAlign: 'center' }}>
          ✅ Tokens will be transferred to the smart contract and locked until vesting dates
        </p>
      </form>
    </div>
  );
};

export default SealVesting;
