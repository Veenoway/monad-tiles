// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MonadTiles {
    struct Player {
        uint256 bestScore; 
        uint256 lastScore;
        uint256 txCount; 
    }

    mapping(address => Player) public players;
    mapping(address => bool) public registered;
    address[] public playersList;
    address[] public leaderboard;

    event Click(address indexed player, uint256 newTxCount);
    event ScoreSubmitted(address indexed player, uint256 lastScore, uint256 bestScore);

    function click(address _userAddress) external {
        if (!registered[_userAddress]) {
            registered[_userAddress] = true;
            playersList.push(_userAddress);
        }
        players[_userAddress].txCount += 1;
        emit Click(_userAddress, players[_userAddress].txCount);
    }

    function submitScore(uint256 score, address _userAddress) external {
        players[_userAddress].lastScore = score;
        if (score > players[_userAddress].bestScore) {
            players[_userAddress].bestScore = score;
        }
        _updateLeaderboard(_userAddress);
        emit ScoreSubmitted(_userAddress, score, players[_userAddress].bestScore);
    } 

    function _updateLeaderboard(address player) internal {
        bool found = false;
        uint256 len = leaderboard.length;
        for (uint256 i = 0; i < len; i++) {
            if (leaderboard[i] == player) {
                found = true;
                break;
            }
        }
        if (!found) {
            if (len < 20) {
                leaderboard.push(player);
            } else {
                uint256 minScore = players[leaderboard[0]].bestScore;
                uint256 indexMin = 0;
                for (uint256 i = 1; i < len; i++) {
                    if (players[leaderboard[i]].bestScore < minScore) {
                        minScore = players[leaderboard[i]].bestScore;
                        indexMin = i;
                    }
                }
                if (players[player].bestScore > minScore) {
                    leaderboard[indexMin] = player;
                }
            }
        }
        len = leaderboard.length;
        for (uint256 i = 0; i < len; i++) {
            for (uint256 j = i + 1; j < len; j++) {
                if (players[leaderboard[j]].bestScore > players[leaderboard[i]].bestScore) {
                    address temp = leaderboard[i];
                    leaderboard[i] = leaderboard[j];
                    leaderboard[j] = temp;
                }
            }
        }
    }

    function getLeaderboard() external view returns (
        address[] memory topPlayers,
        uint256[] memory bestScores,
        uint256[] memory txCounts
    ) {
        uint256 len = leaderboard.length;
        topPlayers = new address[](len);
        bestScores = new uint256[](len);
        txCounts = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            topPlayers[i] = leaderboard[i];
            bestScores[i] = players[leaderboard[i]].bestScore;
            txCounts[i] = players[leaderboard[i]].txCount;
        }
    }

    function getRank(address player) external view returns (uint256 rank) {
        uint256 playerBest = players[player].bestScore;
        uint256 count = 0;
        uint256 total = playersList.length;
        for (uint256 i = 0; i < total; i++) {
            if (players[playersList[i]].bestScore > playerBest) {
                count++;
            }
        }
        rank = count + 1;
    }
}
