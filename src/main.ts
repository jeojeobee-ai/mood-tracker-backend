import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  app.enableCors();
  await app.listen(4000);
  console.log('백엔드 실행 중: http://localhost:4000');
}
bootstrap();
