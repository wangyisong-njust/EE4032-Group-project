# ⏰ Chronos Vault

> A decentralized time capsule system for locking assets and encrypted data on blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.0-blue.svg)](https://soliditylang.org/)
[![Network](https://img.shields.io/badge/Network-Sepolia-purple.svg)](https://sepolia.etherscan.io/)

## 🌟 Features

- **🔒 Time Capsules** - Lock ETH and NFTs with time-based unlock
- **📜 Multi-Sig Wills** - Estate planning with M-of-N trustee approval
- **📊 Token Vesting** - Employee compensation with scheduled releases
- **🔐 Encryption** - Client-side message encryption
- **⛓️ On-Chain** - Fully decentralized, no backend required

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

### 3. Deploy Contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000`

## 📖 Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide and usage examples.

## 🏗️ Architecture

### Smart Contract

- **Language:** Solidity 0.8.0
- **Standards:** ERC721Receiver, ERC20 compatible
- **Network:** Sepolia Testnet
- **Address:** `0x3c7259B276f94b157e2992BfFFDC1F58821626b5`

### Frontend

- **Framework:** React
- **Web3:** ethers.js v6
- **Styling:** CSS with glassmorphism
- **Encryption:** AES-256

## 🎯 Use Cases

### Estate Planning
Lock digital assets with trusted executors. When owner passes, trustees approve unlock for beneficiary.

### Employee Equity
Grant tokens with 4-year vesting. Automatic quarterly distributions without manual intervention.

### Trust Funds
Parents lock assets until child reaches 18. Family members can unlock early if needed.

## 🔐 Security

- ✅ Client-side encryption
- ✅ Time-locked contracts
- ✅ Multi-signature support
- ✅ Testnet tested
- ⚠️ Mainnet audit recommended

## 📜 Contract Functions

### Standard Capsules
```solidity
sealCapsule(recipient, encryptedData, decryptionKey, unlockTimestamp)
unsealCapsule(capsuleId)
```

### Multi-Sig Wills
```solidity
sealMultiSigWill(recipient, encryptedData, key, timestamp, trustees, requiredApprovals)
approveMultiSigUnlock(capsuleId)
```

### Token Vesting
```solidity
sealVestingSchedule(recipient, encryptedData, key, tokenAddress, timestamps, amounts)
releaseVestedTokens(capsuleId)
```

## 🌐 Live Demo

**Contract:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x3c7259B276f94b157e2992BfFFDC1F58821626b5)

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Solidity, OpenZeppelin |
| Development | Hardhat, ethers.js |
| Frontend | React, CSS3 |
| Network | Ethereum Sepolia |
| Wallet | MetaMask |

## 📁 Project Structure

```
├── contracts/
│   └── ChronosVault.sol      # Main contract
├── scripts/
│   └── deploy.js              # Deployment script
├── frontend/
│   └── src/
│       ├── components/        # React components
│       ├── utils/             # Encryption utilities
│       └── contractConfig.js  # Contract ABI & address
├── DEPLOYMENT.md              # Full deployment guide
└── README.md                  # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Links

- **Ethereum:** https://ethereum.org
- **Hardhat:** https://hardhat.org
- **OpenZeppelin:** https://openzeppelin.com
- **Sepolia Faucet:** https://sepoliafaucet.com

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Not audited for mainnet deployment.

---

**Built with ❤️ using Solidity and React**
