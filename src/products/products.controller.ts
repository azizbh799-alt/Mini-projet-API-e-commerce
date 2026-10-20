import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un produit a une categorie' })
  @ApiResponse({ status: 201, description: 'Produit cree' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Categorie introuvable' })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les produits (filtre categoryId, pagination)',
  })
  @ApiResponse({ status: 200, description: 'Page de produits' })
  @ApiResponse({ status: 400, description: 'Parametres de requete invalides' })
  findAll(@Query() query: ListProductsQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d un produit' })
  @ApiResponse({ status: 200, description: 'Produit trouve' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un produit' })
  @ApiResponse({ status: 200, description: 'Produit modifie' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Produit ou categorie introuvable' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un produit (si jamais commande)' })
  @ApiResponse({ status: 200, description: 'Produit supprime' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  @ApiResponse({
    status: 409,
    description: 'Produit present dans des commandes',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
