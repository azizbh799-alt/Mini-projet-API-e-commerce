import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn() id: number;

  @Column({ unique: true }) name: string;

  @OneToMany(() => Product, (p) => p.category) products: Relation<Product[]>;
}
