import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/utils/paginate';
import { AppRole } from '../common/types/role.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersQueryDto } from './dto/users-query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  sanitize(user: User) {
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      avatar: user.avatar,
      password: '',
    };
  }

  async findMany(query: UsersQueryDto) {
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const isFlat = query.flat !== 'false';

    const where: Prisma.UserWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search } },
            { email: { contains: query.search } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = items.map((user) => this.sanitize(user));

    if (isFlat) {
      return data;
    }

    return paginate(data, total, offset, limit);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.sanitize(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdRaw(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        avatar: dto.avatar,
        role: dto.role ?? ('customer' as AppRole),
        passwordHash,
      },
    });

    return this.sanitize(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findByIdRaw(id);

    if (dto.email) {
      const emailOwner = await this.findByEmail(dto.email);
      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const data: Prisma.UserUpdateInput = {
      name: dto.name,
      email: dto.email,
      avatar: dto.avatar,
      role: dto.role,
    };

    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.sanitize(updated);
  }

  async remove(id: number) {
    await this.findByIdRaw(id);
    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }

  async setRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.findByIdRaw(userId);
    if (!user.refreshTokenHash) {
      return false;
    }
    return bcrypt.compare(refreshToken, user.refreshTokenHash);
  }
}
