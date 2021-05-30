require("dotenv").config();

const Web3 = require("web3");
const { ParaSwap, ParaswapFeed } = require("paraswap");
const BigNumber = require("bignumber.js");
const yargs = require('yargs');
const {
  convertTo,
  convertFrom,
  etherToWei,
  weiToEther,
  createWeb3,
  waitForTxSuccess
} = require('./utils');

const { abi: ERC20_ABI } = require('../artifacts/contracts/Interfaces.sol/IERC20.json');

const web3 = new Web3("http://127.0.0.1:8545/")

const DEFAULT_ALLOWED_SLIPPAGE = 0.01;//1%
let paraSwap;

require('yargs')
  .command({
    command: '*',
    describe: 'Fill a swap quote',
    builder: {
      network: {
        describe: 'Network on which you want to swap tokens',
        demandOption: false,
        type: 'number',
        default: 1
      },
      realAddress: {
        describe: 'Address which exists on the network',
        demandOption: false,
        type: 'string',
        default: '0x73bceb1cd57c711feac4224d062b0f6ff338501e' // Ethereum Address
      },
      sellToken: {
        describe: 'Token to swap/sell',
        demandOption: false,
        type: 'string',
        default: 'ETH'
      },
      buyToken: {
        describe: 'Token to swap for/buy',
        demandOption: false,
        type: 'string',
        default: 'ETH'
      },
      amount: {
        describe: 'ETH/BNB/MATIC amount',
        demandOption: true,
        type: 'number'
      }
    },

    async handler(argv) {
      if (argv.network != 1 && argv.network != 3 && argv.network != 56) {
        console.log("Network not supported");
        process.exit(1);
      } else if (argv.sellToken === argv.buyToken) {
        console.log("Sell token and buy token are same");
        process.exit(1);
      } else {
        paraSwap = new ParaSwap(argv.network);
        await run(argv);
        process.exit(0);
      }
    }
  })

yargs.parse()

async function fetchTokens() {
  return paraSwap.getTokens();
}

async function fetchTokenData(token) {
  tokens = await fetchTokens();
  console.log("Tokens fetched from Paraswap API...");

  for (let i = 0; i < tokens.length; ++i) {
    if (tokens[i].symbol === token)
      return tokens[i];
  }

  console.log("Token symbol not found !");
  return;
}

async function fetchRate(srcToken, destToken, srcAmount, referrer, sellTokenDecimals, buyTokenDecimals) {
  return paraSwap.getRate(srcToken, destToken, srcAmount, 'SELL', { referrer }, sellTokenDecimals, buyTokenDecimals);
}

async function buildSwapTx(srcToken, destToken, srcAmount, priceRoute, senderAddress, referrer) {
  const minDestinationAmount = new BigNumber(priceRoute.destAmount).multipliedBy(1 - DEFAULT_ALLOWED_SLIPPAGE).toFixed(0);
  return paraSwap.buildTx(srcToken, destToken, srcAmount, minDestinationAmount, priceRoute, senderAddress, referrer);
}

async function buildPayTx(priceRoute) {
  const minDestinationAmount = new BigNumber(priceRoute.amount).multipliedBy(1 - DEFAULT_ALLOWED_SLIPPAGE).toFixed(0);
  return paraSwap.buildTx(srcToken, destToken, srcAmount, minDestinationAmount, priceRoute, senderAddress, referrer, payTo);
}

async function findBalance(userAddress, tokenAddress) {
  if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    return web3.eth.getBalance(userAddress);
  else {
    const token = new web3.eth.Contract(ERC20_ABI, tokenAddress);
    return token.methods.balanceOf(userAddress).call();
  }
}

async function run(argv) {
  const [dummyAddress] = await web3.eth.getAccounts();
  const sellTokenData = await fetchTokenData(argv.sellToken);
  const buyTokenData = await fetchTokenData(argv.buyToken);
  let sellTokenBalance, buyTokenBalance;

  // Printing real address token balances
  sellTokenBalance = await findBalance(argv.realAddress, sellTokenData.address);
  buyTokenBalance = await findBalance(argv.realAddress, buyTokenData.address);
  console.log(`${argv.sellToken} amount of real address ${argv.realAddress}: ${sellTokenBalance}`);
  console.log(`${argv.buyToken} amount of real address ${argv.realAddress}: ${buyTokenBalance}`);

  // Swapping ETH/BNB/MATIC for desired sellToken in case sellToken != ETH/BNB/MATIC
  if (argv.sellToken != 'ETH' && argv.sellToken != 'BNB' && argv.sellToken != 'MATIC') {
    const priceRoute = await fetchRate('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', sellTokenData.address, etherToWei(argv.amount), "chucknorris", 18, sellTokenData.decimals);

    const transaction = await buildSwapTx(
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      sellTokenData.address,
      etherToWei(argv.amount),
      priceRoute,
      argv.realAddress,
      "chucknorris"
    );
    
    await waitForTxSuccess(web3.eth.sendTransaction({
      from: dummyAddress,
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
      gas: transaction.gas,
      gasPrice: transaction.gasPrice
    }));

    console.log(`Dummy address balance of ${argv.sellToken} after swapping with native token: ${await findBalance(dummyAddress, sellTokenData.address)}`);

  } else {
    // TODO: When the swap uses native token of the network as sellToken
    return;
  }

}