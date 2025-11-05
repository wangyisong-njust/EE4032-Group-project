# 解密功能调试指南

## 已添加的改进

### 1. 详细的调试日志
现在当您尝试加密或解密消息时，浏览器控制台会显示详细的调试信息：

**加密时的日志：**
- 要加密的消息内容
- 接收者的公钥
- 加密后的数据结构（version, nonce, ephemPublicKey, ciphertext）
- JSON字符串的长度和预览

**解密时的日志：**
- 当前连接的账户地址
- 胶囊的接收者地址
- 地址是否匹配
- 加密数据的长度和格式
- 转换后的UTF-8字符串
- 解析后的JSON结构

### 2. UI改进
在"View Capsule"页面现在会显示：
- 当前连接的账户地址
- 是否是胶囊的接收者
- 如果不是接收者，会显示警告提示

## 测试步骤

### 步骤1：创建新的测试胶囊

**重要：** 旧的胶囊（用旧加密系统创建的）无法解密。您需要创建新的测试胶囊。

1. 打开两个MetaMask账户（或使用两个浏览器）
   - Account A：发送者
   - Account B：接收者

2. 在Account B上导出公钥：
   - 连接Account B到dApp
   - 进入"View Capsules"页面
   - 点击"Export My Public Key"
   - 复制显示的公钥

3. 在Account A上创建胶囊：
   - 切换到Account A
   - 进入"Seal Capsule"页面
   - 填写表单：
     - **Recipient Address**: Account B的地址
     - **Recipient's Public Key**: 刚才复制的Account B的公钥
     - **Message**: 测试消息（例如："This is a test message"）
     - **Unlock Date**: 选择当前时间之后的时间
     - **ETH Amount**: 可选，比如0.001 ETH
   - **打开浏览器控制台**（F12）查看加密日志
   - 点击"Seal Capsule"
   - 等待交易确认，记下Capsule ID

### 步骤2：Unseal胶囊

1. 切换到Account B（接收者）
2. 进入"View Capsule"页面
3. 输入Capsule ID并点击"Query"
4. 检查UI显示：
   - 应该显示"✅ You are the recipient of this capsule"
   - 如果显示警告，说明账户不匹配，需要切换账户
5. 等到unlock时间过后
6. 点击"Unseal Capsule"
7. 等待交易确认

### 步骤3：解密消息

1. 确保仍然连接Account B（接收者）
2. **打开浏览器控制台**（F12 → Console标签）
3. 点击"Decrypt Message"按钮
4. **在控制台查看日志：**

```
=== DECRYPT CAPSULE DEBUG ===
Current connected account: 0x...
Capsule recipient: 0x...
Addresses match: true
Encrypted data length: ...
Encrypted data starts with: 0x...

=== DECRYPTION DEBUG ===
Recipient address: 0x...
Raw encrypted data type: string
Raw encrypted data (first 200 chars): 0x7b22...
Converted to UTF-8 string: {"version":"x25519-xsalsa20-poly1305",...
Parsed JSON structure: {version: "x25519-xsalsa20-poly1305", hasNonce: true, hasEphemPublicKey: true, hasCiphertext: true}
Calling eth_decrypt with address: 0x...
```

5. MetaMask会弹出解密请求窗口
6. **检查弹窗中的信息**：
   - 应该显示完整的加密数据
   - "Decrypt"按钮应该是**可点击**的

## 常见问题排查

### 问题1：Decrypt按钮仍然不可点击

**可能原因：**
1. **账户不匹配** - 检查控制台日志中的"Addresses match"，应该是true
2. **公钥错误** - 创建胶囊时使用的公钥不是当前解密账户的
3. **数据格式错误** - 检查控制台日志中的"Parsed JSON structure"，应该有version, nonce, ephemPublicKey, ciphertext

**解决方法：**
- 确保用正确的账户连接（接收者账户）
- 重新创建胶囊，确保使用接收者的公钥
- 截图控制台日志发送给我分析

### 问题2：JSON解析失败

如果看到"Failed to parse as JSON"错误：

**原因：** 从合约读取的数据可能被截断或格式错误

**解决方法：**
1. 检查合约的bytes类型是否正确存储
2. 查看完整的hex字符串长度
3. 截图错误信息

### 问题3：地址不匹配

如果看到"Only the recipient can decrypt this message"错误：

**原因：** 当前连接的账户不是胶囊的接收者

**解决方法：**
1. 在MetaMask中切换到接收者账户
2. 刷新页面重新连接
3. 检查UI上的账户验证信息

## 获取帮助

如果解密仍然失败，请提供以下信息：

1. **完整的浏览器控制台日志**（从"=== ENCRYPT"开始到错误结束）
2. **MetaMask弹窗的截图**
3. **Capsule ID**
4. **发送者和接收者的地址**（前8位和后6位即可）

例如：
```
Capsule ID: 5
Sender: 0xB7e5...3943
Recipient: 0x1234...5678
```

## 技术细节

### 加密流程
1. 使用`eth_getEncryptionPublicKey`从接收者地址获取公钥
2. 使用`@metamask/eth-sig-util`的`encrypt`方法加密消息
3. 加密结果是JSON对象：`{version, nonce, ephemPublicKey, ciphertext}`
4. JSON对象转为字符串后发送到合约
5. 合约将字符串存储为bytes

### 解密流程
1. 从合约读取bytes数据，ethers.js返回hex字符串（0x...）
2. 将hex字符串转换为UTF-8字符串
3. UTF-8字符串应该是JSON格式
4. 将JSON字符串传递给MetaMask的`eth_decrypt`
5. MetaMask使用接收者的私钥解密

### 数据格式验证

**正确的加密数据格式应该像这样：**
```json
{
  "version": "x25519-xsalsa20-poly1305",
  "nonce": "base64编码的nonce",
  "ephemPublicKey": "base64编码的临时公钥",
  "ciphertext": "base64编码的密文"
}
```

如果缺少任何字段，或者格式不正确，解密会失败。
