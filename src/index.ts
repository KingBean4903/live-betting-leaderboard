import Fastify from 'fastify';
import { KafkaProducer  } from './workers/producer.js'


const fastify = Fastify({
								logger: true
})

fastify.post('/bet', async (request, reply) => {

								const { body } = request;
								
								const producer = new KafkaProducer(
																'bets.incoming', ['PLAINTEXT://kafka-broker.railway.internal:9092'])

								await producer.connect();
								await producer.send(body);

								return 'success'

})

fastify.get('/bet/status', (request, reply) => {

})

fastify.get('/leaderboard', (request, reply) => {

})

fastify.get('/', function(request, reply) {
								reply.send({ hello: 'world' })
})

fastify.listen({ port: 3000 }, function(err ,address) {

								if (err) {
																fastify.log.error(err)
																process.exit()
								}
})
