# ⚡ Quick Start Guide

Get Chronos Vault running in 5 minutes!

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MetaMask](https://metamask.io/) browser extension
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

## 🚀 Setup

### 1️⃣ Clone & Install

```bash
git clone <your-repo-url>
cd CEG4032
npm install
```

### 2️⃣ Configure Environment

Create `.env` file:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

> ⚠️ **Important:** Add `0x` prefix to your private key!

### 3️⃣ Deploy Contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

**Copy the contract address from output!**

### 4️⃣ Start Frontend

```bash
cd frontend
npm install
npm start
```

**Open:** http://localhost:3000

### 5️⃣ Connect Wallet

1. Click "Connect Wallet"
2. If wrong network, click "Switch to Sepolia"
3. Approve in MetaMask

## 🎯 Try It Out

### Create Your First Time Capsule

1. Click **Time Capsule** tab
2. Enter recipient address
3. Write secret message
4. Set unlock date (e.g., 1 hour from now)
5. Click **Seal Capsule**
6. Save the Capsule ID!

### View & Unseal

1. Click **View Capsule** tab
2. Enter your Capsule ID
3. Wait for unlock time
4. Click **Unseal Capsule**
5. View decrypted message!

## 📚 Next Steps

- Read full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Try multi-sig wills
- Test token vesting
- Deploy your own contract

## ❓ Troubleshooting

**Problem:** Compilation fails
```bash
npm install dotenv
```

**Problem:** Wrong network
- Click "Switch to Sepolia" in app

**Problem:** No test ETH
- Visit https://sepoliafaucet.com/

## 🔗 Useful Links

- **Current Contract:** [0x3c7259B276f94b157e2992BfFFDC1F58821626b5](https://sepolia.etherscan.io/address/0x3c7259B276f94b157e2992BfFFDC1F58821626b5)
- **Network:** Sepolia Testnet
- **Faucet:** https://sepoliafaucet.com/
- **Explorer:** https://sepolia.etherscan.io/

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
