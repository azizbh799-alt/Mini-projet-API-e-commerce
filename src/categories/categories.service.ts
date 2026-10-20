import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    await this.assertNameFree(dto.name);
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find({ relations: { products: true } });
  }

  async findOne(id: number) {
    const c = await this.repo.findOne({
      where: { id },
      relations: { products: true },
    });
    if (!c) throw new NotFoundException('Categorie introuvable');
    return c;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (dto.name !== undefined && dto.name !== category.name) {
      await this.assertNameFree(dto.name);
      category.name = dto.name;
    }
    await this.repo.save(category);
    return this.findOne(id);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    if (category.products.length > 0)
      throw new ConflictException(
        'Suppression refusee: la categorie contient des produits',
      );
    await this.repo.delete(id);
    return { deleted: true, id };
  }

  private async assertNameFree(name: string) {
    if (await this.repo.existsBy({ name }))
      throw new ConflictException('Une categorie porte deja ce nom');
  }
}
