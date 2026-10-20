import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { OrdersService } from '../src/orders/orders.service.js';
import { Client } from '../src/clients/entities/client.entity.js';
import { Product } from '../src/products/entities/product.entity.js';
import { CustomerOrder } from '../src/orders/entities/order.entity.js';

/** Faux EntityManager en memoire: suffisant pour tester la logique metier. */
function makeManager(opts: {
  client?: object | null;
  products: Record<number, { id: number; price: string; stock: number }>;
}) {
  const stock = new Map(
    Object.values(opts.products).map((p) => [p.id, p.stock]),
  );
  const saved: unknown[] = [];
  const manager: any = {
    findOneBy: vi.fn(async (entity: unknown, where: { id: number }) => {
      if (entity === Client)
        return opts.client === undefined ? { id: where.id } : opts.client;
      if (entity === Product) return opts.products[where.id] ?? null;
      return null;
    }),
    createQueryBuilder: vi.fn(() => {
      let qty = 0;
      let id = 0;
      const qb: any = {
        update: () => qb,
        set: () => qb,
        where: (_c: string, p: { id: number; qty: number }) => {
          id = p.id;
          qty = p.qty;
          return qb;
        },
        execute: async () => {
          if ((stock.get(id) ?? 0) >= qty) {
            stock.set(id, stock.get(id)! - qty);
            return { affected: 1 };
          }
          return { affected: 0 };
        },
      };
      return qb;
    }),
    create: vi.fn((_e: unknown, data: object) => ({ ...data })),
    save: vi.fn(async (_e: unknown, data: any) => {
      saved.push(data);
      return { id: 99, ...data };
    }),
    findOneOrFail: vi.fn(async (_e: unknown, o: any) => ({
      id: o.where.id,
      items: saved.slice(1),
    })),
  };
  return { manager, stock, saved };
}

const serviceWith = (manager: object) =>
  new OrdersService({
    transaction: async (cb: (m: object) => unknown) => cb(manager),
  } as unknown as DataSource);

const products = {
  1: { id: 1, price: '100.50', stock: 8 },
  2: { id: 2, price: '40.00', stock: 12 },
};

describe('OrdersService.create', () => {
  it('cree la commande, calcule 321.00 et decremente le stock', async () => {
    const { manager, stock, saved } = makeManager({ products });
    await serviceWith(manager).create({
      clientId: 1,
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 3 },
      ],
    });
    expect((saved[0] as { total: string }).total).toBe('321.00');
    expect(stock.get(1)).toBe(6);
    expect(stock.get(2)).toBe(9);
    expect(saved).toHaveLength(3); // 1 commande + 2 lignes
  });

  it('fige le prix unitaire dans la ligne de commande', async () => {
    const { manager, saved } = makeManager({ products });
    await serviceWith(manager).create({
      clientId: 1,
      items: [{ productId: 1, quantity: 1 }],
    });
    expect((saved[1] as { unitPrice: string }).unitPrice).toBe('100.50');
  });

  it('404 si le client est inconnu', async () => {
    const { manager } = makeManager({ client: null, products });
    await expect(
      serviceWith(manager).create({
        clientId: 42,
        items: [{ productId: 1, quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('404 si le produit est inconnu', async () => {
    const { manager } = makeManager({ products });
    await expect(
      serviceWith(manager).create({
        clientId: 1,
        items: [{ productId: 77, quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('400 si le meme produit apparait deux fois', async () => {
    const { manager } = makeManager({ products });
    await expect(
      serviceWith(manager).create({
        clientId: 1,
        items: [
          { productId: 1, quantity: 1 },
          { productId: 1, quantity: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('400 si stock insuffisant, sans enregistrer de commande', async () => {
    const { manager, saved } = makeManager({ products });
    await expect(
      serviceWith(manager).create({
        clientId: 1,
        items: [{ productId: 1, quantity: 999 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(saved).toHaveLength(0);
    expect(manager.save).not.toHaveBeenCalled();
  });
});

describe('OrdersService.cancel', () => {
  it('restitue le stock et passe le statut a CANCELLED', async () => {
    const manager: any = {
      findOne: vi.fn(async () => ({ id: 5, status: 'CREATED' })),
      find: vi.fn(async () => [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 3 },
      ]),
      increment: vi.fn(),
      update: vi.fn(),
      findOneOrFail: vi.fn(async () => ({ id: 5, status: 'CANCELLED' })),
    };
    const res = await serviceWith(manager).cancel(5);
    expect(manager.increment).toHaveBeenCalledWith(
      Product,
      { id: 1 },
      'stock',
      2,
    );
    expect(manager.increment).toHaveBeenCalledWith(
      Product,
      { id: 2 },
      'stock',
      3,
    );
    expect(manager.update).toHaveBeenCalledWith(
      CustomerOrder,
      { id: 5 },
      { status: 'CANCELLED' },
    );
    expect(res.status).toBe('CANCELLED');
  });

  it('400 si la commande est deja annulee (pas de double restitution)', async () => {
    const manager: any = {
      findOne: vi.fn(async () => ({ id: 5, status: 'CANCELLED' })),
      increment: vi.fn(),
    };
    await expect(serviceWith(manager).cancel(5)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(manager.increment).not.toHaveBeenCalled();
  });
});
