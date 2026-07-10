import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, lstatSync } from 'fs';
import express from 'express';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Smart media redirect middleware: serve locally if exists, redirect to production if not
  app.use('/uploads', (req, res, next) => {
    const cleanPath = req.path.split('?')[0];
    const localFilePath = join(uploadsDir, cleanPath);
    
    if (existsSync(localFilePath) && !lstatSync(localFilePath).isDirectory()) {
      return res.sendFile(localFilePath);
    }
    
    // Redirect to production backend for media uploaded in production
    const prodUrl = `http://e7nama3ak.runasp.net/uploads${req.url}`;
    return res.redirect(prodUrl);
  });

  app.use('/images', (req, res, next) => {
    const cleanPath = req.path.split('?')[0];
    // Strip '/posts/' if present to avoid path duplication (uploads/posts/posts/filename)
    const filename = cleanPath.startsWith('/posts/') ? cleanPath.replace(/^\/posts\//, '') : cleanPath;
    const localFilePath = join(uploadsDir, 'posts', filename);
    
    if (existsSync(localFilePath) && !lstatSync(localFilePath).isDirectory()) {
      return res.sendFile(localFilePath);
    }
    
    const prodUrl = `http://e7nama3ak.runasp.net/images${req.url}`;
    return res.redirect(prodUrl);
  });

  // CORS
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3002,http://localhost:3003')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // API prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`✅ Application running on http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
