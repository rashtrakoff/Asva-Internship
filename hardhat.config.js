// require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat:{
      forking: {
        url: process.env.BSC_MAINNET_URL
      },
      // Disable this when testing Paraswap
      // accounts: [{
      //   privateKey: `0x${process.env.MAIN_PRIVATE_KEY}`,
      //   balance: '100000000000000000000'
      // }]
    }
  },
  solidity: "0.7.6",
};

