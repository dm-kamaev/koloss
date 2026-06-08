export interface IOrderCommunicator {
  getCountUserOrders(userId: number): Promise<number>;
}
