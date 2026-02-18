import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import slugify from "slugify";
import { PrismaService } from "../prisma/prisma.service";
import { paginate } from "../common/utils/paginate";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsQueryDto } from "./dto/products-query.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapProduct(
    product: Prisma.ProductGetPayload<{
      include: { category: true; images: true };
    }>,
  ) {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      description: product.description,
      category: product.category,
      images: product.images.map((image) => image.url),
    };
  }

  private async ensureUniqueSlug(title: string, ignoreId?: number) {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let index = 1;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug },
      });
      if (!existing || existing.id === ignoreId) {
        return slug;
      }
      slug = `${base}-${index}`;
      index += 1;
    }
  }

  async findMany(query: ProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(query.title ? { title: { contains: query.title } } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.price_min !== undefined || query.price_max !== undefined
        ? {
            price: {
              ...(query.price_min !== undefined
                ? { gte: query.price_min }
                : {}),
              ...(query.price_max !== undefined
                ? { lte: query.price_max }
                : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, images: true },
        skip,
        take: limit,
        orderBy: {
          [query.sortBy ?? "id"]: query.order ?? "asc",
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(
      items.map((item) => this.mapProduct(item)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.mapProduct(product);
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with id ${dto.categoryId} not found`,
      );
    }

    const slug = await this.ensureUniqueSlug(dto.title);

    const created = await this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        price: dto.price,
        description: dto.description,
        categoryId: dto.categoryId,
        images: {
          createMany: {
            data: dto.images.map((url) => ({ url })),
          },
        },
      },
      include: { category: true, images: true },
    });

    return this.mapProduct(created);
  }

  async update(id: number, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${dto.categoryId} not found`,
        );
      }
    }

    const slug = dto.title
      ? await this.ensureUniqueSlug(dto.title, id)
      : existing.slug;

    try {
      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          title: dto.title,
          slug,
          price: dto.price,
          description: dto.description,
          categoryId: dto.categoryId,
          ...(dto.images
            ? {
                images: {
                  deleteMany: {},
                  createMany: {
                    data: dto.images.map((url) => ({ url })),
                  },
                },
              }
            : {}),
        },
        include: { category: true, images: true },
      });

      return this.mapProduct(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Product slug already exists");
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { id, deleted: true };
  }
}
