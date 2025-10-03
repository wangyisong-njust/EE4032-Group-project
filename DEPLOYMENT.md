# Chronos Vault - Deployment Guide

## Project Overview
Chronos Vault (时间胶囊) is a decentralized application for locking assets (ETH, NFTs) and encrypted information on the blockchain, accessible only by a designated recipient after a specified time.

## Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Hardhat or Truffle for smart contract deployment
- An Ethereum testnet account with test ETH (e.g., Sepolia, Goerli)

---

## Part 1: Smart Contract Deployment

### Step 1: Install Hardhat
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

### Step 2: Install OpenZeppelin Contracts
```bash
npm install @openzeppelin/contracts
```

### Step 3: Configure Hardhat
Create or update `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "YOUR_ALCHEMY_OR_INFURA_URL",
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};
```

### Step 4: Deploy the Contract
Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const ChronosVault = await hre.ethers.getContractFactory("ChronosVault");
  const chronosVault = await ChronosVault.deploy();

  await chronosVault.waitForDeployment();

  console.log("ChronosVault deployed to:", await chronosVault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy to testnet:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 5: Verify Contract (Optional)
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

---

## Part 2: Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Contract Address
Update `src/contractConfig.js` with your deployed contract address:

```javascript
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### Step 4: Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

---

## Part 3: Usage Guide

### Sealing a Capsule
1. Connect your MetaMask wallet
2. Fill in the form:
   - **Recipient Address**: The Ethereum address that can unseal the capsule
   - **Secret Message**: Your encrypted message
   - **Unlock Date & Time**: When the capsule can be unsealed
   - **ETH Amount**: Optional ETH to lock (0 for none)
3. Click "Seal Capsule" and confirm the transaction in MetaMask
4. Note the Capsule ID from the success message

### Viewing and Unsealing a Capsule
1. Enter the Capsule ID
2. Click "Query" to view capsule details
3. If unlock time has passed, click "Unseal Capsule"
4. After unsealing, click "View Decryption Key" to see the decryption key
5. The message will be automatically decrypted and displayed

### Notifications
- The app automatically listens for unlock events
- When a capsule you're the recipient of is unsealed, you'll see a notification

---

## Part 4: NFT Capsules (Advanced)

To seal a capsule with an NFT:

1. First, approve the ChronosVault contract to transfer your NFT:
```javascript
// Using ethers.js
const nftContract = new Contract(NFT_ADDRESS, ERC721_ABI, signer);
await nftContract.approve(CHRONOS_VAULT_ADDRESS, TOKEN_ID);
```

2. Call `sealCapsuleWithNFT` function with:
   - Recipient address
   - Encrypted data
   - Decryption key
   - Unlock timestamp
   - NFT contract address
   - NFT token ID

---

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Decryption Keys**: Keys are stored on-chain but only accessible after unsealing
3. **Gas Costs**: Be aware of transaction costs on mainnet
4. **Testnet First**: Always test on testnet before mainnet deployment
5. **Smart Contract Audits**: Consider professional audits for production use

---

## Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Check that you're on the correct network
- Try refreshing the page

### Transaction Failures
- Ensure you have enough ETH for gas fees
- Check that unlock timestamp is in the future
- Verify recipient address is valid

### Contract Interaction Errors
- Confirm contract address is correctly configured
- Ensure you're using the correct network
- Check that the contract is deployed and verified

---

## Project Structure

```
CEG4032/
├── ChronosVault.sol          # Smart contract
├── DEPLOYMENT.md             # This file
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js            # Main application
        ├── index.js          # Entry point
        ├── index.css         # Global styles
        ├── contractConfig.js # Contract configuration
        ├── components/
        │   ├── ConnectWallet.js
        │   ├── SealCapsule.js
        │   ├── ViewCapsule.js
        │   └── Notification.js
        └── utils/
            └── encryption.js # Encryption utilities
```

---

## Next Steps

1. Deploy to testnet and test all features
2. Consider adding additional features:
   - Batch sealing multiple capsules
   - Transfer capsule ownership
   - Cancel/revoke capsules before unlock
3. Implement comprehensive error handling
4. Add user analytics and tracking
5. Deploy to mainnet after thorough testing

---

## Support and Resources

- Ethereum Documentation: https://ethereum.org/developers
- Hardhat Documentation: https://hardhat.org/docs
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts
- ethers.js Documentation: https://docs.ethers.org/
- React Documentation: https://react.dev/

---

## License
MIT License - Feel free to modify and use for your projects
