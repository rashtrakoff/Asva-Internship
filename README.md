# Asva Exchange Facility

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

 - ### 1inch

This is one of the most famous names in the industry and has a great reputation for building a fast and innovative DEX aggregator. They used to have smart contract solutions which made the whole network decentralized but recently, they decided to switch to an API based service. This does present some risks in terms of transparency and security of the service. However, with their recent V3 release, 1inch claims that they are the most gas efficient and secure DEX aggregator. This claim has been made in comparison with 0X API and Uniswap router (on Ethereum). 
<br>
![1inch gas is efficient when compared with Uniswap Router and 0x Router](https://miro.medium.com/max/875/0*tAUJreUx9hD8SPay)
<br>
The algorithm behind their service is called "Pathfinder". This algorithm is available for Ethereum, BSC and Polygon (added recently). Another advantage that they offer is the possibility of reducing gas costs further by using their "Chi" gas token. They claim a gast cost reduction of upto 42% when their gas token is used along with a swap.

 - ### 0x (// TODO)

