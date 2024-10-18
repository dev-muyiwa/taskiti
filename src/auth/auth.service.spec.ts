import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserInput } from './dto/register-user.input';
import { LoginUserInput } from './dto/login-user.input';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Auth } from './entities/auth.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    exists: jest.fn(),
    create: jest.fn(),
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if user already exists', async () => {
      mockUserService.exists.mockResolvedValue(true);

      const input: RegisterUserInput = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      await expect(authService.create(input)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.exists).toHaveBeenCalledWith(input.email);
    });

    it('should create a new user and return auth token', async () => {
      mockUserService.exists.mockResolvedValue(false);
      const mockCreatedUser = {
        id: 'some-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      mockUserService.create.mockResolvedValue(mockCreatedUser);
      mockJwtService.sign.mockReturnValue('signed-token');

      const input: RegisterUserInput = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const result = await authService.create(input);

      expect(result).toEqual({
        id: 'some-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        accessToken: 'signed-token',
      } as Auth);
      expect(userService.exists).toHaveBeenCalledWith(input.email);
      expect(userService.create).toHaveBeenCalledWith(input);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockCreatedUser.email },
        { subject: mockCreatedUser.id },
      );
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if user does not exist', async () => {
      mockUserService.findOneByEmail.mockResolvedValue(null);

      const input: LoginUserInput = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authService.login(input)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.findOneByEmail).toHaveBeenCalledWith(input.email);
    });

    it('should throw BadRequestException if password is invalid', async () => {
      const mockExistingUser = {
        id: 'some-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedpassword',
      };
      mockUserService.findOneByEmail.mockResolvedValue(mockExistingUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const input: LoginUserInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(input)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.findOneByEmail).toHaveBeenCalledWith(input.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        input.password,
        mockExistingUser.password,
      );
    });

    it('should return auth token if credentials are valid', async () => {
      const mockExistingUser = {
        id: 'some-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedpassword',
      };
      mockUserService.findOneByEmail.mockResolvedValue(mockExistingUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('signed-token');

      const input: LoginUserInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(input);

      expect(result).toEqual({
        id: 'some-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        accessToken: 'signed-token',
      } as Auth);
      expect(userService.findOneByEmail).toHaveBeenCalledWith(input.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        input.password,
        mockExistingUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockExistingUser.email },
        { subject: mockExistingUser.id },
      );
    });
  });
});
