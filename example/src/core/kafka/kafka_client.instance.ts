// emulation external library
class Kafka {
  send(topic: string, { key, value }: { key: string; value: string }) {
    console.log({ topic, key, value });
  }
}

export const kafkaInstance = new Kafka();
