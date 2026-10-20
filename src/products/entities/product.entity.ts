import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { OrderItem } from '../../orders/entities/order-item.entity.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  @Column('decimal', { precision: 10, scale: 2 }) price: string;

  @Column('int', { default: 0 }) stock: number;

  @ManyToOne(() => Category, (c) => c.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Relation<Category>;

  @Column() categoryId: number;

  @OneToMany(() => OrderItem, (item) => item.product)
  items: Relation<OrderItem[]>;
}
