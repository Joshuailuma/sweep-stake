
const { ethers, network } = require("hardhat");
const { developmentChain, networkConfig } = require("../helper-hardhat-config");
const verify = require("../utils/verify")
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-etherscan");

async function main() {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let deployedMockContract, subscriptionId
    const vrfCordinatorV2AddressReal = networkConfig[chainId]["vrfCordinatorV2"] //gotten from hh config

    const gasLane = networkConfig[chainId]["gasLane"]
    callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]

    let bet

    if (chainId == 31337) {
        log(`Deploying to ${chainId}`)
        const betContract = await ethers.getContractFactory("Bet", deployer)
        const vrfCordinatorMock = await ethers.getContractFactory("VRFCoordinatorV2Mock", deployer)
        deployedMockContract = await vrfCordinatorMock.deploy(
            22000000000, 10000000000000
        );

        await deployedMockContract.deployed();



        const transactionResponse = await deployedMockContract.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId //Get it from events emitted
        //FUnd the subscription
        await deployedMockContract.fundSubscription(subscriptionId, ethers.utils.parseEther("2"))

        // deploy the contract
        const deployedBetContract = await betContract.deploy(
            deployedMockContract.address, subscriptionId, gasLane, callbackGasLimit
        );
        await deployedBetContract.deployed();
        console.log(`Deployed to ${chainId}`)
    } else {
        console.log(`Deploying to ${chainId}`)
        subscriptionId = networkConfig[chainId]["subscriptionId"]
        const betContract = await ethers.getContractFactory("Bet", deployer)

        const deployedBetContract = await betContract.deploy(
            vrfCordinatorV2AddressReal,
            subscriptionId,
            gasLane,
            callbackGasLimit
        );
        await deployedBetContract.deployed();
        console.log(`Deployed to ${chainId} with address ${deployedBetContract.address}`)
        if (chainId !== 31337 && process.env.POLYGONSCAN_API_KEY || process.env.ETHERSCAN_API_KEY) {
            console.log("Verifying")
            await verify(deployedBetContract.address, [vrfCordinatorV2AddressReal,
                subscriptionId,
                gasLane,
                callbackGasLimit])
        }
    }




}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
