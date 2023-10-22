import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AuthenticationModule);
  const configService = app.get(ConfigService);
  // connect microservice
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, '../../../proto/authentication.proto'),
      url: configService.getOrThrow('AUTH_GRPC_URL'),
    },
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove unknown properties from DTOs
    }),
  );
  app.useLogger(app.get(Logger));

  // start microservice
  await app.startAllMicroservices();
  await app.listen(configService.get('HTTP_PORT'));
}
bootstrap();
