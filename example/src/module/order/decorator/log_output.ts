export class LogOutput<T extends { act(...arg: any[]): Promise<any> }> {
  constructor(private readonly obj: T) {}
  async act(...input: Parameters<T['act']>): Promise<ReturnType<T['act']>> {
    // eslint-disable-next-line prefer-spread
    const result = await this.obj.act.apply(this.obj, input);
    console.log('Output ===>', result);
    return result;
  }
}
