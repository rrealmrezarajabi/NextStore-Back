import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private mapItem(
    item: Prisma.CartItemGetPayload<{
      include: { product: { include: { category: true; images: true } } };
    }>,
  ) {
    return {
      id: item.id,
      quantity: item.quantity,
      subtotal: item.quantity * item.product.price,
      product: {
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        price: item.product.price,
        description: item.product.description,
        category: item.product.category,
        images: item.product.images.map((image) => image.url),
      },
    };
  }

  async getCart(userId: number) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { category: true, images: true } } },
      orderBy: { createdAt: "asc" },
    });

    const mappedItems = items.map((item) => this.mapItem(item));

    return {
      items: mappedItems,
      totalItems: mappedItems.reduce((sum, item) => sum + item.quantity, 0),
      total: mappedItems.reduce((sum, item) => sum + item.subtotal, 0),
    };
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${dto.productId} not found`);
    }

    await this.prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
      create: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      },
      update: {
        quantity: { increment: dto.quantity },
      },
    });

    return this.getCart(userId);
  }

  async updateItem(userId: number, id: number, dto: UpdateCartItemDto) {
    await this.findOwnedItem(userId, id);

    await this.prisma.cartItem.update({
      where: { id },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: number, id: number) {
    await this.findOwnedItem(userId, id);
    await this.prisma.cartItem.delete({ where: { id } });
    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return this.getCart(userId);
  }

  private async findOwnedItem(userId: number, id: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException(`Cart item with id ${id} not found`);
    }

    return item;
  }
}
