import { Kafka, Producer, Partitioners } from 'kafkajs';

export class KafkaClient {
  private readonly kafka: Kafka;
  private producer: Producer | null = null;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'koloss',
      brokers: (process.env.KAFKA_BROKER || 'localhost:9092').split(','),
      requestTimeout: 30000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  private async getProducer() {
    if (!this.producer) {
      this.producer = this.kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
      });
      await this.producer.connect();
    }

    return this.producer;
  }

  async send(topic: string, { key, value }: { key: string; value: string }): Promise<void> {
    const producer = await this.getProducer();
    await producer.send({ topic, messages: [{ key, value }] });
  }
}

export const kafkaInstance = new KafkaClient();
