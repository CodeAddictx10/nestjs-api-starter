/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  applyDecorators,
  UseInterceptors,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Observable, catchError } from 'rxjs';
import { diskStorage, memoryStorage, StorageEngine, MulterError } from 'multer';
import { extname, join } from 'path';
import * as multer from 'multer';

// Configuration interface
export interface FileUploadConfig {
  fieldName: string;
  maxCount?: number;
  maxSize?: number; // in MB
  allowedExtensions?: string[];
  storageType?: 'disk' | 'memory';
  destination?: string;
  preserveOriginalName?: boolean;
  generateUniqueNames?: boolean;
}

// Default configuration
const DEFAULT_FILE_CONFIG: Partial<FileUploadConfig> = {
  maxCount: 10,
  maxSize: 1, // 1MB
  allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  storageType: 'disk',
  destination: join(process.cwd(), 'uploads'),
  preserveOriginalName: true,
  generateUniqueNames: false,
};

// Error interceptor
@Injectable()
export class FileUploadErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof MulterError) {
          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              throw new BadRequestException(
                'File size exceeds the allowed limit',
              );
            case 'LIMIT_FILE_COUNT':
              throw new BadRequestException('Too many files uploaded');
            case 'LIMIT_UNEXPECTED_FILE':
              throw new BadRequestException('Unexpected file field');
            default:
              throw new BadRequestException(
                `File upload error: ${error.message}`,
              );
          }
        }

        // Handle custom file filter errors
        if (error.message && error.message.includes('extensions are allowed')) {
          throw new BadRequestException(error.message);
        }

        throw error;
      }),
    );
  }
}

// Configuration creator function
function createFileUploadConfig(config: FileUploadConfig) {
  const finalConfig = { ...DEFAULT_FILE_CONFIG, ...config };

  const storage: StorageEngine =
    finalConfig.storageType === 'memory'
      ? memoryStorage()
      : diskStorage({
          destination: finalConfig.destination,
          filename: (req, file, callback) => {
            if (finalConfig.generateUniqueNames) {
              const uniqueSuffix =
                Date.now() + '-' + Math.round(Math.random() * 1e9);
              const ext = extname(file.originalname);
              const name = file.originalname.replace(ext, '');
              callback(null, `${name}-${uniqueSuffix}${ext}`);
            } else {
              callback(
                null,
                finalConfig.preserveOriginalName
                  ? file.originalname
                  : file.fieldname,
              );
            }
          },
        });

  return {
    storage,
    limits: {
      fileSize: (finalConfig.maxSize || 1) * 1024 * 1024, // Convert MB to bytes
      files: finalConfig.maxCount,
    },
    fileFilter: (
      req: Express.Request,
      file: Express.Multer.File,
      callback: multer.FileFilterCallback,
    ) => {
      if (
        finalConfig.allowedExtensions &&
        finalConfig.allowedExtensions.length > 0
      ) {
        const fileExt = extname(file.originalname).toLowerCase().substring(1);
        const allowedExts = finalConfig.allowedExtensions.map((ext) =>
          ext.toLowerCase(),
        );

        if (!allowedExts.includes(fileExt)) {
          const error = new Error(
            `Only files with ${finalConfig.allowedExtensions.join(', ')} extensions are allowed`,
          );
          return callback(error);
        }
      }
      callback(null, true);
    },
  };
}

// Main decorator
export function FileUpload(config: FileUploadConfig) {
  const multerConfig = createFileUploadConfig(config);

  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(config.fieldName, config.maxCount || 10, multerConfig),
      FileUploadErrorInterceptor,
    ),
  );
}
