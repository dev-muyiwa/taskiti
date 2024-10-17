import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { LoginUserInput } from './dto/login-user.input';
import { SkipAuthorization } from './guards/jwt.guard';

@Resolver(() => Auth)
@SkipAuthorization()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth)
  async register(
    @Args('registerUserInput') registerUserInput: RegisterUserInput,
  ) {
    return this.authService.create(registerUserInput);
  }

  @Mutation(() => Auth)
  async login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.authService.login(loginUserInput);
  }
}
