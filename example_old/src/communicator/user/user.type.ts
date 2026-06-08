export interface IUserCommunicator {
  getUsersByIds(userIds: number[]): Promise<
    {
      id: number;
      first_name: string;
      last_name: string;
    }[]
  >;
}
