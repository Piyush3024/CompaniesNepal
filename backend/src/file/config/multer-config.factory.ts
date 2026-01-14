import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  ENTITY_UPLOAD_CONFIG,
  EntityName,
  FILE_TYPE_CONFIG,
  FieldConfig,
} from '../constants/file-upload.constants';

const generateFileName = (file: Express.Multer.File): string => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = extname(file.originalname);
  return `${timestamp}-${random}${extension}`;
};

export const createMulterConfig = (entityName: EntityName): MulterOptions => {
  const entityConfig = ENTITY_UPLOAD_CONFIG[entityName];
  const fieldConfigs = entityConfig.fields as Record<string, FieldConfig>;

  if (!entityConfig) {
    throw new Error(`No upload configuration found for entity: ${entityName}`);
  }

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const fieldConfig = fieldConfigs[file.fieldname];

        if (!fieldConfig) {
          return cb(
            new BadRequestException(`Invalid field name: ${file.fieldname}`),
            '',
          );
        }

        const uploadPath = `${entityConfig.basePath}/${fieldConfig.subfolder}`;
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const fileName = generateFileName(file);
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const fieldConfig = fieldConfigs[file.fieldname];

      if (!fieldConfig) {
        return cb(
          new BadRequestException(`Invalid field name: ${file.fieldname}`),
          false,
        );
      }

      // Get file type configuration
      const fileTypeConfig =
        fieldConfig.customConfig || FILE_TYPE_CONFIG[fieldConfig.fileType];

      if (!fileTypeConfig) {
        return cb(
          new BadRequestException('Invalid file type configuration'),
          false,
        );
      }

      // Check MIME type
      if (
        fileTypeConfig &&
        fileTypeConfig.ALLOWED_TYPES &&
        !fileTypeConfig.ALLOWED_TYPES.includes(file.mimetype)
      ) {
        return cb(new BadRequestException(fileTypeConfig.MESSAGE), false);
      }

      // Check file extension
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      if (
        !fileExtension ||
        (fileTypeConfig.ALLOWED_EXTENSIONS &&
          !fileTypeConfig.ALLOWED_EXTENSIONS.includes(fileExtension))
      ) {
        return cb(new BadRequestException(fileTypeConfig.MESSAGE), false);
      }

      cb(null, true);
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max (will be validated per field in pipe)
      files: 20, // Max files total
    },
  };
};

export const getMulterFields = (
  entityName: EntityName,
): { name: string; maxCount: number }[] => {
  const entityConfig = ENTITY_UPLOAD_CONFIG[entityName];

  if (!entityConfig) {
    throw new Error(`No upload configuration found for entity: ${entityName}`);
  }

  return Object.entries(entityConfig.fields).map(([fieldName, config]) => ({
    name: fieldName,
    maxCount: config.maxFiles,
  }));
};
