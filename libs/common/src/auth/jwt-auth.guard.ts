import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AUTH_SERVICE } from '../constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, map, of, tap } from 'rxjs';
import { UserDto } from '../dto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const jwt = request.cookies?.Authentication;

    if (!jwt) {
      return false;
    }

    return (
      this.authClient
        .send('authenticate', {
          Authentication: jwt,
        })
        // pipe: https://rxjs.dev/api/operators/pipe pipe is a function that takes as its arguments functions with a single input and a single output and composes them into a chain.
        .pipe(
          tap((res: UserDto) => {
            context.switchToHttp().getRequest().user = res;
          }),
          // map: https://rxjs.dev/api/operators/map map applies a given project function to each value emitted by the source Observable, and emits the resulting values as an Observable.
          map(() => true),
          catchError(() => of(false)),
        )
    );
  }
}
