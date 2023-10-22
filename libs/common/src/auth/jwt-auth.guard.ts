import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, map, of, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AUTH_SERVICE_NAME, AuthServiceClient } from '../types';

@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private authService: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const jwt = request.cookies?.Authentication;

    if (!jwt) {
      return false;
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    return (
      this.authService
        .authenticate({
          Authentication: jwt,
        })
        // pipe: https://rxjs.dev/api/operators/pipe pipe is a function that takes as its arguments functions with a single input and a single output and composes them into a chain.
        .pipe(
          tap((res) => {
            if (roles) {
              for (const role of roles) {
                if (!res.roles?.map((role) => role).includes(role)) {
                  this.logger.error(
                    `User ${res.id} does not have role ${role}`,
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
