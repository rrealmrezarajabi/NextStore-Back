import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    FilesModule,
  ],
})
export class AppModule {}
