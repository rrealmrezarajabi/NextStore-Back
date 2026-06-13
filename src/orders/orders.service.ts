import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { paginate } from "../common/utils/paginate";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersQueryDto } from "./dto/orders-query.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

const orderInclude = Prisma.validator<Prisma.OrderInclude>()({
  user: true,
  address: true,
  items: {
    include: {
      product: {
        include: {
          category: true,
          images: true,
        },
      },
    },
    orderBy: { id: "asc" },
  },
});

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapOrder(order: OrderWithRelations) {
    return {
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: {
        id: order.user.id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        username: order.user.username,
        name: `${order.user.firstName} ${order.user.lastName}`,
        role: order.user.role,
        email: order.user.email,
        avatar: order.user.avatar ?? "",
        password: "",
      },
      address: order.address,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.productTitle,
        productImage: item.productImage,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        product: item.product
          ? {
              id: item.product.id,
              title: item.product.title,
              slug: item.product.slug,
              price: item.product.price,
              description: item.product.description,
              category: item.product.category,
              images: item.product.images.map((image) => image.url),
            }
          : null,
      })),
    };
  }

  async createFromCart(userId: number, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: { include: { images: true } } },
        orderBy: { createdAt: "asc" },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException("Cart is empty");
      }

      if (dto.addressId) {
        const address = await tx.address.findFirst({
          where: { id: dto.addressId, userId },
        });

        if (!address) {
          throw new NotFoundException(
            `Address with id ${dto.addressId} not found`,
          );
        }
      }

      const total = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      const order = await tx.order.create({
        data: {
          userId,
          addressId: dto.addressId,
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productTitle: item.product.title,
              productImage: item.product.images[0]?.url,
              unitPrice: item.product.price,
              quantity: item.quantity,
              subtotal: item.product.price * item.quantity,
            })),
          },
        },
        include: orderInclude,
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return this.mapOrder(order);
    });
  }

  async findAll(query: OrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where: Prisma.OrderWhereInput = search
      ? {
          OR: [
            ...(Number.isFinite(Number(search))
              ? [{ id: Number(search) }, { total: Number(search) }]
              : []),
            { status: { contains: search } },
            { user: { firstName: { contains: search } } },
            { user: { lastName: { contains: search } } },
            { user: { username: { contains: search } } },
            { user: { email: { contains: search } } },
            { address: { fullName: { contains: search } } },
            { address: { phone: { contains: search } } },
            { address: { city: { contains: search } } },
            { address: { province: { contains: search } } },
            { address: { postalCode: { contains: search } } },
            { items: { some: { productTitle: { contains: search } } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where }),
    ]);

    return paginate(
      items.map((item) => this.mapOrder(item)),
      total,
      page,
      limit,
    );
  }

  async findMine(userId: number, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return paginate(
      items.map((item) => this.mapOrder(item)),
      total,
      page,
      limit,
    );
  }

  async findOneForUser(id: number, userId: number, role: string) {
    const order = await this.findRaw(id);

    if (role !== "admin" && order.userId !== userId) {
      throw new ForbiddenException("You cannot access this order");
    }

    return this.mapOrder(order);
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    await this.findRaw(id);

    const order = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: orderInclude,
    });

    return this.mapOrder(order);
  }

  private async findRaw(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }
}
