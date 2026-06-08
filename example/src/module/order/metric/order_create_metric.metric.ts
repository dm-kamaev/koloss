import { KafkaProducer } from '@/core/kafka_producer';

export class OrderCreateMetric {
  constructor(private readonly kafkaProducer = new KafkaProducer()) {}

  async act({ id, price, countProducts, createdAt }: { id: number; price: number; countProducts; createdAt: Date }) {
    await this.kafkaProducer.send({
      topic: 'order_metrics',
      data: {
        key: String(id),
        value: {
          id,
          price,
          countProducts,
          createdAt,
        },
      },
    });
  }
}
