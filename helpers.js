const express = require('express');
const redis = require('redis');
const BITBOXSDK = require('bitbox-sdk');
const redisClient = require('./redis-client');

const BITBOX = new BITBOXSDK();
const client = redis.createClient(process.env.REDIS_URL);


function getBlockchainInfo(){
	return new Promise(function(resolve, reject) {
		redisClient.getAsync("getBlockchainInfo").then(blockchain => {
			if(blockchain){
				resolve(JSON.parse(blockchain))
			}

			BITBOX.Blockchain.getBlockchainInfo().then(blockchain => {
				client.set('getBlockchainInfo', JSON.stringify(blockchain), 'EX', 60);
				resolve(blockchain)
			}).catch(function(err){
				reject(err);
			});
		});
    });

}

module.exports = {
	"getBlockchainInfo": getBlockchainInfo
}