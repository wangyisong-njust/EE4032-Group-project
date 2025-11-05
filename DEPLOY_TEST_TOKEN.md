# 部署测试 ERC20 代币（用于 Token Vesting 功能）

## 问题
Token Vesting 功能需要一个 ERC20 代币合约地址，但如果你输入的是你的钱包地址，会出现错误：
```
External transactions to internal accounts cannot include data
```

## 解决方案：部署测试代币

### 方法 1：使用 Hardhat 部署（推荐）

1. **编译合约**
```bash
npx hardhat compile
```

2. **部署测试代币**
```bash
npx hardhat run scripts/deploy-test-token.js --network localhost
```

3. **复制输出的代币合约地址**
```
TestToken deployed to: 0x1234567890123456789012345678901234567890
```

4. **在 Token Vesting 页面使用这个地址**

### 方法 2：使用 Remix IDE（适合初学者）

1. 打开 [Remix IDE](https://remix.ethereum.org/)

2. 创建新文件 `TestToken.sol`，复制以下内容：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Company Token", "TCT") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
```

3. 编译合约（Solidity 编译器版本：0.8.x）

4. 部署到你的本地网络或测试网
   - 选择 "Injected Provider - MetaMask"
   - 点击 "Deploy"
   - 确认 MetaMask 交易

5. 复制部署的合约地址

6. 在 Token Vesting 页面的 "Token Contract Address" 字段使用这个地址

## 重要提示

⚠️ **Token Contract Address 需要填写代币合约地址，不是你的钱包地址！**

- ❌ 错误示例：`0xb7e50b3dff15a49fb5c18ae8a5111cdac8213943`（你的钱包）
- ✅ 正确示例：`0x5FbDB2315678afecb367f032d93F642f64180aa3`（代币合约）

## 测试代币特性

我们的 TestToken 有以下特性：
- 名称：Test Company Token
- 符号：TCT
- 初始供应量：1,000,000 TCT（给部署者）
- 任何人都可以 mint 新代币（用于测试）

## 使用流程

1. 部署 TestToken 合约
2. 获取合约地址（例如：0x5FbDB...）
3. 在 Token Vesting 页面填写这个合约地址
4. 系统会自动调用 `approve()` 给 ChronosVault 合约
5. 然后创建 vesting schedule
6. 代币会被锁定在 ChronosVault 合约中
7. 受益人在解锁日期后可以 claim 代币
