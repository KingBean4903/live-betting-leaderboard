import { Kafka } from 'kafkajs'
import type {  Producer } from 'kafkajs'

export class KafkaProducer {

								private producer: Producer
								private readonly topic: string

								constructor(topic: string, brokers: string[]) {
																this.topic = topic;
																this.producer = new Kafka({
																								clientId: 'votes-api-producer-1',
																								brokers
																}).producer();
								}

								public async connect() {
																await this.producer.connect()
								}

								public async send(value: any, key: string = "aviator") {
																await this.producer.send({
																								topic: this.topic,
																								messages: [ { "key": key, "value": value.toString() } ]
																});
								}

								public async disconnect() {
																await this.producer.disconnect()
								}
}
