# Asva Exchange Facility

[![hackmd-github-sync-badge](https://hackmd.io/090WoLcWSXOGzXurlW6Huw/badge)](https://hackmd.io/090WoLcWSXOGzXurlW6Huw)


We intend to create an exchange facility on our platform    which will function in a similar way to the exchange facilities on Zerion and ZapperFi and the features of which will be as follows:

- Should aggregate liquidity from the best sources on BSC (later on Polygon).
- Should be able to find best routes for swapping tokens.
- Should be cheap and gas efficient.
- Should be fast and easy to use.

## Approach

There are two ways aggregation can be done:

 1. Create our own smart contracts which interact with different protocols on BSC.
 2. Use existing APIs which find the best routes for us.
 
We decided to go with the second option as it will be faster and safer to implement the solutions which many reputed networks and projects have already created.

## Exploration

There are quite a few projects which provide API solutions for our needs. In this section, we will explore these projects in detail.

### 1inch API

This is one of the most famous names in the industry and has a great reputation for building a fast and innovative DEX aggregator. They used to have smart contract solutions which made the whole network decentralized but recently, they decided to switch to an API based service. This does present some risks in terms of transparency and security of the service. However, with their recent V3 release, 1inch claims that they are the most gas efficient and secure DEX aggregator. This claim has been made in comparison with 0X API and Uniswap router (on Ethereum). 

![1inch gas is efficient when compared with Uniswap Router and 0x Router](https://miro.medium.com/max/875/0*tAUJreUx9hD8SPay)

The algorithm behind their service is called "Pathfinder". This algorithm is available for Ethereum, BSC and Polygon (added recently). Another advantage that they offer is the possibility of reducing gas costs further by using their "Chi" gas token. They claim a gast cost reduction of upto 42% when their gas token is used along with a swap.
    
### ParaSwap
 
 According to their docs:
 
 > ParaSwap is a middleware streamlining user's interactions with various DeFi services. **It gathers liquidity from the main decentralized exchanges together in a convenient interface** abstracting most of the swaps' complexity to make it convenient and accessible for end-users.

ParaSwap API allows any developer to retrieve Token prices as well as making swaps between EVM based assets (Ethereum mainnet, Polygon, and others). We can also use their JS/TS SDK for web integration.

### 0x API
 
0x API is a professional grade liquidity aggregator enabling the future of DeFi applications. What is unique about them is that they provide middleware solutions to developers who can then implement those solutions in their dapp. 0x provides exclusive liquidity by using professional market makers, 0x open orderbook and private liquidity pools. They have used this API to create Matcha.

> Matcha is the global search engine for liquidity and markets that enables users to trade tokens at the best price through a world class interface.

![0x API comparison](https://i.imgur.com/S6JHolK.png)

As you can see in the above picture, 0x developers claim that their API performs better compared to other dex aggregators (note that this is before the newer versions of ParaSwap and 1inch were released).

0x provides lot more features compared to 1inch and ParaSwap. Infact, the other two projects use 0x in some way.
One more advanced feature is RFQ-T

> With the use of RFQ-T, the 0x API aggregates not just on-chain pools and Mesh order books, but also real-time quotes from live market makers offering pricing available exclusively for trusted clients of the API. RFQ is an abbreviation of Request for Quote, in that the 0x API requests quotes from market makers on behalf of its clients. The -T suffix indicates that the settlement transaction is to be submitted to the Ethereum network by the Taker.

As a developer, I feel that 0x API will be ideal for our use-case as they have excellent documentation as well as detailed examples. One can use 0x API along with smart contracts. The only drawback that I can find is that the API doesn't exist on Polygon yet (though they do have plans for it).

## Development Details

### 0x API

 - An example code to test out the API was implemented using [0x-api-starter-guide-code](https://github.com/0xProject/0x-api-starter-guide-code) repository.
 - To run this example code, you have to use mainnet forking mode and set the ALCHEMY_URL (Alchemy API Endpoint URL) in the .env file.
 - Run a hardhat node in a terminal using the command: `hh node`
 - Now, in a separate terminal, run the command: `node 0x/direct-swap-example.js`

## Useful Resources

- [Mainnet forking documentation](https://hardhat.org/guides/mainnet-forking.html)
- [Swap Tokens With 0x API](https://0x.org/docs/guides/swap-tokens-with-0x-api#specify-a-taker-address-for-your-swaps)
- [API Specification](https://0x.org/docs/api)
- [0x-api-starter-guide-code](https://github.com/0xProject/0x-api-starter-guide-code)







