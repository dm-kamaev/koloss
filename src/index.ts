import promiseMtd from 'promise_mtd';

// https://dev.to/vad3x/typesafe-almost-zero-cost-dependency-injection-in-typescript-112

type CreateServices<TNeeds, TServices extends object> = (needs: TNeeds) => TServices;

type Norm<T> = T extends object
  ? {
      [P in keyof T]: T[P];
    }
  : never;

// type Combine<TSource extends object, TWith extends object> = Norm<Omit<TSource, keyof TWith> & TWith>;
type Combine<TSource extends object, TWith extends object> = Norm<Omit<TSource, keyof Awaited<TWith>> & Awaited<TWith>>;

export type GetLazy<T> = () => T;

export class RegistryComposer<TNeeds extends object = object> {
  private readonly creators: CreateServices<TNeeds, object>[] = [];

  constructor() {
    // this.state = input;
  }

  add<TServices extends object>(createServices: CreateServices<TNeeds, TServices>): RegistryComposer<Combine<TNeeds, TServices>> {
    this.creators.push(createServices);

    return this as unknown as RegistryComposer<Combine<TNeeds, TServices>>;
  }

  // compose(): Readonly<TNeeds> {
  //   return Object.freeze(
  //     this.creators.reduce((state, createServices) => {
  //       return Object.assign(state, createServices(state));
  //     }, {} as any),
  //   );
  // }

  async compose(): Promise<Readonly<TNeeds>> {
    return Object.freeze(
      await promiseMtd.reduce(
        this.creators,
        async (state, createServices) => {
          return Object.assign(state, await createServices(state));
        },
        {} as any,
      ),
    );
  }
}
