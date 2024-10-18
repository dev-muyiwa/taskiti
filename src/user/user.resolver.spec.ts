import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { AppModule } from '../app.module';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  afterAll(async () => {
    await module.close();
  });
});
