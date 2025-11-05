# Vault of Time - Complete Deployment Guide

## Project Overview

Vault of Time (时间胶囊) is a decentralized application for time-locked assets and encrypted information on blockchain.

### Features
- 🔒 **Standard Time Capsules** - Lock ETH/NFTs with time-based unlock
- 📜 **Multi-Signature Wills** - Estate planning with M-of-N trustee approval
- 📊 **Token Vesting** - Employee compensation with scheduled token release

---

## Prerequisites

- Node.js (v16+)
- MetaMask browser extension
- Sepolia testnet account with test ETH
- [Get Sepolia ETH from faucet](https://sepoliafaucet.com/)

---

## Part 1: Smart Contract Deployment

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env` file in project root:

```bash
# Sepolia RPC URL (from Alchemy or Infura)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY

# Your MetaMask private key (IMPORTANT: add 0x prefix)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Optional: Etherscan API key for verification
# ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**⚠️ Security Warning:**
- Never commit `.env` to version control
- Never share your private key
- Use testnet accounts for development

### Step 3: Compile Contract

```bash
npx hardhat compile
```

### Step 4: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected Output:**
```
✅ VaultOfTime deployed to: 0xYOUR_CONTRACT_ADDRESS
```

**Save this address!** You'll need it for frontend configuration.

### Step 5: Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

---

## Part 2: Frontend Setup

### Step 1: Navigate to Frontend

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Update Contract Address

The contract address is auto-updated in `src/contractConfig.js` after deployment.

If needed, manually update:
```javascript
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### Step 4: Start Development Server

```bash
npm start
```

Application opens at `http://localhost:3000`

---

## Part 3: Usage Examples

### 🔒 Standard Time Capsule

Lock assets for future unlock:

1. Connect MetaMask wallet
2. Click "Time Capsule" tab
3. Fill in:
   - Recipient address
   - Secret message (will be encrypted)
   - Unlock date/time
   - ETH amount (optional)
4. Click "Seal Capsule"
5. Confirm transaction in MetaMask
6. Save the Capsule ID from success message

### 📜 Multi-Signature Will (Estate Planning)

**Scenario:** Leave assets to heir with trusted friends as executors

**Example:**
- Beneficiary: Son's address
- Trustees: 3 trusted friends
- Required approvals: 2 of 3
- Auto-unlock: 100 years (far future)
- Lock: 1 ETH

**Process:**
1. Owner seals will with ETH
2. When owner passes away, 2 friends approve unlock
3. Son receives assets immediately

**Steps:**
1. Click "Multi-Sig Will" tab
2. Enter beneficiary address
3. Add trustee addresses (click "+ Add Trustee")
4. Set required approvals (e.g., 2 out of 3)
5. Set far-future unlock date as fallback
6. Click "Create Multi-Sig Will"

**Trustee Approval:**
1. Trustee navigates to "View Capsule"
2. Enters capsule ID
3. Clicks "Approve Unlock" (only if they're a trustee)
4. Once enough approvals, beneficiary can unseal

### 📊 Token Vesting (Employee Compensation)

**Scenario:** Grant employee 10,000 tokens over 4 years, 25% each year

**Steps:**
1. Click "Token Vesting" tab
2. Enter employee address
3. Enter token contract address (ERC20)
4. Add vesting periods:
   - Year 1: 2,500 tokens @ 2026-01-01
   - Year 2: 2,500 tokens @ 2027-01-01
   - Year 3: 2,500 tokens @ 2028-01-01
   - Year 4: 2,500 tokens @ 2029-01-01
5. Click "Create Vesting Schedule"
6. Approve token transfer in MetaMask (2 transactions)

**Employee Claims Tokens:**
1. Navigate to "View Capsule"
2. Enter capsule ID
3. Click "Release Vested Tokens"
4. Tokens automatically transfer to employee

---

## Part 4: Network Configuration

### MetaMask Setup

The app automatically detects if you're on the wrong network.

**If you see "⚠️ Network: Ethereum Mainnet":**
1. Click "Switch to Sepolia" button
2. Confirm in MetaMask
3. If Sepolia network not found, it will be added automatically

**Manual Sepolia Setup:**
- Network Name: Sepolia Testnet
- RPC URL: `https://rpc.sepolia.org`
- Chain ID: `11155111`
- Currency Symbol: `ETH`
- Block Explorer: `https://sepolia.etherscan.io`

---

## Project Structure

```
CEG4032/
├── .env                          # Environment variables (DO NOT COMMIT)
├── hardhat.config.js             # Hardhat configuration
├── DEPLOYMENT.md                 # This file
├── README.md                     # Project overview
├── contracts/
│   └── ChronosVault.sol         # Main smart contract
├── scripts/
│   └── deploy.js                # Deployment script
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js               # Main application with tabs
        ├── index.js             # Entry point
        ├── index.css            # Global styles
        ├── contractConfig.js    # Contract address & ABI
        ├── components/
        │   ├── ConnectWallet.js     # Wallet connection + network detection
        │   ├── SealCapsule.js       # Standard capsule creation
        │   ├── SealMultiSigWill.js  # Multi-sig will creation
        │   ├── SealVesting.js       # Token vesting creation
        │   ├── ViewCapsule.js       # Capsule viewing/unsealing
        │   └── Notification.js      # Event notifications
        └── utils/
            └── encryption.js    # Encryption utilities
```

---

## Security Considerations

### Private Keys
- ✅ Use testnet accounts for development
- ✅ Keep `.env` in `.gitignore`
- ❌ Never commit private keys to Git
- ❌ Never use mainnet keys for testing

### Smart Contract
- ✅ Test thoroughly on Sepolia first
- ✅ Verify trustee addresses in multi-sig wills
- ✅ Test token approvals before vesting
- ❌ Don't deploy to mainnet without audit

### Decryption Keys
- Keys stored on-chain but only accessible after unsealing
- Messages encrypted client-side before submission
- Recipients can view keys after unlock time

---

## Troubleshooting

### Compilation Errors

**Problem:** "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

**Problem:** "Invalid private key"
- Ensure private key has `0x` prefix in `.env`

### Deployment Errors

**Problem:** "Insufficient funds"
- Get Sepolia ETH from [faucet](https://sepoliafaucet.com/)

**Problem:** "Network not configured"
- Check `SEPOLIA_RPC_URL` in `.env`
- Verify RPC URL is accessible

### MetaMask Issues

**Problem:** Wrong network
- Click "Switch to Sepolia" in app
- Or manually switch in MetaMask

**Problem:** Transaction fails
- Ensure enough ETH for gas
- Check unlock timestamp is in future
- Verify recipient address format

### Token Vesting Issues

**Problem:** "Token transfer failed"
- Ensure you have enough tokens
- Token contract must be ERC20 compliant
- Approve tokens before creating vesting

**Problem:** "No tokens to release"
- Check if unlock time has passed
- Verify you're the recipient

---

## Testing Checklist

Before mainnet deployment:

- [ ] Deploy contract to Sepolia
- [ ] Create standard time capsule
- [ ] Unseal capsule after time passes
- [ ] Create multi-sig will
- [ ] Test trustee approval
- [ ] Create token vesting schedule
- [ ] Test token release
- [ ] Verify all events emitted correctly
- [ ] Test on different browsers
- [ ] Get smart contract audit (for mainnet)

---

## Gas Costs Estimate (Sepolia)

| Operation | Estimated Gas | Notes |
|-----------|--------------|-------|
| Deploy Contract | ~3,500,000 | One-time cost |
| Seal Standard Capsule | ~150,000 | With ETH |
| Seal Multi-Sig Will | ~300,000 | 3 trustees |
| Seal Vesting Schedule | ~400,000 | 4 periods |
| Unseal Capsule | ~80,000 | With ETH transfer |
| Approve Multi-Sig | ~50,000 | Per trustee |
| Release Vested Tokens | ~100,000 | Per claim |

*Gas costs on mainnet will vary based on network congestion*

---

## Real-World Use Cases

### 1. Digital Estate Planning
Lock access credentials, wallet seeds, or important documents. Designate family members as trustees who can unlock in emergency.

### 2. Employee Equity Compensation
Lock company tokens with vesting schedule. Employees automatically receive portions over time without manual distribution.

### 3. Trust Fund for Children
Parents lock assets until child reaches certain age. Multiple family members serve as trustees for early access if needed.

### 4. Business Partnership
Lock company shares with time-based unlock. Partners can't access until vesting period completes.

### 5. Charitable Giving
Lock donation for future release to charity. Ensures funds available at specific time.

---

## Support & Resources

### Documentation
- Ethereum: https://ethereum.org/developers
- Hardhat: https://hardhat.org/docs
- OpenZeppelin: https://docs.openzeppelin.com/contracts
- ethers.js: https://docs.ethers.org/
- React: https://react.dev/

### Tools
- Sepolia Faucet: https://sepoliafaucet.com/
- Sepolia Explorer: https://sepolia.etherscan.io/
- MetaMask: https://metamask.io/

### Getting Test ETH
1. Visit https://sepoliafaucet.com/
2. Sign in with Alchemy account
3. Enter your wallet address
4. Receive 0.5 ETH every 24 hours

---

## License

MIT License - Free to use and modify for your projects

---

## Current Deployment

**Contract Address:** `0x3c7259B276f94b157e2992BfFFDC1F58821626b5`
**Network:** Sepolia Testnet
**Deployed:** October 4, 2025

View on Etherscan: https://sepolia.etherscan.io/address/0x3c7259B276f94b157e2992BfFFDC1F58821626b5
