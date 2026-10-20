import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from '../src/products/dto/create-product.dto.js';
import { CreateOrderDto } from '../src/orders/dto/create-order.dto.js';
import { CreateClientDto } from '../src/clients/dto/create-client.dto.js';
import { ListProductsQueryDto } from '../src/products/dto/list-products-query.dto.js';

const errorsOf = async <T extends object>(cls: new () => T, plain: object) =>
  validate(plainToInstance(cls, plain), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

describe('Validation des DTO', () => {
  it('accepte un produit valide', async () => {
    const errors = await errorsOf(CreateProductDto, {
      name: 'Clavier',
      price: 100.5,
      stock: 8,
      categoryId: 1,
    });
    expect(errors).toHaveLength(0);
  });

  it('refuse un prix negatif (400)', async () => {
    const errors = await errorsOf(CreateProductDto, {
      name: 'Clavier',
      price: -5,
      stock: 8,
      categoryId: 1,
    });
    expect(errors.map((e) => e.property)).toContain('price');
  });

  it('refuse une commande avec items vide (400)', async () => {
    const errors = await errorsOf(CreateOrderDto, { clientId: 1, items: [] });
    expect(errors.map((e) => e.property)).toContain('items');
  });

  it('refuse une ligne de commande avec quantite 0', async () => {
    const errors = await errorsOf(CreateOrderDto, {
      clientId: 1,
      items: [{ productId: 1, quantity: 0 }],
    });
    expect(errors).not.toHaveLength(0);
  });

  it('refuse un email invalide', async () => {
    const errors = await errorsOf(CreateClientDto, {
      fullName: 'Amira',
      email: 'pas-un-email',
    });
    expect(errors.map((e) => e.property)).toContain('email');
  });

  it('convertit page/limit de la query string en nombres', async () => {
    const dto = plainToInstance(ListProductsQueryDto, {
      categoryId: '2',
      page: '3',
      limit: '5',
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto).toMatchObject({ categoryId: 2, page: 3, limit: 5 });
  });
});
