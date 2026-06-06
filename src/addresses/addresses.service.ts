import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async create(userId: number, dto: CreateAddressDto) {
    const addressCount = await this.prisma.address.count({ where: { userId } });
    const shouldBeDefault = dto.isDefault ?? addressCount === 0;

    return this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          label: dto.label,
          fullName: dto.fullName,
          phone: dto.phone,
          province: dto.province,
          city: dto.city,
          street: dto.street,
          postalCode: dto.postalCode,
          isDefault: shouldBeDefault,
        },
      });
    });
  }

  async update(userId: number, id: number, dto: UpdateAddressDto) {
    await this.findOwnedAddress(userId, id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(userId: number, id: number) {
    const address = await this.findOwnedAddress(userId, id);
    await this.prisma.address.delete({ where: { id } });

    if (address.isDefault) {
      const nextAddress = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await this.prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { id, deleted: true };
  }

  async findOwnedAddress(userId: number, id: number) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }

    return address;
  }
}
