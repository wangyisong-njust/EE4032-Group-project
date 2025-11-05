/**
 * 从以太坊地址获取加密公钥
 * 使用 MetaMask 的 eth_getEncryptionPublicKey 方法
 */
export async function getPublicKeyFromAddress(address) {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // 使用 MetaMask 的加密公钥 API
    const publicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [address],
    });

    return publicKey;
  } catch (error) {
    console.error('Error getting public key:', error);
    if (error.code === 4001) {
      throw new Error('User denied access to encryption public key');
    }
    throw new Error('Failed to get public key. Make sure you approve the request in MetaMask.');
  }
}

/**
 * 使用接收者的公钥加密消息
 * @param {string} message - 要加密的消息
 * @param {string} recipientPublicKey - 接收者的公钥（从 eth_getEncryptionPublicKey 获取）
 * @returns {string} 加密后的消息（stringified JSON）
 */
export async function encryptMessage(message, recipientPublicKey) {
  try {
    console.log('=== ENCRYPTION DEBUG ===');
    console.log('Message to encrypt:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
    console.log('Recipient public key:', recipientPublicKey);

    // 使用 TweetNaCl 进行加密（与 MetaMask 的 x25519-xsalsa20-poly1305 兼容）
    const nacl = await import('tweetnacl');
    const naclUtil = await import('tweetnacl-util');

    // 将 base64 公钥转换为 Uint8Array
    const recipientPublicKeyBytes = naclUtil.decodeBase64(recipientPublicKey);

    // 生成临时密钥对
    const ephemeralKeyPair = nacl.box.keyPair();

    // 使用消息创建 nonce
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    // 将消息转换为字节
    const messageBytes = naclUtil.decodeUTF8(message);

    // 使用 box 加密
    const encryptedBytes = nacl.box(
      messageBytes,
      nonce,
      recipientPublicKeyBytes,
      ephemeralKeyPair.secretKey
    );

    // 构造与 MetaMask 兼容的加密数据格式
    const encryptedData = {
      version: 'x25519-xsalsa20-poly1305',
      nonce: naclUtil.encodeBase64(nonce),
      ephemPublicKey: naclUtil.encodeBase64(ephemeralKeyPair.publicKey),
      ciphertext: naclUtil.encodeBase64(encryptedBytes),
    };

    console.log('Encrypted data structure:', {
      version: encryptedData.version,
      hasNonce: !!encryptedData.nonce,
      hasEphemPublicKey: !!encryptedData.ephemPublicKey,
      hasCiphertext: !!encryptedData.ciphertext,
    });

    // 返回 stringified JSON
    const jsonString = JSON.stringify(encryptedData);
    console.log('JSON string length:', jsonString.length);
    console.log('JSON string preview:', jsonString.substring(0, 100) + '...');

    return jsonString;
  } catch (error) {
    console.error('Error encrypting message:', error);
    console.error('Error stack:', error.stack);
    throw new Error('Failed to encrypt message: ' + error.message);
  }
}

/**
 * 使用自己的私钥解密消息
 * @param {string} encryptedData - 加密的消息（hex string 或 stringified JSON）
 * @param {string} recipientAddress - 接收者地址
 * @returns {string} 解密后的消息
 */
export async function decryptMessage(encryptedData, recipientAddress) {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    console.log('=== DECRYPTION DEBUG ===');
    console.log('Recipient address:', recipientAddress);
    console.log('Raw encrypted data type:', typeof encryptedData);
    console.log('Raw encrypted data (first 200 chars):', encryptedData.substring(0, 200));

    // 如果 encryptedData 是 hex string (从合约读取)，需要先转换为 UTF-8 字符串
    let dataToDecrypt = encryptedData;

    if (typeof encryptedData === 'string' && encryptedData.startsWith('0x')) {
      // 从合约读取的是 hex string，需要转换为 UTF-8 字符串
      // 移除 0x 前缀
      const hexString = encryptedData.slice(2);

      // 将 hex 转换为字节数组
      const bytes = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

      // 将字节数组转换为 UTF-8 字符串
      const decoder = new TextDecoder('utf-8');
      dataToDecrypt = decoder.decode(bytes);

      console.log('Converted to UTF-8 string:', dataToDecrypt.substring(0, 200));
    }

    // 验证 JSON 格式
    let parsedData;
    try {
      parsedData = JSON.parse(dataToDecrypt);
      console.log('Parsed JSON structure:', {
        version: parsedData.version,
        hasNonce: !!parsedData.nonce,
        hasEphemPublicKey: !!parsedData.ephemPublicKey,
        hasCiphertext: !!parsedData.ciphertext,
      });

      // 验证必需字段
      if (!parsedData.version || !parsedData.nonce || !parsedData.ephemPublicKey || !parsedData.ciphertext) {
        throw new Error('Missing required fields in encrypted data');
      }

      if (parsedData.version !== 'x25519-xsalsa20-poly1305') {
        throw new Error('Unsupported encryption version: ' + parsedData.version);
      }
    } catch (e) {
      console.error('Failed to parse or validate JSON:', e);
      throw new Error('Encrypted data is not valid: ' + e.message);
    }

    // MetaMask 的 eth_decrypt 需要 hex 编码的字符串
    // 将 JSON 字符串转换为 hex 格式
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(dataToDecrypt);
    const hexData = '0x' + Array.from(dataBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Hex data for MetaMask:', hexData.substring(0, 100) + '...');
    console.log('Hex data length:', hexData.length);

    // 使用 MetaMask 的解密 API
    console.log('Calling eth_decrypt with address:', recipientAddress);
    const decryptedMessage = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [hexData, recipientAddress],
    });

    console.log('Decryption successful!');
    return decryptedMessage;
  } catch (error) {
    console.error('Error decrypting message:', error);
    if (error.code === 4001) {
      throw new Error('User denied decryption request');
    }
    throw new Error('Failed to decrypt message. Make sure you are the intended recipient. Error: ' + error.message);
  }
}

/**
 * 从签名派生公钥（用于解密）
 */
export async function getDecryptionPublicKey(address) {
  return await getPublicKeyFromAddress(address);
}

/**
 * 验证消息是否可以被解密（测试用）
 */
export async function canDecrypt(encryptedMessage, recipientAddress) {
  try {
    await decryptMessage(encryptedMessage, recipientAddress);
    return true;
  } catch (error) {
    return false;
  }
}
