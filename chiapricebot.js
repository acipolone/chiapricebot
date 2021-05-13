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

	bot.guilds.cache.map((guild) => {
	  	var coindata = fetchPriceData(config.coin);
		coindata.then(function(res) {
			let priceChange = ((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*100)/100;
			if (priceChange>=0) { var status = '24h +$' + (Math.round((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*100)/100); }
			else { var status = '24h -$' + (Math.round((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*-100)/100); };
			var username = res['symbol'].toUpperCase() + ' $' + res['market_data']['current_price']['usd'];
			guild.members.cache.get(bot.user.id).setNickname(username);
			bot.user.setActivity(status, { type: "WATCHING" });
		});
	}); 
	// update every 60 seconds
	var dayMillseconds = 1000 * 60;

    setInterval(function(){ 
		bot.guilds.cache.map((guild) => {
			var coindata = fetchPriceData(config.coin);
			coindata.then(function(res) {
				let priceChange = ((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*100)/100;
				if (priceChange>=0) { var status = '24h +$' + (Math.round((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*100)/100); }
				else { var status = '24h -$' + (Math.round((res['market_data']['price_change_24h_in_currency']['usd']+Number.EPSILON)*-100)/100); };
				var username = res['symbol'].toUpperCase() + ' $' + res['market_data']['current_price']['usd'];
				guild.members.cache.get(bot.user.id).setNickname(username);
				bot.user.setActivity(status, { type: "WATCHING" });
			});
		});
	}, dayMillseconds);
});

bot.login(auth.token);

async function fetchPriceData(coin) {
	var response = await fetch('https://api.coingecko.com/api/v3/coins/'+coin+'?localization=false&community_data=false&developer_data=false&sparkline=false');
	var data = await response.json();

	return data;
}
