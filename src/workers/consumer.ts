import { Kafka , EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
								clientId: '',
								brokers: ['']
});

const consumer = kafka.consumer({ groupId : 'betting' })

const run = async () => {

								try {

								await consumer.connect();
								await consumer.subscribe({ topic: '', fromBeginning: true })

								await consumer.run({
																eachMessage: async (messagePayload: EachMessagePayload) => {
																								const { topic, partition, message } = messagePayload;
																								console.log({
																																value: message.value?.toString(),
																																topic,
																																partition,
																								})
																}
								})
								} catch(error) {
																console.log('Error: ', error)
								}
}

run().catch(console.error)
