import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CategoriesQueryDto } from './dto/categories-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query() query: CategoriesQueryDto) {
    return this.categoriesService.findMany(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/products')
  async categoryProducts(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getCategoryProducts(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  async updatePut(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  async updatePatch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
