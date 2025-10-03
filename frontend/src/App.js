import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import SealCapsule from './components/SealCapsule';
import ViewCapsule from './components/ViewCapsule';
import Notification from './components/Notification';

function App() {
  const [account, setAccount] = useState(null);

  const handleAccountChange = (newAccount) => {
    setAccount(newAccount);
  };

  return (
    <div className="container">
      <ConnectWallet onAccountChange={handleAccountChange} />

      {account ? (
        <>
          <SealCapsule account={account} />
          <ViewCapsule account={account} />
          <Notification account={account} />
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Please connect your wallet to use Chronos Vault</p>
        </div>
      )}
    </div>
  );
}

export default App;
