import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { paginate } from "../common/utils/paginate";
import { CategoriesQueryDto } from "./dto/categories-query.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: CategoriesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = query.name
      ? { name: { contains: query.name } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      this.prisma.category.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async getCategoryProducts(id: number) {
    await this.findOne(id);

    const products = await this.prisma.product.findMany({
      where: { categoryId: id },
      include: { category: true, images: true },
      orderBy: { id: "asc" },
    });

    return products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      description: product.description,
      category: product.category,
      images: product.images.map((image) => image.url),
    }));
  }

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
    return { id, deleted: true };
  }
}
