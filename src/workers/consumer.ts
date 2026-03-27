import { Kafka } from 'kafkajs';
import type { EachMessagePayload  } from 'kafkajs';
import { workerData, parentPort  } from 'node:worker_threads';

const kafka = new Kafka({
								clientId: 'bets-aggregator-worker-1',
								brokers: [
																'kafka-broker.railway.internal:9092',
																'gondola.proxy.rlwy.net:28120']
});

const consumer = kafka.consumer({ groupId : 'bets-aggregator-group' })

const run = async () => {

								try {

								await consumer.connect();
								await consumer.subscribe({ topic: 'bets.incoming', fromBeginning: true })

								await consumer.run({
																eachMessage: async (messagePayload: EachMessagePayload) => {
																								const { topic, partition, message } = messagePayload;
																								console.log({
																																value: message.value?.toString(),
																																topic,
																																partition,
																								})

																								parentPort?.postMessage({
																																message: message.value?.toString(),
																								});
																}
								})
								} catch(error) {
																console.log('Error: ', error)
								}
}

run().catch(console.error)
