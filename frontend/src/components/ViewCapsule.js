import React, { useState } from 'react';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { decryptMessage, getPublicKeyFromAddress } from '../utils/encryption';

const ViewCapsule = ({ account }) => {
  const [capsuleId, setCapsuleId] = useState('');
  const [capsuleData, setCapsuleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [myPublicKey, setMyPublicKey] = useState('');
  const [multiSigDetails, setMultiSigDetails] = useState(null);
  const [vestingDetails, setVestingDetails] = useState(null);

  const queryCapsule = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    setCapsuleData(null);
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

      const capsuleType = Number(capsule[8]); // CapsuleType: 0=STANDARD, 1=MULTISIG_WILL, 2=VESTING

      const data = {
        owner: capsule[0],
        recipient: capsule[1],
        encryptedData: capsule[2],
        unlockTimestamp: Number(capsule[3]),  // Fixed: was [4], now [3]
        ethValue: capsule[4],                  // Fixed: was [5], now [4]
        nftContractAddress: capsule[5],        // Fixed: was [6], now [5]
        nftTokenId: capsule[6],                // Fixed: was [7], now [6]
        isUnsealed: capsule[7],                // Fixed: was [8], now [7]
        capsuleType: capsuleType               // Store capsule type
      };

      setCapsuleData(data);
      setSuccess('Capsule data loaded successfully!');

      // If it's a multi-sig will, get the multi-sig details
      if (capsuleType === 1) { // CapsuleType.MULTISIG_WILL = 1
        try {
          const multiSig = await contract.getMultiSigDetails(capsuleId);
          setMultiSigDetails({
            trustees: multiSig[0],
            requiredApprovals: Number(multiSig[1]),
            currentApprovals: Number(multiSig[2]),
            isExecuted: multiSig[3]
          });
        } catch (err) {
          console.error('Error getting multi-sig details:', err);
        }
        setVestingDetails(null);
      }
      // If it's a vesting schedule, get the vesting details
      else if (capsuleType === 2) { // CapsuleType.VESTING = 2
        try {
          const vesting = await contract.getVestingDetails(capsuleId);
          setVestingDetails({
            tokenAddress: vesting[0],
            totalAmount: vesting[1],
            releasedAmount: vesting[2],
            unlockTimestamps: vesting[3].map(t => Number(t)),
            unlockAmounts: vesting[4]
          });
        } catch (err) {
          console.error('Error getting vesting details:', err);
        }
        setMultiSigDetails(null);
      }
      else {
        setMultiSigDetails(null);
        setVestingDetails(null);
      }

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

  const approveMultiSigUnlock = async () => {
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

      // Call approveMultiSigUnlock function
      const tx = await contract.approveMultiSigUnlock(capsuleId);
      setSuccess('Approval transaction submitted! Waiting for confirmation...');

      await tx.wait();
      setSuccess('Approval submitted successfully!');

      // Refresh capsule data to get updated approval count
      await queryCapsule();

    } catch (err) {
      console.error('Error approving unlock:', err);
      setError(err.message || 'Failed to approve unlock. Make sure you are a trustee and have not already approved.');
    } finally {
      setLoading(false);
    }
  };

  const claimVestingTokens = async () => {
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

      // Call releaseVestedTokens function
      setSuccess('Claiming vested tokens...');
      const tx = await contract.releaseVestedTokens(capsuleId);
      setSuccess('Transaction submitted! Waiting for confirmation...');

      const receipt = await tx.wait();

      // Calculate claimed amount from events
      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log)?.name === 'VestingReleased';
        } catch {
          return false;
        }
      });

      let claimedAmount = 'tokens';
      if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        const amount = parsedEvent.args[1]; // amount is second argument
        claimedAmount = (Number(amount) / 1e18).toLocaleString() + ' tokens';
      }

      setSuccess(`Successfully claimed ${claimedAmount}!`);

      // Refresh capsule data to get updated vesting details
      await queryCapsule();

    } catch (err) {
      console.error('Error claiming tokens:', err);
      if (err.message.includes('No tokens to release')) {
        setError('No tokens available to claim yet. Please wait until the unlock time.');
      } else if (err.message.includes('Only recipient can release')) {
        setError('Only the recipient can claim vested tokens.');
      } else {
        setError(err.message || 'Failed to claim vested tokens');
      }
    } finally {
      setLoading(false);
    }
  };

  const decryptCapsuleMessage = async () => {
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

      if (!capsuleData || !capsuleData.encryptedData) {
        throw new Error('No encrypted data available!');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();

      console.log('=== DECRYPT CAPSULE DEBUG ===');
      console.log('Current connected account:', currentAddress);
      console.log('Capsule recipient:', capsuleData.recipient);
      console.log('Addresses match:', currentAddress.toLowerCase() === capsuleData.recipient.toLowerCase());
      console.log('Encrypted data length:', capsuleData.encryptedData.length);
      console.log('Encrypted data starts with:', capsuleData.encryptedData.substring(0, 50));

      // Check if current user is the recipient
      if (currentAddress.toLowerCase() !== capsuleData.recipient.toLowerCase()) {
        throw new Error(`Only the recipient can decrypt this message! Current account: ${currentAddress}, Required recipient: ${capsuleData.recipient}`);
      }

      // Decrypt message using MetaMask's eth_decrypt
      // The encrypted data from contract is in hex format (0x...)
      // decryptMessage will handle the conversion to the format MetaMask expects
      console.log('Starting decryption...');
      const decrypted = await decryptMessage(capsuleData.encryptedData, currentAddress);
      setDecryptedMessage(decrypted);
      setSuccess('Message decrypted successfully!');

    } catch (err) {
      console.error('Error decrypting message:', err);
      setError(err.message || 'Failed to decrypt message. Make sure you are the intended recipient.');
    } finally {
      setLoading(false);
    }
  };

  const exportMyPublicKey = async () => {
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
      const address = await signer.getAddress();

      const publicKey = await getPublicKeyFromAddress(address);
      setMyPublicKey(publicKey);
      setSuccess('Public key exported! Share this with people who want to send you encrypted capsules.');

    } catch (err) {
      console.error('Error exporting public key:', err);
      setError(err.message || 'Failed to export public key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isUnlockable = () => {
    if (!capsuleData) return false;
    // Only for STANDARD capsules (type 0), check if time has passed
    // Multi-sig wills have their own unlock logic
    if (capsuleData.capsuleType !== 0) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= capsuleData.unlockTimestamp && !capsuleData.isUnsealed;
  };

  const isMultiSigUnlockable = () => {
    if (!capsuleData || !multiSigDetails) return false;
    if (capsuleData.isUnsealed) return false;
    // Multi-sig can be unlocked if:
    // 1. Enough approvals are collected, OR
    // 2. Time has passed
    const currentTime = Math.floor(Date.now() / 1000);
    const timeReached = currentTime >= capsuleData.unlockTimestamp;
    const approvalsReached = multiSigDetails.currentApprovals >= multiSigDetails.requiredApprovals;
    return timeReached || approvalsReached;
  };

  return (
    <div className="card">
      <h2>🔍 View Time Capsule</h2>

      <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1em' }}>🔑 Export Your Public Key</h3>
        <p style={{ fontSize: '0.9em', color: '#a0a0b0', marginBottom: '12px' }}>
          Share your public key with others so they can send you encrypted capsules.
        </p>
        <button
          className="button"
          onClick={exportMyPublicKey}
          disabled={loading || !account}
          style={{ width: '100%', marginBottom: myPublicKey ? '12px' : '0' }}
        >
          📤 Export My Public Key
        </button>

        {myPublicKey && (
          <div style={{ marginTop: '12px' }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '12px',
              borderRadius: '8px',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              color: '#86efac',
              fontSize: '0.85em',
              marginBottom: '8px'
            }}>
              {myPublicKey}
            </div>
            <button
              className="button"
              onClick={() => copyToClipboard(myPublicKey)}
              style={{ width: '100%', fontSize: '0.9em' }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        )}
      </div>

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

          {account && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <strong>Your Connected Account:</strong>
              <div style={{
                color: '#c4b5fd',
                fontSize: '0.9em',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                marginTop: '4px'
              }}>
                {account}
              </div>
              {account.toLowerCase() === capsuleData.recipient.toLowerCase() && (
                <div style={{ color: '#86efac', fontSize: '0.9em', marginTop: '8px' }}>
                  ✅ You are the recipient of this capsule
                </div>
              )}
              {account.toLowerCase() !== capsuleData.recipient.toLowerCase() && (
                <div style={{ color: '#fbbf24', fontSize: '0.9em', marginTop: '8px' }}>
                  ⚠️ You are NOT the recipient. Switch to the recipient account to decrypt.
                </div>
              )}
            </div>
          )}

          <div className="info-box">
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>Type:</strong>
              <span style={{
                color: capsuleData.capsuleType === 0 ? '#86efac' : capsuleData.capsuleType === 1 ? '#c4b5fd' : '#fbbf24',
                fontWeight: '600'
              }}>
                {capsuleData.capsuleType === 0 && '📦 Personal Use'}
                {capsuleData.capsuleType === 1 && '📜 Corporate Governance'}
                {capsuleData.capsuleType === 2 && '💰 Employee Equity'}
              </span>
            </div>

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

            {capsuleData.capsuleType !== 2 && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Unlock Time:</strong>
                <div style={{ color: '#c4b5fd', marginTop: '4px' }}>
                  ⏰ {formatDate(capsuleData.unlockTimestamp)}
                </div>
              </div>
            )}

            {capsuleData.capsuleType === 2 && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Vesting Period:</strong>
                <div style={{ color: '#fbbf24', marginTop: '4px' }}>
                  📊 Multiple unlock times (see schedule below)
                </div>
              </div>
            )}

            {capsuleData.ethValue && BigInt(capsuleData.ethValue) > 0n && (
              <div style={{ marginBottom: '12px' }}>
                <strong>ETH Locked:</strong>
                <div style={{ color: '#86efac', marginTop: '4px' }}>
                  💰 {formatEther(capsuleData.ethValue)} ETH
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

          {/* Vesting Schedule Details Section */}
          {vestingDetails && (
            <div style={{ marginTop: '25px' }}>
              <h3>📊 Token Vesting Schedule</h3>
              <div className="info-box" style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Token Contract:</strong>
                  <div style={{
                    color: '#fbbf24',
                    fontSize: '0.9em',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    marginTop: '4px'
                  }}>
                    {vestingDetails.tokenAddress}
                  </div>
                </div>

                <div style={{ marginBottom: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <strong>Total Amount:</strong>
                    <div style={{ color: '#86efac', fontSize: '1.1em', marginTop: '4px' }}>
                      {(Number(vestingDetails.totalAmount) / 1e18).toLocaleString()} tokens
                    </div>
                  </div>
                  <div>
                    <strong>Released:</strong>
                    <div style={{ color: '#c4b5fd', fontSize: '1.1em', marginTop: '4px' }}>
                      {(Number(vestingDetails.releasedAmount) / 1e18).toLocaleString()} tokens
                    </div>
                  </div>
                  <div>
                    <strong>Remaining:</strong>
                    <div style={{ color: '#fbbf24', fontSize: '1.1em', marginTop: '4px' }}>
                      {((Number(vestingDetails.totalAmount) - Number(vestingDetails.releasedAmount)) / 1e18).toLocaleString()} tokens
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <strong>Unlock Schedule:</strong>
                  <div style={{ marginTop: '12px' }}>
                    {vestingDetails.unlockTimestamps.map((timestamp, index) => {
                      const amount = vestingDetails.unlockAmounts[index];
                      const isUnlocked = timestamp <= Math.floor(Date.now() / 1000);
                      const isFuture = timestamp > Math.floor(Date.now() / 1000);

                      return (
                        <div
                          key={index}
                          style={{
                            padding: '12px',
                            background: isUnlocked ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                            border: isUnlocked ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '8px',
                            marginBottom: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ fontSize: '0.85em', color: '#a0a0b0', marginBottom: '4px' }}>
                                Period {index + 1}
                              </div>
                              <div style={{ color: isUnlocked ? '#86efac' : '#fbbf24', fontWeight: '600' }}>
                                {isUnlocked ? '✅ ' : '⏰ '}{formatDate(timestamp)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.85em', color: '#a0a0b0', marginBottom: '4px' }}>
                                Amount
                              </div>
                              <div style={{ color: isUnlocked ? '#86efac' : '#fbbf24', fontWeight: '600', fontSize: '1.1em' }}>
                                {(Number(amount) / 1e18).toLocaleString()} tokens
                              </div>
                            </div>
                          </div>
                          {isFuture && (
                            <div style={{ fontSize: '0.8em', color: '#a0a0b0', marginTop: '8px' }}>
                              🔒 Locked until {formatDate(timestamp)}
                            </div>
                          )}
                          {isUnlocked && (
                            <div style={{ fontSize: '0.8em', color: '#86efac', marginTop: '8px' }}>
                              ✅ Available to claim
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {vestingDetails.unlockTimestamps.some(t => t <= Math.floor(Date.now() / 1000)) &&
                 vestingDetails.releasedAmount < vestingDetails.totalAmount && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <p style={{ fontSize: '0.9em', color: '#86efac', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                      🎉 Some tokens are now unlocked! You can claim them now.
                    </p>
                    {account && account.toLowerCase() === capsuleData.recipient.toLowerCase() && (
                      <button
                        className="button"
                        onClick={claimVestingTokens}
                        disabled={loading}
                        style={{ width: '100%' }}
                      >
                        💰 Claim Unlocked Tokens
                      </button>
                    )}
                    {account && account.toLowerCase() !== capsuleData.recipient.toLowerCase() && (
                      <p style={{ fontSize: '0.85em', color: '#fbbf24', margin: '0' }}>
                        ⚠️ Only the recipient can claim tokens. Please switch to the recipient account.
                      </p>
                    )}
                  </div>
                )}

                {vestingDetails.releasedAmount >= vestingDetails.totalAmount && (
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <p style={{ fontSize: '0.9em', color: '#c4b5fd', margin: '0', lineHeight: '1.5' }}>
                      ✅ All tokens have been claimed! Vesting schedule completed.
                    </p>
                  </div>
                )}

                {/* Decrypt message button for vesting capsules */}
                {capsuleData && !decryptedMessage && (
                  <div style={{ marginTop: '15px' }}>
                    <button
                      className="button"
                      onClick={decryptCapsuleMessage}
                      disabled={loading}
                      style={{ width: '100%' }}
                    >
                      🔐 Decrypt Employment Terms / Message
                    </button>
                    {account && account.toLowerCase() !== capsuleData.recipient.toLowerCase() && (
                      <p style={{ fontSize: '0.85em', color: '#fbbf24', margin: '8px 0 0 0', textAlign: 'center' }}>
                        ⚠️ Only the recipient can decrypt the message
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multi-Sig Details Section */}
          {multiSigDetails && (
            <div style={{ marginTop: '25px' }}>
              <h3>🔐 Multi-Signature Governance</h3>
              <div className="info-box" style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Approval Status:</strong>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '1.2em',
                    color: multiSigDetails.currentApprovals >= multiSigDetails.requiredApprovals ? '#86efac' : '#fbbf24'
                  }}>
                    {multiSigDetails.currentApprovals} / {multiSigDetails.requiredApprovals} approvals
                    {multiSigDetails.currentApprovals >= multiSigDetails.requiredApprovals && ' ✅'}
                  </div>
                  {multiSigDetails.isExecuted && (
                    <div style={{ color: '#86efac', fontSize: '0.9em', marginTop: '5px' }}>
                      ✅ Multi-sig governance executed
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <strong>Trustees / Approvers:</strong>
                  <div style={{ marginTop: '8px' }}>
                    {multiSigDetails.trustees.map((trustee, index) => {
                      const isSelf = account && trustee.toLowerCase() === account.toLowerCase();
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '8px 12px',
                            background: isSelf ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                            border: isSelf ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            fontFamily: 'monospace',
                            fontSize: '0.85em',
                            wordBreak: 'break-all',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {isSelf && <span style={{ color: '#c4b5fd' }}>👤 (You)</span>}
                          <span style={{ flex: 1, color: isSelf ? '#c4b5fd' : '#a0a0b0' }}>{trustee}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Show approve button if user is a trustee and hasn't approved yet */}
                {account && multiSigDetails.trustees.map(t => t.toLowerCase()).includes(account.toLowerCase()) &&
                 !multiSigDetails.isExecuted && !capsuleData.isUnsealed && (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <p style={{ fontSize: '0.9em', color: '#86efac', margin: '0', lineHeight: '1.5' }}>
                        ✅ You are a trustee! You can approve early unlock of this capsule.
                      </p>
                    </div>
                    <button
                      className="button"
                      onClick={approveMultiSigUnlock}
                      disabled={loading}
                      style={{ width: '100%' }}
                    >
                      ✅ Approve Early Unlock
                    </button>
                  </div>
                )}

                {multiSigDetails.currentApprovals >= multiSigDetails.requiredApprovals && !capsuleData.isUnsealed && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <p style={{ fontSize: '0.9em', color: '#86efac', margin: '0', lineHeight: '1.5' }}>
                      🎉 Required approvals reached! The capsule can now be unsealed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unseal button for STANDARD capsules (based on time only) */}
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

          {/* Unseal button for MULTI-SIG capsules (based on approvals OR time) */}
          {isMultiSigUnlockable() && (
            <button
              className="button"
              onClick={unsealCapsule}
              disabled={loading}
              style={{ marginTop: '20px', width: '100%' }}
            >
              {multiSigDetails.currentApprovals >= multiSigDetails.requiredApprovals
                ? '🔓 Unseal Capsule (Approvals Met)'
                : '🔓 Unseal Capsule (Time Reached)'}
            </button>
          )}

          {capsuleData.isUnsealed && !decryptedMessage && (
            <button
              className="button"
              onClick={decryptCapsuleMessage}
              disabled={loading}
              style={{ marginTop: '20px', width: '100%' }}
            >
              🔐 Decrypt Message
            </button>
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
