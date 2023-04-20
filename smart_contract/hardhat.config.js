require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("dotenv").config({ path: ".env" });

/** @type import('hardhat/config').HardhatUserConfig */

const RPC_URL = process.env.MUMBAI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY
module.exports = {
  solidity: "0.8.18",

  defaultNetwork: "hardhat",

  networks: {
    sepolia: {
      url: RPC_URL,
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
    },

    mumbai: {
      url: RPC_URL,
      chainId: 80001,
      accounts: [PRIVATE_KEY],
    },

    hardhat: {
      chainId: 31337,
      subscriptionId: 588,
    },

    localhost: {
      chainId: 31337,
      subscriptionId: 588,
    }
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },

    user2: {
      default: 2,
    },
  },

  etherscan: {
    apiKey: {
      polygonMumbai: ETHERSCAN_API_KEY
    }
  },


};