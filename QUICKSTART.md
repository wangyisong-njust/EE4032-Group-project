# ⚡ Quick Start Guide - Chronos Vault

Get up and running with Chronos Vault in 10 minutes! This guide covers all three features: Time Capsules, Multi-Sig Governance, and Token Vesting.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- **[Node.js](https://nodejs.org/)** v16 or higher
- **[MetaMask](https://metamask.io/)** browser extension installed
- **Sepolia testnet ETH** - [Get from faucet](https://sepoliafaucet.com/)
- **Basic understanding** of Ethereum and smart contracts

---

## 🚀 Installation & Setup

### 1️⃣ Clone & Install Dependencies

```bash
git clone https://github.com/wangyisong-njust/EE4032-Group-project
cd CEG4032
npm install
```

### 2️⃣ Configure Environment

Create a `.env` file in the root directory:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
```

> ⚠️ **Important Notes:**
> - Always add `0x` prefix to your private key
> - Never share your private key or commit `.env` to version control
> - Use a dedicated deployer account, not your main wallet

**Get Infura API Key:**
1. Visit [infura.io](https://infura.io/)
2. Create free account
3. Create new project
4. Copy the Sepolia endpoint URL

### 3️⃣ Deploy Smart Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected Output:**
```
🚀 Deploying ChronosVault...
✅ ChronosVault deployed to: 0x3C8e9C6322e3501c65a289b360eA931c33B23970
```

**Save this contract address!** You'll need it for the frontend.

### 4️⃣ Update Frontend Configuration

The contract address should already be updated in `frontend/src/contractConfig.js`. Verify it matches your deployed address:

```javascript
export const CONTRACT_ADDRESS = "0x3C8e9C6322e3501c65a289b360eA931c33B23970";
```

### 5️⃣ Start Frontend Application

```bash
cd frontend
npm install
npm start
```

**Open:** http://localhost:3000

### 6️⃣ Connect Your Wallet

1. Click **"Connect Wallet"** button
2. If prompted for wrong network, click **"Switch to Sepolia"**
3. Approve the network switch in MetaMask
4. Your address will appear in the top right

---

## 🎯 Feature Guides

## Feature 1: 🔒 Time Capsules - Personal Use

**Perfect for:** Individuals, digital wills, scheduled payments, escrow contracts

### Create a Time Capsule

1. **Navigate** to the **Time Capsule** tab

2. **Get Recipient's Public Key:**
   - Have the recipient visit your app
   - They click on **"View Capsules"** tab
   - Click **"Export My Public Key"**
   - Sign the message in MetaMask
   - Copy the displayed public key (128-character hex string)
   - Send it to you securely

3. **Fill Out the Form:**
   ```
   Recipient Address: 0xRecipientAddress
   Recipient's Public Key: 8c23b0d123df639c... (128 hex chars)
   Unlock Date & Time: Select future date
   Message Content: "This is my will: I leave..."
   ETH Amount: 0.1 (optional inheritance amount)
   ```

4. **Click** **"🔐 Seal Capsule"**

5. **Approve** the transaction in MetaMask

6. **Save** the Capsule ID from success message!

### View & Decrypt Your Capsule

1. **Navigate** to **"View Capsules"** tab

2. **Enter** your Capsule ID

3. **Click** **"🔎 Query"** to load capsule details

4. **Wait** for the unlock time to pass

5. **Click** **"🔓 Unseal Capsule"** (transfers ETH if any)

6. **Click** **"🔐 Decrypt Message"** to reveal the encrypted message

**✅ Use Cases:**
- Digital wills with inheritance instructions
- Trust funds unlocking on child's 18th birthday
- Scheduled rent or mortgage payments
- Freelance project escrow with milestone releases

---

## Feature 2: 📜 Multi-Sig Governance - Corporate Use

**Perfect for:** Companies, boards of directors, investors, DAOs

### Create Multi-Sig Governance Contract

1. **Navigate** to **Multi-Signature Governance** tab

2. **Get Recipient's Public Key** (same as Feature 1)

3. **Fill Out the Form:**
   ```
   Recipient Address: 0xCompanyTreasury
   Recipient's Public Key: [128 hex chars]
   Scheduled Release Date: 2026-01-01 (far future or quarterly)
   Message / Details: "Q4 2025 dividend distribution - Board resolution #42"
   ETH Amount: 10 (dividend amount)
   ```

4. **Add Approvers / Signers:**
   ```
   Approver 1: 0xBoardMember1
   Approver 2: 0xBoardMember2
   Approver 3: 0xBoardMember3
   ```
   - Click **"➕ Add Approver"** for more

5. **Set Required Approvals:**
   ```
   Required Approvals (M-of-N): 2
   ```
   - This creates a 2-of-3 multisig
   - Requires 2 board members to approve

6. **Click** **"📜 Create Multi-Sig Governance"**

### Approve Early Unlock (For Trustees)

1. **Navigate** to **"View Capsules"** tab
2. **Query** the capsule ID
3. **Click** **"Approve Unlock"** (if you're a trustee)
4. Once enough approvals are reached, funds unlock automatically

**✅ Use Cases:**
- Board voting on early dividend distribution
- VC partners approving capital withdrawal (2-of-3)
- Shareholder approval for quarterly profit release
- Emergency fund access requiring supermajority

---

## Feature 3: 📊 Token Vesting - Employee Equity

**Perfect for:** Startups, employee compensation, advisor grants

### Prerequisites for Vesting

You need an **ERC20 token contract** on Sepolia. For testing:

1. Deploy a test ERC20 token, or
2. Use an existing testnet token

### Create Vesting Schedule

1. **Navigate** to **Token Vesting - Employee Equity** tab

2. **Get Employee's Public Key** (same process as Feature 1)

3. **Fill Out the Form:**
   ```
   Employee / Recipient Address: 0xEmployeeAddress
   Recipient's Public Key: [128 hex chars]
   Employment Terms: "Employee stock options - 4 year vest with 1 year cliff"
   Token Contract Address: 0xYourERC20TokenAddress
   ```

4. **Define Vesting Schedule:**

   **Example: 4-Year Vesting (10,000 tokens total)**
   ```
   Period 1: Date: 2026-01-01, Amount: 2500
   Period 2: Date: 2027-01-01, Amount: 2500
   Period 3: Date: 2028-01-01, Amount: 2500
   Period 4: Date: 2029-01-01, Amount: 2500
   ```
   - Click **"➕ Add Vesting Period"** to add more

5. **Review** Total Tokens: 10,000

6. **Click** **"📊 Lock Tokens & Create Vesting"**

7. **Approve** two transactions:
   - Token approval (allows contract to transfer tokens)
   - Vesting schedule creation

### Claim Vested Tokens (For Employees)

1. **Navigate** to **"View Capsules"** tab
2. **Enter** your vesting capsule ID
3. **Click** **"Claim Vested Tokens"**
4. **Approve** transaction to receive your tokens

**✅ Use Cases:**
- 4-year employee stock options with quarterly unlock
- Advisor compensation with 6-month cliff
- Contractor payment schedules
- Protection from company bankruptcy (tokens locked in contract)

**🔒 Key Benefit:** Tokens are locked in the smart contract, not company treasury. Even if the company goes bankrupt, employees can still claim their vested tokens on schedule!

---

## 🔐 Understanding Encryption

### Public Key Export

When someone needs to receive an encrypted capsule:

1. They visit **"View Capsules"** page
2. Click **"📤 Export My Public Key"**
3. Sign a message in MetaMask (proves they own the address)
4. Copy the 128-character public key
5. Share it with the sender

**Security Notes:**
- Public keys are safe to share (they're public!)
- Only the holder of the matching private key can decrypt
- Messages are encrypted using ECIES (Elliptic Curve Integrated Encryption)

---

## 📊 Example Scenarios

### Scenario 1: Personal Digital Will

**Alice** wants to leave inheritance for **Bob**:

```
1. Bob exports his public key and sends to Alice
2. Alice creates Time Capsule:
   - Recipient: Bob's address
   - Public Key: Bob's public key
   - Message: "Will and testament details..."
   - ETH: 5 ETH inheritance
   - Unlock: 50 years in future or earlier with trustee approval
3. Alice saves Capsule ID and gives to trusted family member
4. When time comes, Bob can unseal and decrypt
```

### Scenario 2: Board Dividend Approval

**TechCorp** has 5 board members, needs 3 approvals for dividend:

```
1. CFO creates Multi-Sig Governance:
   - Recipient: Company treasury
   - Message: "Q4 dividend - $1M distribution"
   - ETH: 100 ETH
   - Approvers: 5 board member addresses
   - Required: 3 approvals
2. Board members vote by approving the capsule
3. Once 3 approve, funds unlock automatically
4. CFO can distribute to shareholders
```

### Scenario 3: Employee Stock Options

**Startup** grants employee 40,000 tokens over 4 years:

```
1. Employee exports public key
2. HR creates Vesting Schedule:
   - Employee address and public key
   - Terms: "Full-time engineer - 4yr vest"
   - Token: Company ERC20 token
   - Schedule: 10,000 per year for 4 years
3. Tokens locked in smart contract immediately
4. Employee can claim 10,000 tokens each year
5. Even if company fails, tokens are safe in contract
```

---

## 🐛 Troubleshooting

### Contract Deployment Issues

**Problem:** `Error: insufficient funds`
```bash
# Get testnet ETH from faucet
https://sepoliafaucet.com/
```

**Problem:** `Error: cannot estimate gas`
```bash
# Check .env configuration
# Ensure SEPOLIA_RPC_URL is correct
# Try different RPC endpoint
```

### Frontend Issues

**Problem:** Wrong network
```
Solution: Click "Switch to Sepolia" button in the app
```

**Problem:** Cannot connect wallet
```
1. Ensure MetaMask is installed
2. Unlock MetaMask
3. Refresh the page
4. Try again
```

**Problem:** Transaction fails
```
1. Check you have enough Sepolia ETH for gas
2. Increase gas limit if needed
3. Verify contract address is correct
```

### Encryption Issues

**Problem:** "Failed to encrypt message"
```
1. Verify recipient public key is exactly 128 hex characters
2. Ensure no extra spaces or line breaks
3. Ask recipient to re-export their public key
```

**Problem:** "Failed to decrypt message"
```
1. Ensure you're connected with the recipient wallet
2. Capsule must be unsealed first
3. Check you have the correct Capsule ID
```

---

## 📚 Additional Resources

### Documentation

- **[README.md](./README.md)** - Full project overview and features
- **[TEST_GUIDE.md](./TEST_GUIDE.md)** - Encryption testing guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Advanced deployment guide

### Blockchain Explorers

- **Sepolia Etherscan:** https://sepolia.etherscan.io/
- **Current Contract:** [0x3C8e9C6322e3501c65a289b360eA931c33B23970](https://sepolia.etherscan.io/address/0x3C8e9C6322e3501c65a289b360eA931c33B23970)

### Useful Links

- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Infura:** https://infura.io/
- **MetaMask:** https://metamask.io/
- **Ethereum Docs:** https://ethereum.org/developers

---

## 🎓 Learning More

### Smart Contract Functions

```solidity
// Time Capsules
sealCapsule(recipient, encryptedData, unlockTimestamp)
unsealCapsule(capsuleId)

// Multi-Sig Governance
sealMultiSigWill(recipient, encryptedData, timestamp, trustees, requiredApprovals)
approveMultiSigUnlock(capsuleId)

// Token Vesting
sealVestingSchedule(recipient, encryptedData, tokenAddress, timestamps, amounts)
releaseVestedTokens(capsuleId)
```

### Key Concepts

- **Time Locks:** Funds locked until specific timestamp
- **Multi-Signature:** Requires M-of-N approvals
- **Token Vesting:** Gradual token release over time
- **ECIES Encryption:** Public-key encryption for messages
- **Smart Contracts:** Self-executing code on blockchain

---

## ✅ Next Steps

Now that you're set up, try:

1. ✅ Create your first time capsule
2. ✅ Test the multi-sig approval flow with friends
3. ✅ Deploy a test ERC20 token and create vesting schedule
4. ✅ Read through the smart contract code
5. ✅ Customize the frontend for your needs

---

## 🔒 Security Reminders

- ⚠️ This is **testnet only** - not for mainnet use
- ⚠️ Not audited - professional audit required before production
- ⚠️ Never share private keys
- ⚠️ Test thoroughly before using real funds
- ⚠️ Keep Capsule IDs safe - they're needed to access capsules

---

## 💬 Support & Contribution

- **Issues:** Report bugs on [GitHub Issues](https://github.com/wangyisong-njust/EE4032-Group-project/issues)
- **Contribute:** Submit pull requests
- **Questions:** Check documentation first

---

**Happy time-locking! ⏰🔒**

Built with Solidity, React, and Ethereum. Empowering individuals, companies, and employees with trustless asset management.
