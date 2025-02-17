require("@nomiclabs/hardhat-etherscan");
require("hardhat-sourcify");

module.exports = {
  solidity: "0.8.20",
  networks: {
    monad: {
      url: "https://explorer.monad-testnet.category.xyz/api/eth-rpc",
      chainId: 1,
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadexplorer.com/",
  },
  etherscan: {
    apiKey: {
      monad: "DUMMY_VALUE",
    },
    customChains: [
      {
        network: "monad",
        chainId: 1,
        urls: {
          apiURL: "https://explorer.monad-testnet.category.xyz/api",
          browserURL: "https://explorer.monad-testnet.category.xyz",
        },
      },
    ],
  },
};
