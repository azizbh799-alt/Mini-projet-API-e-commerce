import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Client } from '../../clients/entities/client.entity.js';
import { OrderItem } from './order-item.entity.js';

@Entity('customer_orders')
export class CustomerOrder {
  @PrimaryGeneratedColumn() id: number;

  @Column({ default: 'CREATED' }) status: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 }) total: string;

  @CreateDateColumn() createdAt: Date;

  @ManyToOne(() => Client, (c) => c.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clientId' })
  client: Relation<Client>;

  @Column() clientId: number;

  @OneToMany(() => OrderItem, (i) => i.order) items: Relation<OrderItem[]>;
}
