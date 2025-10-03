// Contract configuration
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "unlockTimestamp",
        "type": "uint256"
      }
    ],
    "name": "CapsuleSealed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "capsuleId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "CapsuleUnsealed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "capsules",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address payable",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "encryptedData",
        "type": "bytes"
      },
      {
        "internalType": "string",
        "name": "decryptionKey",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "unlockTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "ethValue",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "nftContractAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isUnsealed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "capsuleCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_capsuleId",
        "type": "uint256"
      }
    ],
    "name": "getDecryptionKey",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC721Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_recipient",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "_encryptedData",
        "type": "bytes"
      },
      {
        "internalType": "string",
        "name": "_decryptionKey",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_unlockTimestamp",
        "type": "uint256"
      }
    ],
    "name": "sealCapsule",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_recipient",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "_encryptedData",
        "type": "bytes"
      },
      {
        "internalType": "string",
        "name": "_decryptionKey",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_unlockTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_nftContractAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_nftTokenId",
        "type": "uint256"
      }
    ],
    "name": "sealCapsuleWithNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_capsuleId",
        "type": "uint256"
      }
    ],
    "name": "unsealCapsule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
