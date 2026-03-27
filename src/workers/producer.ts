import { Kafka, Producer } from 'kafkajs'

export class KafkaProducer {

								private producer: Producer
								private readonly topic: string

								constructor(topic: string, brokers: string[]) {
																this.topic = topic;
																this.producer = new Kafka({
																								clientId: 'app',
																								brokers
																}).producer();
								}

								public async connect() {
																await this.producer.connect()
								}

								public async send(value: any) {
																await this.producer.send({
																								topic: this.topic,
																								messages: [ value ]
																});
								}

								public async disconnect() {
																await this.producer.disconnect()
								}
}
