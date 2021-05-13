/*

PriceBot - Changes nickname based on crypto price from CoinGecko API

This can be adapted for any crypto by changing the crypto name in config.json to a choice from the coingecko API

*/

const Discord = require('discord.js');
const bot = new Discord.Client();

var logger = require('winston');
const fetch = require('node-fetch');

// Add token for Discord
var auth = require('./auth.json');

// Config that has coin data
var config = require('./config.json');

logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

bot.on('ready', () => {

    logger.info('Connected');
    logger.info('Logged in as: ' + bot.user.tag + ' (' + bot.user.id + ')');

	// Initial nickname change on startup
	bot.guilds.cache.map((guild) => {
		var coindata = fetchPriceData(config.coin);
		coindata.then(function(res) {
			let priceChange = ((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*100)/100;
			
			// set the status for price change, adjusting for currency symbol outside of the negative if <0
			if (priceChange>=0) { var status = '24h +$' + (Math.round((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*100)/100); }
			else { var status = '24h -$' + (Math.round((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*-100)/100); };
			
			// generate nickname of capitalized symbol and price
			var username = res['symbol'].toUpperCase() + ' $' + res['market_data']['current_price']['usd'];
			
			// set the nickname and the status
			guild.members.cache.get(bot.user.id).setNickname(username);
			bot.user.setActivity(status, { type: "WATCHING" });
		});
	});

	// update every 60 seconds
	var updateInterval = 1000 * 60;

    // using updateInterval, get coindata, then update nickname on all guilds/servers that the bot is on
	setInterval(function(){ 
		bot.guilds.cache.map((guild) => {
			var coindata = fetchPriceData(config.coin);
			coindata.then(function(res) {
				let priceChange = ((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*100)/100;
				
				// set the status for price change, adjusting for currency symbol outside of the negative if <0
				if (priceChange>=0) { var status = '24h +$' + (Math.round((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*100)/100); }
				else { var status = '24h -$' + (Math.round((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*-100)/100); };
				
				// generate nickname of capitalized symbol and price
				var username = res['symbol'].toUpperCase() + ' $' + res['market_data']['current_price']['usd'];
				
				// set the nickname and the status
				guild.members.cache.get(bot.user.id).setNickname(username);
				bot.user.setActivity(status, { type: "WATCHING" });
			});
		});
	}, updateInterval);
});

bot.login(auth.token);

// async function to get price data from coingecko API for coin,read from config
async function fetchPriceData(coin) {
	var response = await fetch('https://api.coingecko.com/api/v3/coins/'+coin+'?localization=false&community_data=false&developer_data=false&sparkline=false');
	var data = await response.json();

	return data;
}
