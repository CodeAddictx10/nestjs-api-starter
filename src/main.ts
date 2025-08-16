import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning();

  const config = new DocumentBuilder()
    .setTitle('Fiescrow')
    .setDescription('The Fiescrow API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    customSiteTitle: 'Fiescrow API',
  });

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Error starting NestJS app', err);
  process.exit(1);
});
