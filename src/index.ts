import Fastify from 'fastify';
import { KafkaProducer  } from './workers/producer'


const fastify = Fastify({
								logger: true
})

fastify.post('/bet', async (request, reply) {

								const { body } = request;
								
								const producer = KafkaProducer(
																'bets.incoming', ['kafka.railway.internal:29092'])

								await producer.connect();
								await producer.send(body);

})

fastify.get('/bet/status', (request, reply) {

})

fastify.get('/leaderboard', (request, reply) {

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
