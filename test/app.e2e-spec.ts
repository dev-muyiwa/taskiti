import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as process from 'node:process';

describe('GraphQL e2e Tests', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          switch (key) {
            case 'mongo_uri': {
              return mongod.getUri();
            }
            case 'jwt.access_secret': {
              return 'test-secret-key';
            }
            default:
              return process.env[key];
          }
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await mongod?.stop();
  });

  describe('Auth Resolver', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            register(registerUserInput: {
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com",
              password: "password123"
            }) {
              id
              firstName
              lastName
              email
              accessToken
            }
          }
        `,
        });
      const bodyData = response.body.data.register;

      expect(response.status).toBe(200);

      expect(bodyData).toHaveProperty('id');
      expect(bodyData.firstName).toEqual('John');
      expect(bodyData.accessToken).toBeTruthy();
      expect(bodyData).not.toHaveProperty('password');
    });

    it('should log in an existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            login(loginUserInput: {
              email: "john.doe@example.com",
              password: "password123"
            }) {
              accessToken
            }
          }
        `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.login).toHaveProperty('accessToken');
    });
  });
});
