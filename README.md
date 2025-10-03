# Chronos Vault (时间胶囊) - Decentralized Time Capsule dApp

A blockchain-based application that allows users to lock assets (ETH, NFTs) and encrypted messages on-chain, accessible only by a designated recipient after a specified time.

## 🎯 项目概述

Chronos Vault 是一个去中心化应用（dApp），提供以下核心功能：
- 🔒 锁定 ETH 和加密信息，设定未来解锁时间
- 🖼️ 支持锁定 NFT（ERC721）
- 🔐 链上加密存储，只有解锁后才能查看解密密钥
- 📬 智能合约事件通知系统
- ⏰ 基于时间戳的自动解锁机制

## 📁 项目结构

```
CEG4032/
├── ChronosVault.sol           # 主智能合约
├── contracts/                 # Hardhat 合约目录
├── scripts/                   # 部署脚本
├── test/                      # 合约测试
├── hardhat.config.js          # Hardhat 配置
├── .env.example               # 环境变量模板
├── DEPLOYMENT.md              # 详细部署指南
├── README.md                  # 本文件
└── frontend/                  # React 前端应用
    ├── package.json
    ├── public/
    └── src/
        ├── App.js
        ├── contractConfig.js  # 合约地址配置
        ├── components/
        │   ├── ConnectWallet.js    # 钱包连接
        │   ├── SealCapsule.js      # 创建时间胶囊
        │   ├── ViewCapsule.js      # 查看和解锁
        │   └── Notification.js     # 事件通知
        └── utils/
            └── encryption.js       # AES 加密工具
```

## ✅ 当前进展

### 已完成
- ✅ 智能合约开发（ChronosVault.sol）
  - Capsule 数据结构
  - sealCapsule() - 锁定 ETH 和加密数据
  - sealCapsuleWithNFT() - 锁定 NFT
  - unsealCapsule() - 解锁并释放资产
  - getDecryptionKey() - 获取解密密钥
  - 事件系统（CapsuleSealed, CapsuleUnsealed）

- ✅ React 前端应用完整实现
  - MetaMask 钱包集成
  - 创建时间胶囊表单（含自动加密）
  - 查询和解锁界面
  - 自动解密功能
  - 实时事件通知系统

- ✅ Hardhat 开发环境初始化
- ✅ 项目文档（DEPLOYMENT.md）

### 进行中
- 🔄 配置测试网部署环境
- 🔄 准备部署脚本

## 📋 待完成任务

### 短期任务（本周）
1. **完成环境配置**
   - [ ] 创建 `.env` 文件（填入 Alchemy RPC URL 和私钥）
   - [ ] 从 Sepolia 水龙头获取测试 ETH
   - [ ] 安装 OpenZeppelin 合约库

2. **部署智能合约**
   - [ ] 配置 `hardhat.config.js`
   - [ ] 将 `ChronosVault.sol` 移动到 `contracts/` 目录
   - [ ] 编写部署脚本
   - [ ] 部署到 Sepolia 测试网
   - [ ] 验证合约（可选）

3. **配置前端**
   - [ ] 更新 `frontend/src/contractConfig.js` 中的合约地址
   - [ ] 安装前端依赖 `cd frontend && npm install`
   - [ ] 启动开发服务器测试

### 中期任务（下周）
4. **功能测试**
   - [ ] 测试创建时间胶囊（ETH）
   - [ ] 测试解锁功能
   - [ ] 测试 NFT 时间胶囊
   - [ ] 测试事件通知系统

5. **优化和改进**
   - [ ] 添加错误处理和用户反馈
   - [ ] 优化 UI/UX
   - [ ] 添加加载状态指示器
   - [ ] 编写单元测试

### 长期任务（未来）
6. **高级功能**
   - [ ] 批量创建时间胶囊
   - [ ] 转让胶囊所有权
   - [ ] 取消/撤销未解锁的胶囊
   - [ ] 多签名解锁功能
   - [ ] 支持 ERC20 代币

7. **生产部署**
   - [ ] 智能合约安全审计
   - [ ] 部署到以太坊主网
   - [ ] 域名和托管设置
   - [ ] 用户文档和教程

## 🚀 快速开始

### 前置要求
- Node.js v16+
- MetaMask 浏览器扩展
- Sepolia 测试网 ETH

### 安装依赖

```bash
# 安装项目依赖
npm install

# 安装 OpenZeppelin 合约
npm install @openzeppelin/contracts

# 安装前端依赖
cd frontend
npm install
```

### 配置环境变量

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入：
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
PRIVATE_KEY=your_metamask_private_key
```

### 部署合约

```bash
# 编译合约
npx hardhat compile

# 部署到 Sepolia 测试网
npx hardhat run scripts/deploy.js --network sepolia
```

### 启动前端

```bash
cd frontend
npm start
```

访问 http://localhost:3000

## 🔧 技术栈

### 区块链
- **Solidity** ^0.8.0 - 智能合约语言
- **Hardhat** - 开发环境和测试框架
- **OpenZeppelin Contracts** - 安全的合约库（ERC721）
- **Ethers.js** v6 - 以太坊交互库

### 前端
- **React.js** 18 - UI 框架
- **ethers.js** - 区块链交互
- **crypto-js** - AES 加密/解密
- **MetaMask** - Web3 钱包

## 📖 使用说明

详细的部署和使用指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 基本流程

1. **连接钱包** - 使用 MetaMask 连接
2. **创建时间胶囊** - 填写接收人地址、加密消息、解锁时间和可选的 ETH 数量
3. **查询胶囊** - 输入胶囊 ID 查看状态
4. **解锁胶囊** - 时间到达后点击解锁
5. **查看内容** - 解锁后查看解密密钥和原始消息

## 🔒 安全考虑

- ⚠️ **私钥安全**：永远不要分享或提交私钥到版本控制
- ⚠️ **测试先行**：在主网部署前充分测试
- ⚠️ **加密密钥**：解密密钥存储在链上，解锁后任何人都可见
- ⚠️ **Gas 费用**：注意以太坊主网的交易成本
- ⚠️ **智能合约审计**：生产环境使用前建议进行专业审计

## 📚 相关资源

- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin 合约](https://docs.openzeppelin.com/contracts)
- [Ethers.js 文档](https://docs.ethers.org/)
- [Solidity 文档](https://docs.soliditylang.org/)
- [React 文档](https://react.dev/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**项目作者**: CEG4032 Course Project
**最后更新**: 2025-10-03
