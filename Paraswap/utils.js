'use strict'
const BigNumber = require('bignumber.js');
const process = require('process');
const Web3 = require('web3');

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
    convertTo,
    convertFrom,
    etherToWei,
    weiToEther,
    createWeb3,
    waitForTxSuccess
    // createProvider
};