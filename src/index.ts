import Fastify from 'fastify';
import { KafkaProducer  } from './workers/producer.js'


const fastify = Fastify({
								logger: true
})

const PORT = process.env.PORT || 6500;

fastify.post('/bet', async (request, reply) => {

								const { body } = request;

								try {
								
																const producer = new KafkaProducer(
																								'bets.incoming', ['PLAINTEXT://kafka-broker.railway.internal:9092'])

																await producer.connect();
																await producer.send(body);


																return 'success'

								} catch(err) {
																return `Failed ${err}`
								}


})

fastify.get('/bet/status', async (request, reply) => {

})

fastify.get('/leaderboard', async (request, reply) => {

})

fastify.get('/', async (request, reply) => {
								reply.send({ hello: 'world' })
})

const start = async () => {
								try {
																await fastify.listen({ port: PORT })
								} catch(err) {
																fastify.log(err)
																process.exit(1)
								}
}

start();
