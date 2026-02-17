import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('NextStore API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/products (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/api/v1/categories (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
