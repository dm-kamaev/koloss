import { kafkaInstance } from './kafka_client.instance';

export class KafkaProducer {
  constructor(private readonly kafka = kafkaInstance) {}

  async send({ topic, data: { key, value } }: { topic: string; data: { key: string; value: object } }) {
    await this.kafka.send(topic, {
      key,
      value: JSON.stringify(value),
    });
  }
}
