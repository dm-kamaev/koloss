export interface IOrderCommunicator {
  getAllForUser(user_id: number): Promise<
    {
      id: number;
      status: 'pending' | 'paid' | 'picking' | 'delivered' | 'completed' | 'cancelled';
      user_id: number;
      products: {
        list: Array<{
          id: number;
          price: number;
          quantity: number;
          weight: number;
        }>;
        total_price: number;
        total_weigth: number;
      };
    }[]
  >;
}
