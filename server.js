const express = require('express');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const BITBOXSDK = require('bitbox-sdk');
const BITBOX = new BITBOXSDK();
const app = express();

const redisClient = require('./redis-client');
const helpers = require('./helpers')

app.get('/', (req, res) => {
	return res.json({});
});

app.get('/blockchain-info', (req, res) => {
	helpers.getBlockchainInfo().then(blockchain => {
		return res.json(blockchain)
	}).catch(function(err){
		console.log(err)
		res.status(500);
		return res.json({});
	})
});

app.get('/latest-blocks', (req, res) => {
	helpers.getBlockchainInfo().then(blockchain => {
		console.log("BLOCKCHIAN")
		console.log(blockchain)
		console.log(blockchain.bestblockhash)
		console.log(typeof blockchain.bestblockhash)
		BITBOX.Blockchain.getBlock(blockchain.bestblockhash).then(block => {
			console.log("BLOCK")
			console.log(block);
		}).catch(function(err){
			console.log(err)
		})

	}).catch(function(err){
		console.log(err)
	})
	return res.json({});
});


app.get('/mempool', (req, res) => {
	redisClient.getAsync("mempool").then(rawMempool => {
		if(rawMempool){
			return res.json(JSON.parse(rawMempool));
		}

		BITBOX.Blockchain.getRawMempool(true).then(mempool => {
			client.set('mempool', JSON.stringify(mempool), 'EX', 10);
			return res.json(mempool);
		}).catch(function(err){
			console.log(err)
			res.status(500);
			return res.json({});
		});

	}).catch(function(err){
		console.log(err)
		res.status(500);
		return res.json({});
	});
});


app.get('/mempool-info', (req, res) => {
	redisClient.getAsync("mempoolInfo").then(rawMempool => {
		if(rawMempool){
			return res.json(JSON.parse(rawMempool));
		}

		BITBOX.Blockchain.getMempoolInfo().then(mempool => {
			client.set('mempoolInfo', JSON.stringify(mempool), 'EX', 10);
			return res.json(mempool);
		}).catch(function(err){
			console.log(err)
			res.status(500);
			return res.json({});
		});

	}).catch(function(err){
		console.log(err)
		res.status(500);
		return res.json({});
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
