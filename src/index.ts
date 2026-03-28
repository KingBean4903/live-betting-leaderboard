import Fastify from 'fastify';
import { KafkaProducer  } from './workers/producer.js'
import { Worker } from 'node:worker_threads'; 
import { redis } from './redis/redis.js';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
								logger: true
})

const PORT = Number(process.env.PORT) || 6500;

const consumerWorker = async () => {

								return new Promise((resolve, reject) => {
																const worker = new Worker('./dist/workers/consumer.js');

																worker.on('message', resolve);
																worker.on('error', reject);

																worker.on('exit', (code) => {
																								if (code  !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
																})
								});
};

async function runConsumer() {
								try {
																const result = await consumerWorker();
																console.log(`Worker result  ${result}`);
								} catch (err) {
																console.error(`Worker error:  ${err}`)
								}
}

fastify.post('/api/vote', async (request, reply) => {

								const { body } = request;

								try {
								
																const producer = new KafkaProducer(
																								'votes.incoming', 
																								[
																																process.env.KAFKA_BROKER_1 as string,
																																process.env.KAFKA_BROKER_2 as string,
																								])

																await producer.connect();
																await producer.send(body, "aviator");


												return { 
																								"status"  : "success", 
																								"message" : "Vote Counted" 
																}
								} catch(err) {
																return { "status" : 404, "message": `${err}` }
								}


})

fastify.get('/api/leaderboard/:categoryId', async (request, reply) => {
								
								const { categoryId } = request.params;

								const key = `leaderboard:oscars:${categoryId}` 
								const top10 = await redis.zrevrange(key, 0 , 9, "WITHSCORES")

								return {
																"categoryId": categoryId,
																"top" : top10,
								}
								
})


fastify.get('/', async (request, reply) => {
								reply.send({ hello: 'world' })
})

const start = async () => {
								try {
																await fastify.listen({ 
																								port: PORT,
																								host: '0.0.0.0'
																})
								} catch(err) {
																fastify.log.error(err)
																process.exit(1)
								}
}

start();
runConsumer().catch(err => console.error(err));
