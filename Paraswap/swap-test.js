require("dotenv").config();

const Web3 = require("web3");
const { ParaSwap } = require("paraswap");
const BigNumber = require("bignumber.js");
const yargs = require('yargs');
const {
  getAddress,
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
let paraSwap, tokenList;

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
      // realAddress: {
      //   describe: 'Address which exists on the network',
      //   demandOption: false,
      //   type: 'string',
      //   default: '0x3507e4978e0Eb83315D20dF86CA0b976c0E40CcB' // Polygon MATIC holder Address
      //   // default: '0xF68a4b64162906efF0fF6aE34E2bB1Cd42FEf62d' // BSC Address
      // },
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
      if (argv.network != 1 && argv.network != 3 && argv.network != 56 && argv.network != 137) {
        console.log("Network not supported");
        process.exit(1);
      } else if (argv.sellToken === argv.buyToken) {
        console.log("Sell token and buy token are same");
        process.exit(1);
      } else {
        paraSwap = new ParaSwap(argv.network).setWeb3Provider(web3);
        tokenList = await fetchTokens();
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
  // tokens = await fetchTokens();
  // console.log("Tokens fetched from Paraswap API...");
  // console.log("Num tokens: ", tokenList.length);

  for (let i = 0; i < tokenList.length; ++i) {
    if (tokenList[i].symbol === token)
      return tokenList[i];
  }
  console.log("Token symbol not found !");
  return;
}

async function fetchRate(srcToken, destToken, srcAmount, referrer, sellTokenDecimals, buyTokenDecimals) {
  // return paraSwap.getRate(srcToken, destToken, srcAmount, 'SELL', { referrer }, sellTokenDecimals, buyTokenDecimals);
  return paraSwap.getRate(srcToken, destToken, srcAmount);
}

async function buildSwapTx(srcToken, destToken, srcAmount, priceRoute, senderAddress, referrer) {
  const minDestinationAmount = new BigNumber(priceRoute.destAmount).multipliedBy(1 - DEFAULT_ALLOWED_SLIPPAGE).toFixed(0);
  return paraSwap.buildTx(srcToken, destToken, srcAmount, minDestinationAmount, priceRoute, senderAddress, referrer, undefined, { ignoreChecks: true });
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
  const [realAddress, referrer] = await web3.eth.getAccounts();
  // const realAddress = getAddress(argv.network, argv.sellToken);
  const sellTokenData = await fetchTokenData(argv.sellToken);
  const buyTokenData = await fetchTokenData(argv.buyToken);
  let sellTokenBalance, buyTokenBalance;

  // Printing real address token balances
  sellTokenBalance = await findBalance(realAddress, sellTokenData.address);
  buyTokenBalance = await findBalance(realAddress, buyTokenData.address);
  console.log(`${argv.sellToken} amount of real address ${realAddress}: ${sellTokenBalance}`);
  console.log(`${argv.buyToken} amount of real address ${realAddress}: ${buyTokenBalance}`);

  try {
    const priceRoute = await fetchRate(sellTokenData.address, buyTokenData.address, convertTo(argv.amount, sellTokenData.decimals));
    console.log(priceRoute)
    if (argv.sellToken != 'ETH' && argv.sellToken != 'BNB' && argv.sellToken != 'MATIC') {
      await paraSwap.approveToken(convertTo(argv.amount, sellTokenData.decimals), realAddress, sellTokenData.address);
    }
    
      const transaction = await buildSwapTx(
      sellTokenData.address,
      buyTokenData.address,
      convertTo(argv.amount, sellTokenData.decimals),
      priceRoute,
      realAddress,
      referrer
    );

     console.log(transaction);

    await waitForTxSuccess(web3.eth.sendTransaction({
      from: realAddress,
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
      gas: transaction.gas,
      gasPrice: transaction.gasPrice
    }));

    buyTokenBalance = await findBalance(realAddress, buyTokenData.address);

    console.log(`Real address balance of ${argv.buyToken} after swapping: ${buyTokenBalance}`);

  } catch (error) {
    console.error(error);
  }

}