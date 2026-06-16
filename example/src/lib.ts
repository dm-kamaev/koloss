type FactoryType<Instance, InputClass extends { new (...arg: any[]): Instance }> = (Class: InputClass) => Instance;

export class Factory {
  constructor(private readonly cache: Record<string, any> = {}) {}

  new<Instance, InputClass extends { new (...arg: any[]): Instance }>(
    Class: InputClass,
    createInstance: FactoryType<Instance, InputClass>,
  ): Instance {
    const result = {} as Instance;

    // We collect props using prototype chain
    const methodNames = new Set<string>();
    let proto = Class.prototype;
    while (proto && proto !== Object.prototype) {
      Object.getOwnPropertyNames(proto)
        .filter((m) => m !== 'constructor')
        .forEach((m) => methodNames.add(m));
      proto = Object.getPrototypeOf(proto);
    }

    // Old approach
    // We collect only own methods of class
    // const methodNames = Object.getOwnPropertyNames(Class.prototype).filter((m) => m !== 'constructor');
    // console.log('🚀 ~ Factory ~ new ~ methodNames:', methodNames);

    for (const methodName of methodNames) {
      const originalMethod = Class.prototype[methodName];

      Object.defineProperty(result, methodName, {
        enumerable: true,

        value: (...args: unknown[]) => {
          const instance = createInstance(Class);

          return originalMethod.apply(instance, args);
        },
      });
    }

    return result;
  }

  singleton<Instance, InputClass extends { new (...arg: any[]): Instance }>(
    Class: InputClass,
    createInstance: FactoryType<Instance, InputClass>,
  ): Instance {
    // TODO: Maybe accept cache key as parameter of method
    return this.new(Class, (Class) => {
      const key = Class.prototype.constructor.name;
      const foundInCache = this.cache[key];
      if (foundInCache) {
        console.log('FROM CACHE');
        return foundInCache;
      } else {
        console.log('SET CACHE');
        return (this.cache[key] = createInstance(Class));
      }
    });
  }
}

// Proxy version
// export function factory<T, C extends new (...args: any[]) => T>(Class: C, createInstance: (Class: C) => T): T {
//   return new Proxy(
//     {},
//     {
//       get(_, prop) {
//         const instance = createInstance(Class);
//         const value = instance[prop as keyof T];

//         if (typeof value === 'function') {
//           return value.bind(instance);
//         }

//         return value;
//       },
//     },
//   ) as T;
// }
