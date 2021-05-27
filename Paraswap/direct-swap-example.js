const { ParaSwap } = require("paraswap");
const BN = require("bignumber.js");
const Web3 = require("web3");
const { createWeb3, createQueryString, etherToWei, waitForTxSuccess, weiToEther } = require('../0x/utils');

const PROVIDER_URL = "http://127.0.0.1:8545/";

const referrer = "chucknorris";
const SLIPPAGE = 1;//1%

const networks = {
    MAINNET: 1,
    ROPSTEN: 3,
    POLYGON: 137
}

const { abi: WBTC_ABI } = require('../artifacts/contracts/Interfaces.sol/IWETH.json');

const tokens = {
    [networks.MAINNET]: [
        {
            "decimals": 18,
            "symbol": "ETH",
            "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        },
        {
            "decimals": 6,
            "symbol": "USDC",
            "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        },
        {
            "decimals": 18,
            "symbol": "DAI",
            "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
        }
    ],
    [networks.POLYGON]: [
        {
            "decimals": 18,
            "symbol": "MATIC",
            "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        },
        {
            "decimals": 8,
            "symbol": "WBTC",
            "address": "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
        }
    ],
    [networks.ROPSTEN]: [
        {
            "decimals": 18,
            "symbol": "ETH",
            "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        },
        {
            "decimals": 18,
            "symbol": "DAI",
            "address": "0xad6d458402f60fd3bd25163575031acdce07538d"
        }
    ]
}

function t(symbol, network) {
    network = network || networks.MAINNET;

    return tokens[network].find(t => t.symbol === symbol);
}

class ParaSwapper {
    constructor(network) {
        this.web3Provider = new Web3(PROVIDER_URL);
        
        this.paraSwap = new ParaSwap(network);

    }

    async getRate(from, to, amount) {
        let rate = await this.paraSwap.getRate(from.address, to.address, amount, 'SELL', { referrer }, from.decimals, to.decimals);
        // console.log(rate);
        return rate;
    }

    async buildSwap(from, to, srcAmount, minAmount, priceRoute, USER_ADDRESS) {
        return this.paraSwap.buildTx(from.address, to.address, srcAmount, minAmount, priceRoute, USER_ADDRESS, referrer);
    }
}

async function swap(_srcAmount, from, to, network) {
    try {
        
        const srcAmount = new BN(_srcAmount).times(10 ** from.decimals).toFixed(0);

        const ps = new ParaSwapper(network);

        const wbtc = new ps.web3Provider.eth.Contract(WBTC_ABI, "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6");

        const [USER_ADDRESS] = await ps.web3Provider.eth.getAccounts();
        // const USER_ADDRESS = "0x452181dAe31Cf9f42189df71eC64298993BEe6d3";
        console.log(USER_ADDRESS);
        console.log(await ps.web3Provider.eth.getBalance(USER_ADDRESS));

        const priceRoute = await ps.getRate(from, to, srcAmount);
        // console.log(priceRoute);

        const minAmount = new BN(priceRoute.destAmount).times(1 - SLIPPAGE / 100).toFixed(0);

        const transaction = await ps.buildSwap(from, to, srcAmount, minAmount, priceRoute, USER_ADDRESS);

        // console.log("transaction", transaction);

        // const [dummyAccount] = await ps.web3Provider.eth.getAccounts();

        console.log("WBTC balance before: ", await wbtc.methods.balanceOf(USER_ADDRESS).call());

        let tx = await ps.web3Provider.eth.sendTransaction({
            from: USER_ADDRESS,
            to: transaction.to,
            data: transaction.data,
            value: transaction.value,
            gas: transaction.gas,
            gasPrice: transaction.gasPrice
        });

        // console.log(tx);
        console.log("WBTC balance after: ", await wbtc.methods.balanceOf(USER_ADDRESS).call());

    } catch (error) {
        console.error(error);
    }
}

// swap(
//     1,
//     t("ETH", networks.ROPSTEN),
//     t("DAI", networks.ROPSTEN),
//     networks.ROPSTEN
// );

// swap(
//     1,
//     t("ETH", networks.MAINNET),
//     t("DAI", networks.MAINNET),
//     networks.MAINNET
// );


swap(
  0.01, 
  t("MATIC", networks.POLYGON), 
  t("WBTC", networks.POLYGON),
  networks.POLYGON
);