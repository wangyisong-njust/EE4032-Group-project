export const CONTRACT_ADDRESS = "0x3C8e9C6322e3501c65a289b360eA931c33B23970";

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
      },
      {
        "indexed": false,
        "internalType": "enum ChronosVault.CapsuleType",
        "name": "capsuleType",
        "type": "uint8"
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
        "name": "trustee",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "currentApprovals",
        "type": "uint256"
      }
    ],
    "name": "MultiSigApproval",
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
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "VestingReleased",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_capsuleId",
        "type": "uint256"
      }
    ],
    "name": "approveMultiSigUnlock",
    "outputs": [],
    "stateMutability": "nonpayable",
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
      },
      {
        "internalType": "enum ChronosVault.CapsuleType",
        "name": "capsuleType",
        "type": "uint8"
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
    "name": "getMultiSigDetails",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "trustees",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "requiredApprovals",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentApprovals",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isExecuted",
        "type": "bool"
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
    "name": "getVestingDetails",
    "outputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "releasedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "unlockTimestamps",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "unlockAmounts",
        "type": "uint256[]"
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
      },
      {
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "isTrustee",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "multiSigWills",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "requiredApprovals",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentApprovals",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isExecuted",
        "type": "bool"
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
        "internalType": "uint256",
        "name": "_capsuleId",
        "type": "uint256"
      }
    ],
    "name": "releaseVestedTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "uint256",
        "name": "_unlockTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "_trustees",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "_requiredApprovals",
        "type": "uint256"
      }
    ],
    "name": "sealMultiSigWill",
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
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "_unlockTimestamps",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_unlockAmounts",
        "type": "uint256[]"
      }
    ],
    "name": "sealVestingSchedule",
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
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "vestingSchedules",
    "outputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "releasedAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
