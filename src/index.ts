import Fastify from 'fastify';
import { KafkaProducer  } from './workers/producer.js'
import { Worker } from 'node:worker_threads'; 

const fastify = Fastify({
								logger: true
})

const PORT = Number(process.env.PORT) || 6500;

const consumerWorker = async () => {

								return new Promise((resolve, reject) => {
																const worker = new Worker('./workers/consumer.js');

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

fastify.post('/bet', async (request, reply) => {

								const { body } = request;

								try {
								
																const producer = new KafkaProducer(
																								'bets.incoming', [
																'PLAINTEXT://kafka-broker.railway.internal:9092',
																'PLAINTEXT_HOST://gondola.proxy.rlwy.net:28120'
																								])

																await producer.connect();
																await producer.send(body);


																return 'success'

								} catch(err) {
																return `Failed ${err}`
								}


})

fastify.get('/bet/status', async (request, reply) => {

								return 'Bet Placed successfully'

})

fastify.get('/leaderboard', async (request, reply) => {

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
