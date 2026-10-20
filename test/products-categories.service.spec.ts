import 'reflect-metadata';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { ProductsService } from '../src/products/products.service.js';
import { CategoriesService } from '../src/categories/categories.service.js';
import type { Product } from '../src/products/entities/product.entity.js';
import type { Category } from '../src/categories/entities/category.entity.js';
import type { OrderItem } from '../src/orders/entities/order-item.entity.js';

const repo = <T>(over: object) => over as unknown as Repository<T>;

describe('ProductsService', () => {
  it('404 si la categorie n existe pas a la creation', async () => {
    const svc = new ProductsService(
      repo<Product>({}),
      repo<Category>({ findOneBy: vi.fn(async () => null) }),
      repo<OrderItem>({}),
    );
    await expect(
      svc.create({ name: 'X', price: 1, stock: 1, categoryId: 9 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('formate le prix avec 2 decimales a la creation', async () => {
    const create = vi.fn((x: object) => x);
    const save = vi.fn(async (x: object) => x);
    const svc = new ProductsService(
      repo<Product>({ create, save }),
      repo<Category>({ findOneBy: vi.fn(async () => ({ id: 1 })) }),
      repo<OrderItem>({}),
    );
    await svc.create({ name: 'Souris', price: 40, stock: 12, categoryId: 1 });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ price: '40.00' }),
    );
  });

  it('pagine et filtre par categorie', async () => {
    const findAndCount = vi.fn(async () => [[{ id: 1 }], 25]);
    const svc = new ProductsService(
      repo<Product>({ findAndCount }),
      repo<Category>({}),
      repo<OrderItem>({}),
    );
    const res = await svc.findAll({ categoryId: 1, page: 2, limit: 10 });
    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { categoryId: 1 }, skip: 10, take: 10 }),
    );
    expect(res).toMatchObject({ total: 25, page: 2, limit: 10, pages: 3 });
  });

  it('refuse de supprimer un produit present dans des commandes (409)', async () => {
    const svc = new ProductsService(
      repo<Product>({
        findOne: vi.fn(async () => ({ id: 1 })),
        delete: vi.fn(),
      }),
      repo<Category>({}),
      repo<OrderItem>({ countBy: vi.fn(async () => 2) }),
    );
    await expect(svc.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('CategoriesService', () => {
  it('refuse de supprimer une categorie contenant des produits (409)', async () => {
    const svc = new CategoriesService(
      repo<Category>({
        findOne: vi.fn(async () => ({
          id: 1,
          name: 'A',
          products: [{ id: 1 }],
        })),
        delete: vi.fn(),
      }),
    );
    await expect(svc.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });

  it('supprime une categorie vide', async () => {
    const del = vi.fn();
    const svc = new CategoriesService(
      repo<Category>({
        findOne: vi.fn(async () => ({ id: 1, name: 'A', products: [] })),
        delete: del,
      }),
    );
    await expect(svc.remove(1)).resolves.toEqual({ deleted: true, id: 1 });
    expect(del).toHaveBeenCalledWith(1);
  });
});
