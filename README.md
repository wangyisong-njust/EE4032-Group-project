# ⏰ Chronos Vault

> A decentralized blockchain platform for time-locked asset management, multi-signature governance, and automated token distribution

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue.svg)](https://soliditylang.org/)
[![Network](https://img.shields.io/badge/Network-Sepolia-purple.svg)](https://sepolia.etherscan.io/)

## 🎯 Overview

**Chronos Vault** is a comprehensive decentralized application (dApp) that provides three powerful blockchain-based solutions:

1. **For Individuals and Personal Use** - Time-locked encrypted capsules for personal goals and life planning
2. **For Companies, Shareholders, and Boards of Directors** - Multi-signature governance for organizational decisions
3. **For Employee Compensation and Equity Incentive Programs** - Automated token vesting schedules

---

## 🌟 Three Core Features

### 1. 🔒 For Individuals and Personal Use

**Target Users:** Individuals, families, freelancers, personal asset management

**Use Cases:**

#### Digital Wills & Estate Planning
Create encrypted digital wills that unlock automatically at a specified time or upon certain conditions. Your loved ones can access inheritance instructions, private keys, or important documents without intermediaries.

```
Example: Lock 5 ETH with a will for your children,
unlocking on your 70th birthday or earlier with trustee approval.
```

#### Scheduled Payments & Transfers
Set up automatic time-locked payments for various purposes:
- **Rent/Mortgage**: Schedule monthly payments in advance
- **Trust Funds**: Release funds to beneficiaries at specific ages (e.g., 18th birthday)
- **Future Gifts**: Lock crypto gifts that unlock on anniversaries or special occasions

```
Example: Lock 1 ETH for your child's 18th birthday
with a personalized message to be revealed on that day.
```

#### Smart Contracts & Escrow
Implement trustless escrow for freelance work, business deals, or conditional payments:
- **Milestone Payments**: Funds unlock when project milestones are reached
- **Security Deposits**: Automatic return of deposits after contract period
- **Conditional Transfers**: Payments execute only when time conditions are met

```
Example: Lock project payment that unlocks 30 days after delivery,
with message containing project details and delivery confirmation.
```

**Key Features:**
- End-to-end encrypted messages using ECIES (Elliptic Curve Integrated Encryption Scheme)
- Lock ETH, ERC20 tokens, or NFTs
- Only recipient can decrypt messages with their private key
- Immutable on-chain storage
- Zero counterparty risk

---

### 2. 📜 For Companies, Shareholders, and Boards of Directors

**Target Users:** Companies, shareholders, board of directors, investment committees, organizational governance

**Use Cases:**

#### Board of Directors Voting
Implement decentralized corporate governance where major decisions require approval from multiple board members:

```
Example: Company has 5 board members. Early dividend distribution
requires 3 signatures (60% approval) before funds are released.
```

#### Investor Rights & Early Liquidity
Protect investor interests with multi-party approval for early exit scenarios:
- **Early Dividend Distribution**: Shareholders vote on releasing profits before scheduled date
- **Emergency Fund Access**: Access company reserves only with majority approval
- **Capital Distribution**: Require consensus before major fund allocations

```
Example: Venture capital fund with 3 partners. Any withdrawal of
locked capital requires 2 out of 3 partners to approve (2-of-3 multisig).
```

#### Shareholder Agreements
Enforce shareholder agreements on-chain with built-in governance:
- **Veto Rights**: Minority shareholders can block certain actions
- **Supermajority Decisions**: Critical decisions require 2/3 or 3/4 approval
- **Time-Locked Voting**: Combine time locks with multi-sig for gradual unlocks

```
Example: Company profits locked in smart contract. Released quarterly
only if 2 of 3 major shareholders approve the distribution.
```

**Key Features:**
- M-of-N signature scheme (e.g., 2-of-3, 3-of-5, 5-of-7)
- Time-based unlock as fallback mechanism
- Transparent on-chain voting records
- Prevent single-party fund control
- Automated execution upon reaching threshold

---

### 3. 📊 For Employee Compensation and Equity Incentive Programs

**Target Users:** Companies, employees, contractors, advisors, equity incentive programs

**Use Cases:**

#### Employee Stock Options (ESO)
Implement fair and transparent equity distribution for employees:

```
Example: Employee granted 10,000 tokens vesting over 4 years:
- Year 1: 2,500 tokens unlock
- Year 2: 2,500 tokens unlock
- Year 3: 2,500 tokens unlock
- Year 4: 2,500 tokens unlock
```

#### Founder & Advisor Vesting
Protect companies from founder departures and ensure advisor commitment:
- **Cliff Vesting**: No tokens unlock until 1-year cliff, then monthly/quarterly
- **Acceleration Clauses**: Double-trigger acceleration on acquisition
- **Reverse Vesting**: Tokens gradually become non-retrievable

```
Example: Advisor receives 50,000 tokens over 2 years:
- 6-month cliff (nothing vests)
- Then 2,083 tokens per month for 24 months
```

#### Risk Mitigation for Employees
Employees are protected from company financial distress:

**Traditional Problem:**
```
❌ Company promises equity → Company goes bankrupt → Employee loses everything
❌ Company delays payout → Employee has no recourse
❌ Company changes terms → Employee has no protection
```

**Chronos Vault Solution:**
```
✅ Tokens locked in smart contract at grant date
✅ Automatic release on schedule, no company action needed
✅ Protected from company bankruptcy or debt obligations
✅ Employees can claim directly from contract
✅ Immutable vesting terms encoded on blockchain
```

```
Example: Company locks 100,000 tokens in vesting contract for employee.
Even if company faces bankruptcy, employee can still claim vested tokens
directly from the contract on the unlock dates. No company involvement needed.
```

**Key Features:**
- Multiple unlock periods with custom schedules
- Automatic distribution - no manual intervention
- Bankruptcy-proof - tokens locked outside company control
- Employee can claim anytime after vesting date
- Transparent vesting schedules
- Gas-efficient batch claims

---

## 🔐 Security & Encryption

### Public-Key Cryptography (ECIES)

All messages use end-to-end encryption:

```
1. Recipient exports public key (safe to share publicly)
2. Sender encrypts message with recipient's public key
3. Encrypted data stored on blockchain
4. Only recipient's private key can decrypt the message
```

**Security Guarantees:**
- No one can read encrypted messages except the recipient
- Not even contract owner can decrypt messages
- Messages remain encrypted on-chain forever
- Quantum-resistant through key rotation (future upgrade)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
cd frontend && npm install
```

### 2. Configure Environment

Create `.env` file in root directory:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
```

### 3. Deploy Contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Start Frontend

```bash
cd frontend
npm start
```

Visit `http://localhost:3000` and connect MetaMask!

---

## 📖 Complete Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Step-by-step user guide
- **[TEST_GUIDE.md](./TEST_GUIDE.md)** - Encryption testing instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide

---

## 🏗️ Architecture

### Smart Contract

| Component | Details |
|-----------|---------|
| **Language** | Solidity ^0.8.28 |
| **Standards** | ERC721Receiver, ERC20 compatible |
| **Network** | Ethereum Sepolia Testnet |
| **Contract Address** | `0x3C8e9C6322e3501c65a289b360eA931c33B23970` |
| **Libraries** | OpenZeppelin Contracts |

### Frontend

| Component | Technology |
|-----------|-----------|
| **Framework** | React 18 |
| **Web3 Library** | ethers.js v6.15 |
| **Styling** | CSS3 with Glassmorphism |
| **Encryption** | eth-crypto (ECIES) |
| **Date/Time** | react-datepicker |

---

## 📋 Contract Functions

### Time Capsules

```solidity
// Create a time-locked capsule
function sealCapsule(
    address payable _recipient,
    bytes memory _encryptedData,
    uint256 _unlockTimestamp
) public payable

// Unlock after time reaches
function unsealCapsule(uint256 _capsuleId) public
```

### Multi-Signature Governance

```solidity
// Create multi-sig will
function sealMultiSigWill(
    address payable _recipient,
    bytes memory _encryptedData,
    uint256 _unlockTimestamp,
    address[] memory _trustees,
    uint256 _requiredApprovals
) public payable

// Trustee approves unlock
function approveMultiSigUnlock(uint256 _capsuleId) public
```

### Token Vesting

```solidity
// Create vesting schedule
function sealVestingSchedule(
    address payable _recipient,
    bytes memory _encryptedData,
    address _tokenAddress,
    uint256[] memory _unlockTimestamps,
    uint256[] memory _unlockAmounts
) public

// Claim vested tokens
function releaseVestedTokens(uint256 _capsuleId) public
```

---

## 🌐 Live Demo

**Contract on Sepolia Testnet:**
```
https://sepolia.etherscan.io/address/0x3C8e9C6322e3501c65a289b360eA931c33B23970
```

**Get Test ETH:**
- [Sepolia Faucet](https://sepoliafaucet.com)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Smart Contract** | Solidity, OpenZeppelin, Hardhat |
| **Frontend** | React, ethers.js, eth-crypto |
| **Network** | Ethereum (Sepolia Testnet) |
| **Wallet** | MetaMask |
| **Encryption** | ECIES (Elliptic Curve Integrated Encryption) |
| **Testing** | Hardhat, Chai |

---

## 📁 Project Structure

```
chronos-vault/
├── contracts/
│   └── ChronosVault.sol           # Main smart contract
├── scripts/
│   └── deploy.js                  # Deployment script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SealCapsule.js        # Time capsule creation
│   │   │   ├── SealMultiSigWill.js   # Multi-sig governance
│   │   │   ├── SealVesting.js        # Vesting schedule
│   │   │   └── ViewCapsule.js        # Query & decrypt
│   │   ├── utils/
│   │   │   └── encryption.js         # ECIES encryption
│   │   ├── contractConfig.js         # Contract ABI & address
│   │   └── App.js                    # Main application
│   └── package.json
├── test/                           # Contract tests
├── hardhat.config.js               # Hardhat configuration
├── QUICKSTART.md                   # User guide
├── TEST_GUIDE.md                   # Testing guide
├── DEPLOYMENT.md                   # Deployment guide
└── README.md                       # This file
```

---

## 🎓 Educational Value

This project demonstrates:

1. **Smart Contract Development**: Time-locked logic, multi-signature patterns, token handling
2. **Web3 Integration**: Frontend interaction with Ethereum using ethers.js
3. **Cryptography**: Public-key encryption (ECIES) for message privacy
4. **DApp Architecture**: Building complete decentralized applications
5. **Security Best Practices**: Access control, input validation, reentrancy protection

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🔗 Useful Links

- **Ethereum:** https://ethereum.org
- **Hardhat:** https://hardhat.org
- **OpenZeppelin:** https://openzeppelin.com
- **ethers.js:** https://docs.ethers.org
- **Sepolia Faucet:** https://sepoliafaucet.com

---

## ⚠️ Important Disclaimer

**This is experimental software deployed on testnet only.**

- ⚠️ Not audited for production use
- ⚠️ Use at your own risk
- ⚠️ Test thoroughly before mainnet deployment
- ⚠️ Recommended: Professional security audit before handling real assets

**For mainnet deployment:** Conduct comprehensive security audit and penetration testing.

---

## 🌟 Why Chronos Vault?

### For Individuals
- **Peace of Mind**: Automate inheritance and estate planning
- **No Intermediaries**: Direct control over your assets
- **Privacy**: End-to-end encrypted messages

### For Companies
- **Transparent Governance**: All decisions recorded on-chain
- **Reduced Risk**: Prevent single-point-of-failure in fund management
- **Automated Compliance**: Enforce shareholder agreements automatically

### For Employees
- **Protection**: Your equity is safe even if company fails
- **Transparency**: Know exactly when you'll receive tokens
- **Fairness**: Immutable vesting terms that cannot be changed

---

**Built with ❤️ using Solidity, React, and Ethereum**

**Empowering individuals, organizations, and employees with decentralized, trustless asset management**
