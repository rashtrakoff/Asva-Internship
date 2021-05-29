'use strict'
const BigNumber = require('bignumber.js');
const process = require('process');
const fetch = require('node-fetch');
const Web3 = require('web3');

const networks = {
    1: 'https://api.0x.org/swap/v1/',
    3: 'https://ropsten.api.0x.org/swap/v1/',
    56: 'https://bsc.api.0x.org/swap/v1/'
}

function createQueryString(params) {
    return Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
}

// Wait for a web3 tx `send()` call to be mined and return the receipt.
function waitForTxSuccess(tx) {
    return new Promise((accept, reject) => {
        try {
            tx.on('error', err => reject(err));
            tx.on('receipt', receipt => accept(receipt));
        } catch (err) {
            reject(err);
        }
    });
}

// Not required for testing
// function createProvider() {
//     const provider = /^ws?:\/\//.test(RPC_URL)
//         ? new Web3.providers.WebsocketProvider(RPC_URL)
//         : new Web3.providers.HttpProvider(RPC_URL);
//     if (!MNEMONIC) {
//         return provider;
//     }
//     return new HDWalletProvider({ mnemonic: MNEMONIC, providerOrUrl: provider });
// }

function createWeb3() {
    return new Web3('http://127.0.0.1:8545/');
}

// Function for converting amount from larger unit (like eth) to smaller unit (like wei)
function convertTo(amount, decimals) {
    return new BigNumber(amount)
        .times('1e' + decimals)
        .integerValue()
        .toString(10);
}

// Function for converting amount from smaller unit (like wei) to larger unit (like ether)
function convertFrom(amount, decimals) {
    return new BigNumber(amount)
        .div('1e' + decimals)
        .toString(10);
}

function etherToWei(etherAmount) {
    return new BigNumber(etherAmount)
        .times('1e18')
        .integerValue()
        .toString(10);
}

function weiToEther(weiAmount) {
    return new BigNumber(weiAmount)
        .div('1e18')
        .toString(10);
}

async function fetchQuote(network, qs) {
    const API_URL = networks[network];
    const quoteUrl = `${API_URL}quote?${qs}`;
    console.info(`Fetching quote ${quoteUrl.bold}...`);
    const response = await fetch(quoteUrl);
    const quote = await response.json();
    
    return quote;
}

async function fetchTokenData(network) {
    const API_URL = networks[network];
    const tokensUrl = `${API_URL}tokens`;
    console.info(`Fetching the token list from ${tokensUrl.bold}...`);
    const response = await fetch(tokensUrl);
    const tokens = await response.json();
    console.log(tokens);

    return tokens;
}

module.exports = {
    convertTo,
    convertFrom,
    etherToWei,
    weiToEther,
    createWeb3,
    createQueryString,
    waitForTxSuccess,
    fetchQuote,
    fetchTokenData
    // createProvider
};