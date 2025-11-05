# 🧪 Time Capsule 公钥加密测试指南

## 测试目标
验证端到端的公钥加密流程是否正常工作

## 所需账户
- **账户 A (Bob - 接收方)**: 0xB7e50B3DfF15A49fb5C18Ae8A5111CdAc8213943
- **账户 B (Alice - 发送方)**: 你的另一个测试账户

---

## 测试步骤

### 步骤 1：Bob 导出公钥（接收方）

1. **连接账户 A (Bob)**
   - 打开浏览器，访问前端应用
   - 连接 MetaMask 账户 A（0xB7e50B3DfF15A49fb5C18Ae8A5111CdAc8213943）

2. **导出公钥**
   - 进入 "View Capsules" 页面
   - 点击 "📤 Export My Public Key" 按钮
   - MetaMask 会弹出签名请求（消息: "Get public key for encryption - 0xB7e5..."）
   - 点击"签名"确认
   - 复制显示的公钥（128位十六进制字符串）

3. **保存公钥**
   ```
   示例公钥格式（64字节 = 128个十六进制字符）:
   8c23b0d123df639cffcb9442fe6470fc27dfcf1ad24d33284c939d79eaad0d423124b2f7ce7ea1fcfa7c5108c5dfcc91ca048a836cd91fd863ac57c4ce777666
   ```

---

### 步骤 2：Alice 创建加密的 Time Capsule（发送方）

1. **切换到账户 B (Alice)**
   - 在 MetaMask 中切换账户
   - 或使用另一个浏览器配置文件

2. **创建 Capsule**
   - 进入 "Seal Capsule" 页面
   - 填写表单：
     ```
     Recipient Address: 0xB7e50B3DfF15A49fb5C18Ae8A5111CdAc8213943
     Recipient's Public Key: 8c23b0d123df639cffcb9442fe6470fc27dfcf1ad24d33284c939d79eaad0d423124b2f7ce7ea1fcfa7c5108c5dfcc91ca048a836cd91fd863ac57c4ce777666
     Unlock Date: 选择 1-2 分钟后的时间（用于测试）
     Secret Message: "Hello Bob! This is a secret message from Alice."
     ETH Amount: 0 (可选)
     ```

3. **提交交易**
   - 点击 "🔐 Seal Capsule"
   - MetaMask 弹出交易确认，点击确认
   - 等待交易完成
   - 记下 Capsule ID（例如：ID = 0）

4. **验证加密**
   - 打开浏览器控制台（F12）
   - 应该看到消息被加密成 JSON 格式：
     ```json
     {
       "iv": "...",
       "ephemPublicKey": "...",
       "ciphertext": "...",
       "mac": "..."
     }
     ```

---

### 步骤 3：等待解锁时间

- 等待设定的解锁时间到达
- 或者如果你设置的是未来很久的时间，可以用较短的时间重新测试

---

### 步骤 4：Bob 查看和解密 Capsule（接收方）

1. **切换回账户 A (Bob)**
   - 在 MetaMask 中切换回账户 A

2. **查询 Capsule**
   - 进入 "View Capsules" 页面
   - 输入 Capsule ID（步骤 2 中记录的 ID）
   - 点击 "🔎 Query"
   - 查看 Capsule 详情

3. **解封 Capsule**
   - 确认当前时间已过解锁时间
   - 点击 "🔓 Unseal Capsule" 按钮
   - MetaMask 弹出交易确认，点击确认
   - 等待交易完成

4. **解密消息**
   - Capsule 状态变为 "🔓 Unsealed"
   - 点击 "🔐 Decrypt Message" 按钮
   - MetaMask 弹出签名请求（消息: "Derive decryption key"）
   - 点击"签名"确认
   - 查看解密后的消息

5. **验证结果**
   - 应该看到原始消息："Hello Bob! This is a secret message from Alice."
   - 如果看到了原始消息，说明加密解密流程成功！

---

### 步骤 5：负面测试（安全验证）

1. **用错误账户尝试解密**
   - 使用账户 B (Alice) 或其他账户
   - 尝试查询并解密同一个 Capsule
   - 应该收到错误："Only the recipient can decrypt this message!"

2. **验证安全性**
   - 即使其他人能看到链上的加密数据
   - 只有 Bob（拥有对应私钥的人）能解密消息

---

## ✅ 成功标准

- [x] Bob 能成功导出公钥
- [x] Alice 能使用 Bob 的公钥创建加密 Capsule
- [x] 交易成功上链
- [x] Bob 能在解锁时间后解封 Capsule
- [x] Bob 能成功解密并看到原始消息
- [x] 其他人无法解密消息

---

## 🐛 常见问题排查

### 问题 1：无法导出公钥
- **症状**: 点击"Export My Public Key"没有反应
- **解决**:
  - 检查 MetaMask 是否已连接
  - 刷新页面重试
  - 检查浏览器控制台错误信息

### 问题 2：创建 Capsule 时报错 "invalid string value"
- **症状**: 提交交易时报 `INVALID_ARGUMENT` 错误
- **解决**:
  - 确保使用更新后的 ABI（已修复）
  - 刷新页面清除缓存（Ctrl+F5）

### 问题 3：解密失败
- **症状**: 点击"Decrypt Message"后显示错误
- **解决**:
  - 确认当前账户是 Capsule 的接收方
  - 确认 Capsule 已经被解封（Unsealed）
  - 检查公钥是否正确复制（无空格、无换行）

### 问题 4：无法复制公钥
- **症状**: 点击复制按钮没反应
- **解决**:
  - 手动选择公钥文本并复制
  - 检查浏览器剪贴板权限

---

## 🔒 安全提示

1. **永远不要分享私钥** - 只分享公钥
2. **公钥是公开的** - 可以安全地分享给任何人
3. **测试网测试** - 在主网部署前充分测试
4. **备份重要信息** - 保存重要 Capsule 的 ID

---

## 📊 测试结果记录

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 导出公钥 | ⬜ 未测试 / ✅ 通过 / ❌ 失败 | |
| 创建 Capsule | ⬜ 未测试 / ✅ 通过 / ❌ 失败 | Capsule ID: ___ |
| 解封 Capsule | ⬜ 未测试 / ✅ 通过 / ❌ 失败 | |
| 解密消息 | ⬜ 未测试 / ✅ 通过 / ❌ 失败 | |
| 安全验证 | ⬜ 未测试 / ✅ 通过 / ❌ 失败 | |

---

## 🎯 下一步

测试通过后，你可以：
1. 测试 Multi-Sig Will 功能
2. 测试 Token Vesting 功能
3. 测试 NFT Capsule 功能
4. 准备主网部署
