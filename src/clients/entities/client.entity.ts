import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { CustomerOrder } from '../../orders/entities/order.entity.js';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn() id: number;

  @Column() fullName: string;

  @Column({ unique: true }) email: string;

  @OneToMany(() => CustomerOrder, (o) => o.client)
  orders: Relation<CustomerOrder[]>;
}
