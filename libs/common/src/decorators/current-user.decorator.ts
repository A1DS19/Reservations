import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../models';

const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === 'http') {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }

  // const ctx = GqlExecutionContext.create(context);
  // return ctx.getContext().user;

  const user = context.getArgs()[2].req.headers?.user;
  return user ? JSON.parse(user) : null;
};

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
