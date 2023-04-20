const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChain, networkConfig } = require("../helper-hardhat-config")

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
    let betContractWithPlayer1, deployedBetContract, betContractWithPlayer2, vrfCoordinatorV2Mock, deployedMocksContract, vrfCoordinatorV2Address, player1, player2 // , deployer
    const chainId = network.config.chainId
    const subscriptionId = network.config.subscriptionId
    const BASEFEE = "22000000000000000000"
    const GASPRICE = 1e9

    const gasLane = networkConfig[chainId].gasLane
    callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    let args = [vrfCoordinatorV2Address, subscriptionId, gasLane, callbackGasLimit]
    const mocksArgs = [BASEFEE, GASPRICE]
    beforeEach(async () => {

      accounts = await ethers.getSigners() // could also do with getNamedAccounts
      deployer = accounts[0]
      player1 = accounts[1]
      player2 = accounts[2]

      // await deployments.fixture(["mocks", "bet"]) // Deploys modules with the tags "mocks" and "raffle"
      vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock", deployer) // Returns a new connection to the VRFCoordinatorV2Mock contract
      betContract = await ethers.getContractFactory("Bet", deployer) // Returns a new connection to the Raffle contract
      //Deploy mocks
      deployedMocksContract = await vrfCoordinatorV2Mock.deploy(...mocksArgs)
      await deployedMocksContract.deployed()

      args[0] = deployedMocksContract.address // Update the mocks addres in the args


      // Deploy bet
      deployedBetContract = await betContract.deploy(...args)
      await deployedBetContract.deployed()
      // await deployedMocksContract.createSubscription()
      // Add a consumer so that u wont
      // console.log(deployedBetContract.address)

      betContractWithPlayer1 = deployedBetContract.connect(player1) // Returns a new instance of the bet contract connected to player
      betContractWithPlayer2 = deployedBetContract.connect(player2) // Returns a new instance of the bet contract connected to player

      // raffleEntranceFee = await raffle.getEntranceFee()
      // interval = await raffle.getInterval()
    })

    describe("constructor", function () {
      it("initializes the bet correctly", async () => {
        // Check if game has started
        const betState = await deployedBetContract.ifGameStarted()
        // Comparisons for Raffle initialization:
        assert.equal(betState, false)

      })
    })

    describe("startGame", function () {
      it("starts the game for players", async () => {
        await deployedBetContract.startGame(BASEFEE, "1234")
        let ifGameStarted = deployedBetContract.ifGameStarted()
        assert(ifGameStarted, true)
      })

      // it("only deployer can create a game", async () => {
      //   await bet.startGame(BASEFEE, "1234")
      //   let ifGameStarted = deployedBetContract.ifGameStarted()
      //    expect(ifGameStarted).to.be.reverted()
      // })
      it("allow players to place a bet", async () => {
        await deployedBetContract.startGame(BASEFEE, "1234") // Start the game
        const placedBet = await betContractWithPlayer1.placeBet({ value: BASEFEE });
        await expect(placedBet).to.emit(
          betContractWithPlayer1,
          "BetPlaced"
        )
      })

      it("records player when they bet", async () => {
        await deployedBetContract.startGame(BASEFEE, "1234")// Start the gamae

        await betContractWithPlayer1.placeBet({ value: BASEFEE })
        const contractPlayer = await betContractWithPlayer1.getPlayer(0)
        assert.equal(player1.address, contractPlayer)
      })

      // it("prevent betting when time is up", async () => {
      //   result = result.toNumber();
      //   // let hi = await deployedMocksContract.callStatic.getSubscription(result);
      //   console.log(result)

      //   await deployedMocksContract.callStatic.addConsumer(result, deployedBetContract.address)
      // await deployedBetContract.startGame(BASEFEE, "1")// Start the gamae
      // await betContractWithPlayer1.placeBet({ value: BASEFEE });
      // await network.provider.send("evm_increaseTime", [12345])
      // await network.provider.request({ method: "evm_mine", params: [] })

      // await deployedBetContract.performUpkeep("0x") // changes the state to calculating for our comparison below

      // await expect(bet.placeBet({ value: BASEFEE })).to.be.revertedWith( // is reverted as raffle is calculating
      //   "Game is currently running")
      // })

      describe("checkUpkeep", function () {
        it("returns false if people haven't sent any ETH", async () => {
          await deployedBetContract.startGame(BASEFEE, "1")// Start the gamae

          await network.provider.send("evm_increaseTime", [12345])
          await network.provider.request({ method: "evm_mine", params: [] })
          const { upkeepNeeded } = await deployedBetContract.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
          assert(!upkeepNeeded)
        })
        it("returns false if bet hasn't started", async () => {
          let hi = await deployedMocksContract.createSubscription();
          const txnRpt = await hi.wait()
          const id = txnRpt.events[0].args.subId.toNumber()
          console.log(id)
          let oi = await deployedMocksContract.callStatic.fundSubscription(1, ethers.utils.parseEther('25'));
          const txnRpt2 = await hi.wait()
          const id2 = txnRpt.events

          const deployedBetContract = await betContract.deploy(deployedMocksContract.address, 1, "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", 100000)

          betContractWithPlayer1 = deployedBetContract.connect(player1) // Returns a new instance of the bet contract connected to player

          let consumerAdded = await deployedMocksContract.addConsumer(1, deployedBetContract.address);
          const txnRpt1 = await consumerAdded.wait() // Wait for consumer to be added
          const txnRptEvent = txnRpt1.events
          // console.log(txnRptEvent, "COnsumer aadded")

          await deployedBetContract.startGame(BASEFEE, "1")// Start the gamae
          await betContractWithPlayer1.placeBet({ value: BASEFEE })

          // let result = await deployedMocksContract.callStatic.addConsumer(1, deployedBetContract.address)
          await network.provider.send("evm_increaseTime", [234])
          await network.provider.request({ method: "evm_mine", params: [] })
          await deployedBetContract.performUpkeep([]) // changes the gamestarted state to false
          const betStarted = await deployedBetContract.ifGameStarted() // stores the new state
          const { upkeepNeeded } = await deployedBetContract.callStatic.checkUpkeep("0x") // If check upkeep will return false
          assert.equal(betStarted == false, upkeepNeeded == false)
        })
      })

      describe("fufilwords ", function () {

        it("Get winner", async () => {
          // Create a subscription with mocks
          let hi = await deployedMocksContract.createSubscription();
          const txnRpt = await hi.wait()
          const id = txnRpt.events[0].args.subId.toNumber()
          // console.log(id)
          let fundedSubscription = await deployedMocksContract.fundSubscription(1, ethers.utils.parseEther('25'));
          const fundedSubscriptionRcpt = await fundedSubscription.wait()
          const fundedSubscriptionRcptEevt = fundedSubscriptionRcpt.events

          const deployedBetContract = await betContract.deploy(deployedMocksContract.address, 1, "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", 100000)

          betContractWithPlayer1 = deployedBetContract.connect(player1) // Returns a new instance of the bet contract connected to player1
          betContractWithPlayer2 = deployedBetContract.connect(player2) // Returns a new instance of the bet contract connected to player2

          // Add our consummer contract to the vrfcordinator
          let consumerAdded = await deployedMocksContract.addConsumer(1, deployedBetContract.address);
          const txnRpt1 = await consumerAdded.wait() // Wait for consumer to be added
          const txnRptEvent = txnRpt1.events
          // console.log(txnRptEvent, "COnsumer aadded")

          const startGame = await deployedBetContract.startGame(BASEFEE, "1")// Start the gamae
          await startGame.wait()
          const player1Play = await betContractWithPlayer1.placeBet({ value: BASEFEE })
          await player1Play.wait()
          const player2Play = await betContractWithPlayer2.placeBet({ value: BASEFEE })
          await player2Play.wait()

          const winnerStartingBalance = await player2.getBalance()
          console.log("Starting balance is ", winnerStartingBalance)
          // Increase time and move blocks
          await network.provider.send("evm_increaseTime", [234])
          await network.provider.request({ method: "evm_mine", params: [] })
          // It first checks if checkUpkeep is true
          const performUpkeep = await deployedBetContract.performUpkeep([]) // changes the gamestarted state to false
          const performUpkeepRcpt = await performUpkeep.wait()
          const performUpkeepRcptEvnt = await performUpkeepRcpt.events[1].args.requestId

          const deployedFufillWords = await deployedMocksContract.fulfillRandomWords(performUpkeepRcptEvnt, deployedBetContract.address)
          const deployedFufillWordsRct = await deployedFufillWords.wait()
          const deployedFufillWordsEvt = await deployedFufillWordsRct.events
          console.log("Randon words is ", deployedFufillWordsEvt)
          const recentWinner = await deployedBetContract.getRecentWinner()
          const gameStarted = await deployedBetContract.ifGameStarted()
          const numberOfPlayers = await deployedBetContract.getNumberOfPlayers()

          console.log("gameStarted", gameStarted)
          console.log("numberOfPlayers after game ends", numberOfPlayers)

          console.log("Player 1 ", deployer.address)
          console.log("Player 2", player1.address)
          console.log("Player 3", player2.address)

          console.log("Recent winner", recentWinner)
          const winnerEndingBalance = await player2.getBalance()
          console.log("Ending balance is ", winnerEndingBalance)
          // const betStarted = await deployedBetContract.ifGameStarted() // stores the new state
          // const { upkeepNeeded } = await deployedBetContract.callStatic.checkUpkeep("0x") // If check upkeep will return false
          // assert.equal(betStarted == false, upkeepNeeded == false)
        })
      })


    })
  })