import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CustomerOrder } from './order.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn() id: number;

  @Column('int') quantity: number;

  @Column('decimal', { precision: 10, scale: 2 }) unitPrice: string;

  @ManyToOne(() => CustomerOrder, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Relation<CustomerOrder>;

  @Column() orderId: number;

  @ManyToOne(() => Product, (p) => p.items, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product: Relation<Product>;

  @Column() productId: number;
}
