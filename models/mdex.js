const {ChainId: mdexChain, Fetcher: mdexFetcher, TokenAmount: mdexToken} = require('@mdex/bsc-sdk');
const { web3, connection, provider } = require('../config');
const { getLatestCoinPrice } = require('../libraries');

class Mdex {
    async insertToDB(coin1Address, coin2Address, coin1Name, coin2Name, coin1Slug, coin2Slug, pair_dex_id) {
        let RECENT_COIN1_PRICE = await getLatestCoinPrice(coin1Slug);
        let RECENT_COIN2_PRICE = await getLatestCoinPrice(coin2Slug);
        let RECENT_BNB_PRICE = await getLatestCoinPrice('binancecoin')
        const AMOUNT_BNB = 100;
        const AMOUNT_COIN2 = AMOUNT_BNB * RECENT_BNB_PRICE / RECENT_COIN2_PRICE;
        const AMOUNT_COIN1_WEI = web3.utils.toWei((AMOUNT_BNB * RECENT_BNB_PRICE / RECENT_COIN1_PRICE).toString());
        const AMOUNT_COIN2_WEI = web3.utils.toWei((AMOUNT_BNB * RECENT_BNB_PRICE / RECENT_COIN2_PRICE).toString());
            
        const [coin1, coin2] = await Promise.all(
            [coin1Address, coin2Address].map(tokenAddress => (
                mdexFetcher.fetchTokenData(
                    mdexChain.MAINNET,
                    tokenAddress,
                    provider
                )
            )));
                
        const pair = await mdexFetcher.fetchPairData(
            coin1,
            coin2,
            provider
        );
    
        const mdexResults = await Promise.all([
            pair.getOutputAmount(new mdexToken(coin1, AMOUNT_COIN1_WEI)),
            pair.getOutputAmount(new mdexToken(coin2, AMOUNT_COIN2_WEI))
        ]);
    
        const mdexRates = {
            buy: parseFloat( AMOUNT_COIN1_WEI / (mdexResults[0][0].toExact() * 10 ** 18)),
            sell: parseFloat(mdexResults[1][0].toExact() / AMOUNT_COIN2),
        };
        console.log(`Mdex ${coin1Name}/${coin2Name} `);
        console.log(mdexRates);
        connection.query(
            'INSERT INTO `prices` (buy_price, sell_price, pair_dex_id) VALUES (' + parseFloat( AMOUNT_COIN1_WEI / (mdexResults[0][0].toExact() * 10 ** 18)) + ", " + parseFloat(mdexResults[1][0].toExact() / AMOUNT_COIN2) + ", " + pair_dex_id + ")",
        ); 
    }

    async displayPrices(coin1Address, coin2Address, coin1Name, coin2Name, coin1Slug, coin2Slug) {
        let RECENT_COIN1_PRICE = await getLatestCoinPrice(coin1Slug);
    let RECENT_COIN2_PRICE = await getLatestCoinPrice(coin2Slug);
    let RECENT_BNB_PRICE = await getLatestCoinPrice('binancecoin')
    const AMOUNT_BNB = 100;
    const AMOUNT_COIN2 = AMOUNT_BNB * RECENT_BNB_PRICE / RECENT_COIN2_PRICE;
    const AMOUNT_COIN1_WEI = web3.utils.toWei((AMOUNT_BNB * RECENT_BNB_PRICE / RECENT_COIN1_PRICE).toString());
    const AMOUNT_COIN2_WEI = web3.utils.toWei((AMOUNT_BNB * RECENT_BNB_PRICE / RECENT_COIN2_PRICE).toString());
        
    const [coin1, coin2] = await Promise.all(
        [coin1Address, coin2Address].map(tokenAddress => (
            mdexFetcher.fetchTokenData(
                mdexChain.MAINNET,
                tokenAddress,
                provider
            )
        )));
            
    const pair = await mdexFetcher.fetchPairData(
        coin1,
        coin2,
        provider
    );

    const mdexResults = await Promise.all([
        pair.getOutputAmount(new mdexToken(coin1, AMOUNT_COIN1_WEI)),
        pair.getOutputAmount(new mdexToken(coin2, AMOUNT_COIN2_WEI))
    ]);

    const mdexRates = {
        buy: parseFloat( AMOUNT_COIN1_WEI / (mdexResults[0][0].toExact() * 10 ** 18)),
        sell: parseFloat(mdexResults[1][0].toExact() / AMOUNT_COIN2),
    };
    console.log(`Mdex ${coin1Name}/${coin2Name} `);
    console.log(mdexRates);
    return mdexRates;
    }
}

module.exports = Mdex;