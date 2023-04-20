const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const BASEFEE = "250000000000000000"
const GASPRICE = 1e9

async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const args = [BASEFEE, GASPRICE]

    if (chainId == 31337) {

        log("Deploying mocks since local network found")
        const mocks = await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mock deployed")
    } else {
        log(`Chain id is ${chainId}`)
    }
}

module.exports.tags = ["all", "mocks"]

