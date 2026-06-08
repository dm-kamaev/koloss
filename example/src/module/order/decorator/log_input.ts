export class LogInput<T extends { act(...arg: any[]): Promise<any> }> {
  constructor(private readonly obj: T) {}
  async act(...input: Parameters<T['act']>): Promise<ReturnType<T['act']>> {
    console.log('Input ===>', input);
    // eslint-disable-next-line prefer-spread
    return await this.obj.act.apply(this.obj, input);
  }
}
