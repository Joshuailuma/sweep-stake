// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

// Error message when amount placed to play the game is too small
error Bet__minimumAmountTooSmall();

error Bet__upkeepNotNeeded(
    uint256 currentBalance,
    uint256 numOfPlayers,
    bool isGameStarted
);

error Bet__TransferFailed();

contract Bet is VRFConsumerBaseV2, AutomationCompatibleInterface, Ownable {
    /**Bet variables */
    // Minimum amount required to allow users play
    uint256 private i_minimumAmount;
    // Keep track of users that have placed a bet
    address payable[] private players;
    // How long a game will run for
    uint256 private timeInterval;
    // The time the game started
    uint256 private startTime;
    //Who just won
    address private s_recentWinner;

    // Event to be emmited when a user place a bet
    event BetPlaced(address indexed player);
    // Emmited when game starts
    event GameStarted(uint256 gameId, uint256 i_minimumAmount);
    // Emmited when game ends
    event GameEnded(uint256 gameId, address winner, bytes32 requestId);
    event RequestedBetWinner(uint256 requestId);
    // Picked winner
    event WinnerPicked(address indexed theWinner);
    // Variable to indicate if the game has started or not
    bool public gameStarted;

    // current game id
    uint256 public gameId;

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1; // Number of random numbers

    /* Functions */
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyHash
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        gameStarted = false;
    }

    function startGame(
        uint256 _minimumAmount,
        uint256 _timeInterval
    ) public onlyOwner {
        // Check if there is a game already running
        require(!gameStarted, "Game is currently running");

        timeInterval = _timeInterval;
        // Empty the players array
        delete players;
        // set the game started to true
        gameStarted = true;
        // setup the minimum amount for the game
        i_minimumAmount = _minimumAmount;
        // Increase the value of the game id
        gameId += 1;
        startTime = block.timestamp;
        emit GameStarted(gameId, i_minimumAmount);
    }

    /**
     * To allow users play a bet
     */
    function placeBet() public payable {
        if (msg.value < i_minimumAmount) {
            revert Bet__minimumAmountTooSmall();
        }
        require(gameStarted, "Game has not been started yet");
        // Add the user to the array of players
        players.push(payable(msg.sender));
        // Emit an event containing the player when a player places a bet
        emit BetPlaced(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. The time interval has passed between raffle runs.
     * 2. The lottery is open.
     * 3. The contract has ETH.
     * 4. Implicity, your subscription is funded with LINK.
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool timePassed = ((block.timestamp - startTime) > timeInterval);
        bool hasPlayers = players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && gameStarted && hasBalance && hasPlayers);
        return (upkeepNeeded, "0x0"); // can we comment this out?
    }

    /**
     * @dev Once `checkUpkeep` is returning `true`, this function is called
     * and it kicks off a Chainlink VRF call to get a random winner.
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        // require(upkeepNeeded, "Upkeep not needed");
        if (!upkeepNeeded) {
            revert Bet__upkeepNotNeeded(
                address(this).balance,
                players.length,
                (gameStarted)
            );
        }

        gameStarted = false;

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedBetWinner(requestId);
    }

    /**
     * @dev This is the function that Chainlink VRF node
     * calls to send the money to the random winner.
     */
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        // s_players size 10
        // randomNumber 202
        // 202 % 10 ? what's doesn't divide evenly into 202?
        // 20 * 10 = 200
        // 2
        // 202 % 10 = 2
        uint256 indexOfWinner = randomWords[0] % players.length;
        address payable recentWinner = players[indexOfWinner];
        s_recentWinner = recentWinner;
        players = new address payable[](0); // Reset players
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        // require(success, "Transfer failed");
        if (!success) {
            revert Bet__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /**
     * Get minimum amount required to allow users play
     */
    function getMinimumAmount() public view returns (uint256) {
        return i_minimumAmount;
    }

    /**
     * Get a particular player's address
     * @param index podition in players array
     */
    function getPlayer(uint256 index) public view returns (address) {
        return players[index];
    }

    /**
     * Get how long the game will last or
     **/
    function getTimeInterval() public view returns (uint256) {
        return timeInterval;
    }

    /**
     * get the Number of players currently in the game
     */
    function getNumberOfPlayers() public view returns (uint256) {
        return players.length;
    }

    /**
     * Check if game is opened or closed
     */
    function ifGameStarted() public view returns (bool) {
        return gameStarted;
    }

    /**
     * Get the current winner
     */
    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    // Pause the smart contract incase of any issue
}
