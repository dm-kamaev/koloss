export class ProductRepository {
  private products: Array<{ id: number; name: string; price: number; quantity: number }>;

  constructor() {
    this.products = [
      {
        id: 1,
        name: 'Cheese',
        price: 2.82,
        quantity: 20,
      },
      {
        id: 2,
        name: 'Wine',
        price: 8,
        quantity: 100,
      },
      {
        id: 3,
        name: 'Milk',
        price: 1.32,
        quantity: 1500,
      },
    ];
  }

  getByIds(ids: number[]) {
    const setIds = new Set(ids);
    return this.products.filter((el) => setIds.has(el.id));
  }

  getById(id: number) {
    return this.products.find((el) => el.id === id);
  }

  update(selector: { id: number }, data: Partial<(typeof this.products)[number]>) {
    for (const [i, product] of this.products.entries()) {
      if (product.id === selector.id) {
        this.products[i] = { ...product, ...data };
        break;
      }
    }
  }
}
