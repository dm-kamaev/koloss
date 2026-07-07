// export type InstanceClassStub<InputClass extends new (...args: any[]) => any> = Partial<InstanceType<InputClass>>;

// export function overridePropsOfObject<InputObject extends object>(instance: InputObject, stubs: Record<any, any>) {
//   for (const [methodName, methodFn] of Object.entries(stubs)) {
//     instance[methodName] = methodFn;
//   }
// }

export function createFunctionStub<InputOriginalFunction extends (...args: any[]) => any>(_originalFunction: InputOriginalFunction) {
  return jest.fn() as unknown as jest.Mock<ReturnType<InputOriginalFunction>, Parameters<InputOriginalFunction>>;
}
export function createClassStub<InputOriginalClass extends { new (...args: any[]): any }>(_originalClass: InputOriginalClass) {
  return jest.fn() as unknown as jest.Mock<InstanceType<InputOriginalClass>, ConstructorParameters<InputOriginalClass>>;
}

export type StubPropOfInstance<InputClass extends new (...args: any[]) => any> = Partial<InstanceType<InputClass>>;

export function createMockClass<InputClass extends new (...args: any) => any>(
  ClassOriginal: InputClass,
  stubs: StubPropOfInstance<InputClass>,
  dependencies: any[] = [],
) {
  const MockClass = class extends ClassOriginal {
    constructor(...args: any[]) {
      super(...args, ...dependencies);

      // Old approach
      // overridePropsOfObject(this, stubs);
    }
  };

  // Define stubs on prototype so Factory can discover them
  for (const [methodName, methodFn] of Object.entries(stubs)) {
    Object.defineProperty(MockClass.prototype, methodName, {
      value: methodFn,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  return MockClass;
}

export function overridePropsOfObject<InputObject extends object>(instance: InputObject, stubs: Record<any, any>) {
  for (const [methodName, methodFn] of Object.entries(stubs)) {
    (instance as any)[methodName] = methodFn;
  }
}
