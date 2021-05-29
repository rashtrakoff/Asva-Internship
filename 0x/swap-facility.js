'use strict'
require('colors');
const BigNumber = require('bignumber.js');
// const fetch = require('node-fetch');
const process = require('process');
const {
    convertTo,
    convertFrom,
    etherToWei,
    weiToEther,
    createWeb3,
    createQueryString,
    waitForTxSuccess,
    fetchQuote,
    fetchTokenData
} = require('./test-utils');
const { abi: ERC20_ABI } = require('../artifacts/contracts/Interfaces.sol/IERC20.json');
const { abi: WETH_ABI } = require('../artifacts/contracts/Interfaces.sol/IWETH.json');
// const { command } = require('yargs');
const yargs = require('yargs');
const { web3, network } = require('hardhat');

// const API_QUOTE_URL = 'https://api.0x.org/swap/v1/quote';

// API quote URLs for all available networks. Remove quote from the url string
// const networks = {
//     1: 'https://api.0x.org/swap/v1/',
//     3: 'https://ropsten.api.0x.org/swap/v1/',
//     56: 'https://bsc.api.0x.org/swap/v1/'
// }

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
            sellToken: {
                describe: 'Token to swap/sell',
                demandOption: true,
                type: 'string'
            },
            buyToken: {
                describe: 'Token to swap for/buy',
                demandOption: true,
                type: 'string'
            },
            amount: {
                describe: 'sellToken amount',
                demandOption: true,
                type: 'number'
            }
        },

        handler(argv) {
            if (argv.network != 1 && argv.network != 3 && argv.network != 56) {
                console.log("Network not supported");
                process.exit(1);
            } else {
                run(argv);
            }
        }
    })

yargs.parse()

async function run(argv) {
    const [taker] = await web3.eth.getAccounts();

    //TODO: API call for getting the details of tokens.
    // console.log(`Fetching the token list from ${networks[argv.network].bold}...`);
    const tokenList = await fetchTokenData(argv.network);
    process.exit(0);
    
    const sellTokenContract = new web3.eth.Contract(ERC20_ABI, argv.sellToken);
    const buyTokenContract = new web3.eth.Contract(ERC20_ABI, argv.buyToken);

    // Convert sellAmount from token units to wei.
    const sellAmountWei = etherToWei(argv.sellAmount);

    // Mint some WETH using ETH.
    console.info(`Minting ${argv.sellAmount} WETH...`);
    await waitForTxSuccess(weth.methods.deposit().send({
        value: sellAmountWei,
        from: taker
    }));

    // Track our DAI balance.
    const daiStartingBalance = await dai.methods.balanceOf(taker).call();

    // Get a quote from 0x-API to sell the WETH we just minted.
    console.info(`Fetching swap quote from 0x-API to sell ${argv.sellAmount} WETH for DAI...`);
    const qs = createQueryString({
        sellToken: 'WETH',
        buyToken: 'DAI',
        sellAmount: sellAmountWei,
        // 0x-API cannot perform taker validation in forked mode.
        ...(FORKED ? {} : { takerAddress: taker }),
    });
    const quoteUrl = `${API_QUOTE_URL}?${qs}`;
    console.info(`Fetching quote ${quoteUrl.bold}...`);
    const response = await fetch(quoteUrl);
    const quote = await response.json();
    console.info(`Received a quote with price ${quote.price}`);

    // Grant the allowance target an allowance to spend our WETH.
    await waitForTxSuccess(
        weth.methods.approve(
            quote.allowanceTarget,
            quote.sellAmount,
        )
            .send({ from: taker }),
    );

    // Fill the quote.
    console.info(`Filling the quote directly...`);
    const receipt = await waitForTxSuccess(web3.eth.sendTransaction({
        from: taker,
        to: quote.to,
        data: quote.data,
        value: quote.value,
        gasPrice: quote.gasPrice,
        // 0x-API cannot estimate gas in forked mode.
        ...(FORKED ? {} : { gas: quote.gas }),
    }));

    // Detect balances changes.
    const boughtAmount = weiToEther(
        new BigNumber(await dai.methods.balanceOf(taker).call())
            .minus(daiStartingBalance)
    );
    console.info(`${'✔'.bold.green} Successfully sold ${argv.sellAmount.toString().bold} WETH for ${boughtAmount.bold.green} DAI!`);
    // The taker now has `boughtAmount` of DAI!
}