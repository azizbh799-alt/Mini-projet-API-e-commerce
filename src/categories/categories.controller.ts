import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Creer une categorie' })
  @ApiResponse({ status: 201, description: 'Categorie creee' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 409, description: 'Nom deja utilise' })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les categories et produits' })
  @ApiResponse({ status: 200, description: 'Liste des categories' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d une categorie' })
  @ApiResponse({ status: 200, description: 'Categorie trouvee' })
  @ApiResponse({ status: 404, description: 'Categorie introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une categorie' })
  @ApiResponse({ status: 200, description: 'Categorie modifiee' })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Categorie introuvable' })
  @ApiResponse({ status: 409, description: 'Nom deja utilise' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une categorie (si sans produit)' })
  @ApiResponse({ status: 200, description: 'Categorie supprimee' })
  @ApiResponse({ status: 404, description: 'Categorie introuvable' })
  @ApiResponse({
    status: 409,
    description: 'La categorie contient des produits',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
