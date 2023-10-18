import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_SERVICE } from '../constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, map, of, tap } from 'rxjs';
import { UserDto } from '../dto';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const jwt = request.cookies?.Authentication;

    if (!jwt) {
      return false;
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    return (
      this.authClient
        .send('authenticate', {
          Authentication: jwt,
        })
        // pipe: https://rxjs.dev/api/operators/pipe pipe is a function that takes as its arguments functions with a single input and a single output and composes them into a chain.
        .pipe(
          tap((res: UserDto) => {
            if (roles) {
              for (const role of roles) {
                if (!res.roles?.includes(role)) {
                  this.logger.error(
                    `User ${res._id} does not have role ${role}`,
                    JwtAuthGuard.name,
                  );
                  throw new UnauthorizedException();
                }
              }
            }
            context.switchToHttp().getRequest().user = res;
          }),
          // map: https://rxjs.dev/api/operators/map map applies a given project function to each value emitted by the source Observable, and emits the resulting values as an Observable.
          map(() => true),
          catchError(() => of(false)),
        )
    );
  }
}
