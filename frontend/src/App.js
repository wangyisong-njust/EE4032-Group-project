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
          <p className="hero-subtitle">Lock your secrets in time, unlock them in the future</p>
          <div className="hero-features">
            <div className="feature-badge">🔒 Time Capsules</div>
            <div className="feature-badge">📜 Multi-Sig Wills</div>
            <div className="feature-badge">📊 Token Vesting</div>
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
          <div className="welcome-card">
            <div className="welcome-icon">🔐</div>
            <h2>Welcome to Chronos Vault</h2>
            <p>Connect your wallet to start creating time capsules</p>
          </div>
        )}

        <Notification account={account} />
      </div>
    </div>
  );
}

export default App;
