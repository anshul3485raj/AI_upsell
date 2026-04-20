import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from 'cookie-parser';
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.use(
    json({
      verify: (req, _res, buf: Buffer) => {
        (req as Express.Request).rawBody = Buffer.from(buf);
      },
    }),
  );
  app.use(
    urlencoded({
      extended: true,
      verify: (req, _res, buf: Buffer) => {
        (req as Express.Request).rawBody = Buffer.from(buf);
      },
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = configService.get<number>("PORT", 4000);
  await app.listen(port);
}

void bootstrap();
