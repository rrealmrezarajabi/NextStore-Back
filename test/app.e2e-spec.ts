import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('NextStore API (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get(JwtService);
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

    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('/api/v1/categories (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
  });

  describe('/api/v1/auth/profile (GET)', () => {
    const makeUser = () => {
      const id = Date.now();

      return {
        firstName: 'Profile',
        lastName: 'Tester',
        username: `profile_tester_${id}`,
        email: `profile-${id}@example.com`,
        password: 'secret123',
      };
    };

    const getCookie = (setCookieHeader: string | string[], name: string) => {
      const setCookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];
      const cookie = setCookies.find((item) => item.startsWith(`${name}=`));
      return cookie?.split(';')[0];
    };

    it('returns 401 without an access token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('returns 401 with an invalid access token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('returns 401 with an expired access token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 1, email: 'expired@example.com', role: 'customer' },
        { secret: 'access_secret_change_me', expiresIn: '-1s' },
      );

      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('returns the current user with a bearer access token', async () => {
      const user = makeUser();
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(user)
        .expect(201);

      const accessCookie = getCookie(
        registerResponse.headers['set-cookie'],
        'access_token',
      );

      expect(accessCookie).toBeDefined();

      const accessToken = accessCookie!.slice('access_token='.length);
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: registerResponse.body.user.id,
        email: user.email,
        username: user.username,
      });
    });

    it('returns the current user with an access_token cookie', async () => {
      const user = makeUser();
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(user)
        .expect(201);

      const accessCookie = getCookie(
        registerResponse.headers['set-cookie'],
        'access_token',
      );

      expect(accessCookie).toBeDefined();

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Cookie', accessCookie!)
        .expect(200);

      expect(response.body).toMatchObject({
        id: registerResponse.body.user.id,
        email: user.email,
        username: user.username,
      });
    });

    it('returns 401 after logout clears auth cookies', async () => {
      const agent = request.agent(app.getHttpServer());
      const user = makeUser();

      await agent.post('/api/v1/auth/register').send(user).expect(201);

      const logoutResponse = await agent
        .post('/api/v1/auth/logout')
        .expect(201);

      expect(logoutResponse.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^access_token=;/),
          expect.stringMatching(/^refresh_token=;/),
        ]),
      );

      await agent.get('/api/v1/auth/profile').expect(401);
    });
  });
});
