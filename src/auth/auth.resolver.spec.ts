import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { LoginUserInput } from './dto/login-user.input';
import { BadRequestException } from '@nestjs/common';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  const mockAuthService = {
    create: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const registerUserInput: RegisterUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthResponse: Auth = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        accessToken: 'token',
      };

      mockAuthService.create.mockResolvedValue(mockAuthResponse);

      const result = await resolver.register(registerUserInput);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.create).toHaveBeenCalledWith(registerUserInput);
    });

    it('should throw BadRequestException when registration fails', async () => {
      const registerUserInput: RegisterUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.create.mockRejectedValue(
        new BadRequestException('An account with this email already exists'),
      );

      await expect(resolver.register(registerUserInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.create).toHaveBeenCalledWith(registerUserInput);
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginUserInput: LoginUserInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthResponse: Auth = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        accessToken: 'token',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(loginUserInput);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginUserInput);
    });

    it('should throw BadRequestException when login fails', async () => {
      const loginUserInput: LoginUserInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Invalid login credentials'),
      );

      await expect(resolver.login(loginUserInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginUserInput);
    });
  });
});
