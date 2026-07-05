import { parseArgs } from 'node:util';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { orderConsumers } from '@/module/order/order.consumer.router';
import { userConsumers } from '@/module/user/user.consumer.router';

const consumers: Record<string, (payload: Record<string, unknown>) => Promise<void>> = {
  ...orderConsumers,
  ...userConsumers,
};

export async function startConsumer(args: string[] = process.argv): Promise<void> {
  const { positionals } = parseArgs({
    args: args.slice(2),
    allowPositionals: true,
    strict: false,
  });

  const consumerName = positionals[0];

  if (!consumerName) {
    console.error('Consumer name is required');
    process.exit(1);
  }

  const handler = consumers[consumerName];

  if (!handler) {
    throw new Error(`Consumer ${consumerName} not found`);
  }

  const kafka = new Kafka({
    clientId: 'koloss-consumer',
    brokers: [process.env.KAFKA_BROKER || '127.0.0.1:9092'],
  });

  const consumer = kafka.consumer({ groupId: `koloss-consumer-${consumerName}` });
  await consumer.connect();

  await consumer.subscribe({ topic: consumerName, fromBeginning: false });
  console.log(`Subscribed to topic: ${consumerName}`);

  await consumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      const payload = JSON.parse(message.value!.toString()) as Record<string, unknown>;

      try {
        await handler(payload);
      } catch (error) {
        console.error(`Handler for topic ${topic} failed:`, error);
      }
    },
  });

  console.log(`Consumer ${consumerName} started`);

  await new Promise<void>((resolve) => {
    const shutdown = async () => {
      console.log('Shutting down consumer...');
      await consumer.disconnect();
      resolve();
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  });
}

async function runConsumer() {
  try {
    await startConsumer();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  runConsumer();
}
