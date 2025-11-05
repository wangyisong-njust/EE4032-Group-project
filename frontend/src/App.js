import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import SealCapsule from './components/SealCapsule';
import SealMultiSigWill from './components/SealMultiSigWill';
import SealVesting from './components/SealVesting';
import ViewCapsule from './components/ViewCapsule';
import Notification from './components/Notification';

function App() {
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('standard');

  const handleAccountChange = (newAccount) => {
    setAccount(newAccount);
  };

  return (
    <div className="app">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Chronos Vault</span>
          </h1>
          <p className="hero-subtitle">Decentralized time-locked asset management for individuals, companies, and employees</p>
          <div className="hero-features">
            <div className="feature-badge">🔒 Personal Assets</div>
            <div className="feature-badge">📜 Corporate Governance</div>
            <div className="feature-badge">📊 Employee Equity</div>
          </div>
        </div>
      </div>

      <div className="container">
        <ConnectWallet onAccountChange={handleAccountChange} />

        {account ? (
          <>
            <div style={{ marginTop: '30px' }}>
              <div className="tab-buttons">
                <button
                  className={`tab-button ${activeTab === 'standard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('standard')}
                >
                  🔒 Time Capsule
                </button>
                <button
                  className={`tab-button ${activeTab === 'will' ? 'active' : ''}`}
                  onClick={() => setActiveTab('will')}
                >
                  📜 Multi-Sig Will
                </button>
                <button
                  className={`tab-button ${activeTab === 'vesting' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vesting')}
                >
                  📊 Token Vesting
                </button>
                <button
                  className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
                  onClick={() => setActiveTab('view')}
                >
                  🔍 View Capsule
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'standard' && <SealCapsule account={account} />}
                {activeTab === 'will' && <SealMultiSigWill account={account} />}
                {activeTab === 'vesting' && <SealVesting account={account} />}
                {activeTab === 'view' && <ViewCapsule account={account} />}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="welcome-card">
              <div className="welcome-icon">🔐</div>
              <h2>Welcome to Chronos Vault</h2>
              <p>Three powerful blockchain solutions for time-locked asset management</p>
              <p style={{ fontSize: '0.9em', color: '#a0a0b0', marginTop: '10px' }}>
                Connect your wallet to get started →
              </p>
            </div>

            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-card-icon">🔒</div>
                <h3 className="feature-card-title">For Individuals and Personal Use</h3>
                <p className="feature-card-description">
                  Time-locked encrypted messages and assets for personal goals and life planning.
                </p>
                <ul style={{ fontSize: '0.9em', color: '#a0a0b0', marginTop: '10px', paddingLeft: '20px', textAlign: 'left' }}>
                  <li>Personal time capsules & future messages</li>
                  <li>Digital wills & inheritance planning</li>
                  <li>Scheduled payments & trust funds</li>
                  <li>Escrow for personal contracts & agreements</li>
                </ul>
              </div>

              <div className="feature-card">
                <div className="feature-card-icon">📜</div>
                <h3 className="feature-card-title">For Companies, Shareholders, and Boards of Directors</h3>
                <p className="feature-card-description">
                  Multi-signature governance for corporate decisions requiring trustee consensus.
                </p>
                <ul style={{ fontSize: '0.9em', color: '#a0a0b0', marginTop: '10px', paddingLeft: '20px', textAlign: 'left' }}>
                  <li>Board voting on dividend distribution</li>
                  <li>Shareholder approval for fund withdrawals</li>
                  <li>Multi-party agreement enforcement</li>
                  <li>Emergency fund access with consensus</li>
                </ul>
              </div>

              <div className="feature-card">
                <div className="feature-card-icon">📊</div>
                <h3 className="feature-card-title">For Employee Compensation and Equity Incentive Programs</h3>
                <p className="feature-card-description">
                  Automated token vesting schedules for employee equity, compensation, and long-term incentives.
                </p>
                <ul style={{ fontSize: '0.9em', color: '#a0a0b0', marginTop: '10px', paddingLeft: '20px', textAlign: 'left' }}>
                  <li>Employee stock options (ESO) with multi-year vesting</li>
                  <li>Advisor & contractor compensation with cliff periods</li>
                  <li>Bankruptcy-proof - secured in smart contract</li>
                  <li>Fully automated - no manual distribution required</li>
                </ul>
              </div>
            </div>
          </>
        )}

        <Notification account={account} />
      </div>
    </div>
  );
}

export default App;
