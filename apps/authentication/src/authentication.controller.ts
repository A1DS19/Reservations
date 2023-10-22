import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@app/common/models/user.entity';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
} from '@app/common';
import { Payload } from '@nestjs/microservices';

@Controller('auth')
@AuthServiceControllerMethods()
export class AuthenticationController implements AuthServiceController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authenticationService.login(user, res);
    res.send(user);
  }

  //Use MessagePattern when you need to handle a request and provide a response, similar to a traditional function call but over a network.
  @UseGuards(JwtAuthGuard)
  async authenticate(@Payload() payload: any) {
    return payload.user;
  }
}
