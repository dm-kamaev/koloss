export const orderConsumers: Record<string, (payload: Record<string, unknown>) => Promise<void>> = {
  order_metrics: async (payload) => {
    console.log('Received order_metrics:', payload);
  },
};
