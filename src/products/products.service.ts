import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Category) private readonly cats: Repository<Category>,
    @InjectRepository(OrderItem) private readonly items: Repository<OrderItem>,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.cats.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Categorie introuvable');
    return this.products.save(
      this.products.create({
        name: dto.name,
        price: dto.price.toFixed(2),
        stock: dto.stock,
        category,
      }),
    );
  }

  async findAll(query: ListProductsQueryDto = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.products.findAndCount({
      where: query.categoryId ? { categoryId: query.categoryId } : {},
      relations: { category: true },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const product = await this.products.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (dto.categoryId !== undefined) {
      const category = await this.cats.findOneBy({ id: dto.categoryId });
      if (!category) throw new NotFoundException('Categorie introuvable');
      product.category = category;
      product.categoryId = category.id;
    }
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    if (dto.stock !== undefined) product.stock = dto.stock;
    await this.products.save(product);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const used = await this.items.countBy({ productId: id });
    if (used > 0)
      throw new ConflictException(
        'Suppression refusee: le produit figure dans des lignes de commande',
      );
    await this.products.delete(id);
    return { deleted: true, id };
  }
}
