export interface IUserCommunicator {
  /**
   * throw error if not found
   */
  getUserById(userId: number): Promise<{
    id: number;
    email: string;
  }>;

  /**
   * throw error if not found
   */
  existUserWithId(userId: number): Promise<boolean>;
}
