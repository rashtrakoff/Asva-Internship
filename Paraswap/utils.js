'use strict'
const BigNumber = require('bignumber.js');
const process = require('process');
const Web3 = require('web3');

const holders = {
    137: {
        "USDC": "0xCaF1A0E288965a7A64303A49d2A10E22414fA264",
        "DAI": "0x10074C3C861cEc3799E699aD4fbff4158924720b",
        "MATIC": "0x0Ba440288a9d2DE45a705CAF1c6877699954dDb2",
        "FRAX": "0x2cc2d2b150aa0A32E269C1699AEB96acF5977FB4",
        "QUICK": "0x2ee05Fad3b206a232E985acBda949B215C67F00e"
    },
    56: {
        "BNB": "0xF68a4b64162906efF0fF6aE34E2bB1Cd42FEf62d",
        "USDC": "0xea1a7239ca9400af09a9e3058b8faf4fbe546321",
        "DOT": "0xf68a4b64162906eff0ff6ae34e2bb1cd42fef62d",
        "ADA": "0x6093a0b32c9fb18f61198a5fe869d3ef9549f61a",
        "LINK": "0x49131c9b7b04a940168ff58a0d226ba3e892a697"
    }
}

function getAddress(network, token) {
    return holders[network][token];
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

module.exports = {
    getAddress,
    convertTo,
    convertFrom,
    etherToWei,
    weiToEther,
    createWeb3,
    waitForTxSuccess
    // createProvider
};