import { Kafka } from 'kafkajs';
import type { EachMessagePayload  } from 'kafkajs';
import { workerData, parentPort  } from 'node:worker_threads';
import fs from 'fs';

const VOTE_SCRIPT_LUA = fs.readFileSync('./dist/redis/vote.lua', 'utf8');
const voteScriptSha = await redis.script("LOAD", VOTE_SCRIPT_LUA);

const kafka = new Kafka({
								clientId: 'votes-aggregator-worker-1',
								brokers: [
																process.env.KAFKA_BROKER_1 as string,
																process.env.KAFKA_BROKER_2 as string
								]
});

const consumer = kafka.consumer({ groupId : 'bets-aggregator-group' })

const run = async () => {

								try {

								await consumer.connect();
								await consumer.subscribe({ topic: 'votes.incoming', fromBeginning: true })

								await consumer.run({
																eachMessage: async (messagePayload: EachMessagePayload) => {
																								const { topic, partition, message } = messagePayload;
																								console.log({
																																value: message.value?.toString(),
																																topic,
																																partition,
																								});
																								
																								const vote = JSON.parse(message.value?.toString());

																								const numKeys = 2;
																								const lbKey   =  `leaderboard:oscars:${vote?.categoryId}`;
																								const processedKey = `votes:processed:${vote?.categoryId}`;
																								const { nomineeId , voteId } = vote;

																								try { 

																																const result = await redis.evalsha(
																																																																voteScriptSha, 
																																																																numKeys,
																																																																[lbKey, processedKey],
																																																																[nomineeId, voteId]
																																																								);

																																if (result === 0) {
																																								throw new Error('Duplicate vote detected')
																																}

																								} catch(err: any)  {
																																if (err?.message.includes('NOSCRIPT')) {
																																								const voteLuaScriptSha = await redis.script("LOAD", VOTE_SCRIPT_LUA);
																																								const result = await redis.evalsha(
																																																voteLuaScriptSha, 
																																																numKeys,
																																																[lbKey, processedKey],
																																																[nomineeId, voteId]);

																																								if (result === 0) {
																																																throw new Error('Duplicate vote detected')
																																								}

																																} else {
																																								console.log(`Vote error : ${err}`);
																																								throw err;
																																}	
																								}





																}
								})
								} catch(error) {
																console.log('Error: ', error);
																throw new Error(`Failed Reading from Kafka`);
								}
}

 const voteRedis = async (message: any) =>  {

								const vote = JSON.parse(message.value?.toString());

								const numKeys = 2;
								const lbKey   =  `leaderboard:oscars:${vote?.categoryId}`;
								const processedKey = `votes:processed:${vote?.categoryId}`;
								const { nomineeId , voteId } = vote;

								try { 

																const result = await redis.evalsha(
																																																voteScriptSha, 
																																																numKeys,
																																																[lbKey, processedKey],
																																																[nomineeId, voteId]
																																								);

																if (result === 0) {
																								throw new Error('Duplicate vote detected')
																}

								} catch(err: any)  {
																if (err?.message.includes('NOSCRIPT')) {
																								const voteLuaScriptSha = await redis.script("LOAD", VOTE_SCRIPT_LUA);
																								const result = await redis.evalsha(
																																voteLuaScriptSha, 
																																numKeys,
																																[lbKey, processedKey],
																																[nomineeId, voteId]);

																								if (result === 0) {
																																throw new Error('Duplicate vote detected')
																								}

																} else {
																								console.log(`Vote error : ${err}`);
																								throw err;
																}	
								}
}

run().catch(console.error)
