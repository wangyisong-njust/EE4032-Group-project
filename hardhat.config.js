require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // 确保这行存在

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL, // 从 .env 文件读取
      accounts: [process.env.PRIVATE_KEY], // 从 .env 文件读取
    },  
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY, // 从 .env 文件读取
  // },
};
