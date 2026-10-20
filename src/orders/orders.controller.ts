import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Commander avec verification du stock' })
  @ApiResponse({ status: 201, description: 'Commande creee, stock decremente' })
  @ApiResponse({
    status: 400,
    description: 'Donnees invalides, doublon ou stock insuffisant',
  })
  @ApiResponse({ status: 404, description: 'Client ou produit introuvable' })
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les commandes' })
  @ApiResponse({ status: 200, description: 'Liste des commandes' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d une commande' })
  @ApiResponse({ status: 200, description: 'Commande trouvee' })
  @ApiResponse({ status: 404, description: 'Commande introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Annuler une commande et restituer le stock' })
  @ApiResponse({ status: 200, description: 'Commande annulee' })
  @ApiResponse({ status: 400, description: 'Commande deja annulee' })
  @ApiResponse({ status: 404, description: 'Commande introuvable' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(id);
  }
}
