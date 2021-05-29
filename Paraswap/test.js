require("dotenv").config();

const Web3 = require("web3");
const {ParaSwap} = require("paraswap");
const BigNumber = require("bignumber.js");
const { createWeb3, createQueryString, etherToWei, waitForTxSuccess, weiToEther } = require('../0x/utils');


const apiURL = process.env.API_URL || 'https://paraswap.io/api';

const network = 1;
const srcToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const destToken = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';
const srcAmount = '1000000000000000000'; //The source amount multiplied by its decimals
const senderAddress = '0x73bceb1cd57c711feac4224d062b0f6ff338501e';
const payTo = '0x8B4e846c90a2521F0D2733EaCb56760209EAd51A'; // Useful in case of a payment
const referrer = 'demo-trading-script';

const DEFAULT_ALLOWED_SLIPPAGE = 0.01;//1%

const paraSwap = new ParaSwap(network);

async function getTokens() {
  return paraSwap.getTokens();
}

async function getRate() {
  return paraSwap.getRate(srcToken, destToken, srcAmount);
}

async function buildSwapTx(priceRoute) {
  const minDestinationAmount = new BigNumber(priceRoute.amount).multipliedBy(1 - DEFAULT_ALLOWED_SLIPPAGE).toFixed(0);
  return paraSwap.buildTx(srcToken, destToken, srcAmount, minDestinationAmount, priceRoute, senderAddress, referrer);
}
//dummy acc
// const [dummyAccount] = await ps.web3Provider.eth.getAccounts();

async function buildPayTx(priceRoute) {
  const minDestinationAmount = new BigNumber(priceRoute.amount).multipliedBy(1 - DEFAULT_ALLOWED_SLIPPAGE).toFixed(0);
  return paraSwap.buildTx(srcToken, destToken, srcAmount, minDestinationAmount, priceRoute, senderAddress, referrer, payTo);
}

async function run() {
  const tokens = await getTokens();
  console.log('tokens', tokens.length);

  const rate = await getRate();
  console.log('rate', rate);

  const swapTx = await buildSwapTx(rate);
  console.log('swapTx', swapTx);

  const payTx = await buildPayTx(rate);
  console.log('payTx', payTx);
}

run();