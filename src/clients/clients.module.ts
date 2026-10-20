import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity.js';
import { CustomerOrder } from '../orders/entities/order.entity.js';
import { ClientsController } from './clients.controller.js';
import { ClientsService } from './clients.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Client, CustomerOrder])],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
