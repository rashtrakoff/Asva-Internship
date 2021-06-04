require("dotenv").config();
const fs = require('fs-extra')
const Web3 = require("web3");
const { ParaSwap } = require("paraswap");
const BigNumber = require("bignumber.js");
const express = require('express');
const app = express();

const {
    getAddress,
    convertTo,
    convertFrom,
    etherToWei,
    weiToEther,
    createWeb3,
    waitForTxSuccess
  } = require('./utils');

const web3 = new Web3("http://127.0.0.1:8545/")
paraSwap = new ParaSwap(56).setWeb3Provider(web3);

const DEFAULT_ALLOWED_SLIPPAGE = 0.01;//1%

// {
//     "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//     "decimals": 18,
//     "symbol": "BNB",
//     "tokenType": "ERC20",
//     "mainConnector": "",
//     "connectors": [
//         "ETH"
//     ],
//     "network": 56,
//     "img": "https://img.paraswap.network/token.png"
// },


app.get('/listOfTokens', (req, res) =>{
    async function tokensDetail(){
    const listOfTokens = await paraSwap.getTokens();
    // res.send(listOfTokens)
    const arrayOfTokens =  listOfTokens.map(({symbol}) => symbol)
     res.send(arrayOfTokens)
 
  }
  tokensDetail()
})



async function fetchTokens(token) {
    tokenDetails = await paraSwap.getTokens();
    for (let i = 0; i < tokenDetails.length; i++) {
        if (tokenDetails[i].symbol === token)
          return (tokenDetails[i]); 
      }
    // console.log(tokenDetails.length)
  }

// async function fetchRate(srcToken, destToken, srcAmount, referrer, sellTokenDecimals, buyTokenDecimals) {
//     srcToken = await fetchTokens(srcToken)
//     const srcAddress = srcToken.address;
//     destToken = await fetchTokens(destToken)
//     const destAddress = destToken.address;
//     srcAmount = convertTo(srcAmount, srcToken.decimals),
//     console.log(srcAddress)
//     console.log(destAddress)
//     console.log(srcAmount)
    
//   }

//   fetchRate("BNB","USDC", 100)

app.post('/fetchRate', (req, res) =>{
    const srcToken = req.body.srcToken ;
    const destToken = req.body.destToken;
    const srcAmount = req.body.srcAmount;

    res.send(srcToken, destToken, srcAmount)

})

//     async function fetchRate(srcToken, destToken, srcAmount, referrer, sellTokenDecimals, buyTokenDecimals) {
//         // return paraSwap.getRate(srcToken, destToken, srcAmount, 'SELL', { referrer }, sellTokenDecimals, buyTokenDecimals);
//         // return paraSwap.getRate(srcToken, destToken, srcAmount);
//         const fetchedRate = await paraSwap.getRate(srcToken, destToken, srcAmount);
//         res.send(fetchedRate)
//       }
//     fetchRate(srcToken, destToken, srcAmount);
//   })



app.listen(3000, () => console.log("Listening to port 3000"));