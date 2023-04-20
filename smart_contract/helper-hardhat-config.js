const networkConfig = {
    default: {
        name: "hardhat",
    },

    31337: {
        name: "locahost",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit: "500000"

    },
    11155111: {
        name: "sepolia",
        vrfCordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId: "0",
        callbackGasLimit: "500000"
    },

    80001: {
        name: "mumbai",
        vrfCordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
        subscriptionId: "0",
        callbackGasLimit: "500000"
    },



}

const developmentChain = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6

module.exports = { networkConfig, developmentChain, VERIFICATION_BLOCK_CONFIRMATIONS }