import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Creer un client' })
  @ApiResponse({ status: 201, description: 'Client cree' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 409, description: 'Email deja utilise' })
  create(@Body() dto: CreateClientDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les clients' })
  @ApiResponse({ status: 200, description: 'Liste des clients' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d un client' })
  @ApiResponse({ status: 200, description: 'Client trouve' })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Commandes d un client avec leurs lignes' })
  @ApiResponse({ status: 200, description: 'Commandes du client' })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  findOrders(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOrders(id);
  }
}
