import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserInput } from './dto/register-user.input';
import { LoginUserInput } from './dto/login-user.input';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async create(input: RegisterUserInput): Promise<Auth> {
    const exists = await this.userService.exists(input.email);
    if (exists) {
      throw new BadRequestException(
        'An account with this email already exists',
      );
    }

    const newUser = await this.userService.create(input);

    return {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      accessToken: this.jwtService.sign(
        { email: newUser.email },
        {
          subject: newUser.id,
        },
      ),
    } as Auth;
  }

  async login(input: LoginUserInput): Promise<Auth> {
    const existingUser = await this.userService.findOneByEmail(input.email);
    if (!existingUser) {
      throw new BadRequestException('Invalid login credentials');
    }
    const isPasswordValid = await bcrypt.compare(
      input.password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid login credentials');
    }

    return {
      id: existingUser.id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      accessToken: this.jwtService.sign(
        { email: existingUser.email },
        {
          subject: existingUser.id,
        },
      ),
    } as Auth;
  }
}
