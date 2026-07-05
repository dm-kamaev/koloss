import { parseArgs } from 'node:util';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { ConsumerEntry, userConsumers } from '@/module/user/user.consumer.router';

const consumers: ConsumerEntry[] = [...userConsumers];

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

  const entry = consumers.find((c) => c.name === consumerName);

  if (!entry) {
    throw new Error(`Consumer ${consumerName} not found`);
  }

  const kafka = new Kafka({
    clientId: 'koloss-consumer',
    brokers: [process.env.KAFKA_BROKER || '127.0.0.1:9092'],
  });

  const groupConsumer = kafka.consumer({ groupId: `koloss-consumer-${entry.name}` });
  await groupConsumer.connect();

  await groupConsumer.subscribe({ topic: entry.topic, fromBeginning: false });
  console.log(`Subscribed to topic: ${entry.topic}`);

  await groupConsumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      const payload = JSON.parse(message.value!.toString()) as Record<string, unknown>;

      try {
        await entry.handler(payload);
      } catch (error) {
        console.error(`Handler for topic ${topic} failed:`, error);
      }
    },
  });

  console.log(`### Consumer ${entry.name} started ####\n\n`);

  await new Promise<void>((resolve) => {
    const shutdown = async () => {
      console.log('Shutting down consumer...');
      await groupConsumer.disconnect();
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
