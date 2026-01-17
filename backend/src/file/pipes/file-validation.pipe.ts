import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import {
  ENTITY_UPLOAD_CONFIG,
  EntityName,
  FieldConfig,
  FILE_TYPE_CONFIG,
  FileTypeConfig,
} from '../constants/file-upload.constants';

export interface FileValidationPipeOptions {
  entityName: EntityName;
  required?: string[]; // List of required field names
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly logger = new Logger(FileValidationPipe.name);
  private readonly entityName: EntityName;
  private readonly required: string[];

  constructor(options: FileValidationPipeOptions) {
    this.entityName = options.entityName;
    this.required = options.required || [];
  }

  async transform(files: { [fieldname: string]: Express.Multer.File[] }) {
    if (!files || Object.keys(files).length === 0) {
      if (this.required.length > 0) {
        throw new BadRequestException(
          `Required files missing: ${this.required.join(', ')}`,
        );
      }
      return files;
    }

    const entityConfig = ENTITY_UPLOAD_CONFIG[this.entityName];
    if (!entityConfig) {
      throw new BadRequestException(`Invalid entity: ${this.entityName}`);
    }

    try {
      // Check required files
      for (const requiredField of this.required) {
        if (!files[requiredField] || files[requiredField].length === 0) {
          await this.cleanupFiles(files);
          throw new BadRequestException(`${requiredField} is required`);
        }
      }

      // Validate each uploaded file
      for (const [fieldName, fileArray] of Object.entries(files)) {
        const fieldConfig = entityConfig.fields[fieldName] as FieldConfig;

        if (!fieldConfig) {
          await this.cleanupFiles(files);
          throw new BadRequestException(`Invalid field: ${fieldName}`);
        }

        // Check max files
        if (fileArray.length > fieldConfig.maxFiles) {
          await this.cleanupFiles(files);
          throw new BadRequestException(
            `Maximum ${fieldConfig.maxFiles} file(s) allowed for ${fieldName}`,
          );
        }

        // Validate each file
        const baseConfig = FILE_TYPE_CONFIG[fieldConfig.fileType];
        const fileTypeConfig: FileTypeConfig = fieldConfig.customConfig
          ? { ...baseConfig, ...fieldConfig.customConfig }
          : baseConfig;

        for (const file of fileArray) {
          this.validateFile(file, fileTypeConfig, fieldName);
        }
      }

      return files;
    } catch (error) {
      // Clean up uploaded files on validation error
      await this.cleanupFiles(files);
      throw error;
    }
  }

  private validateFile(
    file: Express.Multer.File,
    config: FileTypeConfig,
    fieldName: string,
  ): void {
    // Check file size
    if (file.size > config.MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `File ${file.originalname} in ${fieldName} exceeds maximum size of ${config.MAX_SIZE_MB}MB`,
      );
    }

    // Check MIME type
    if (!config.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type for ${fieldName}. ${config.MESSAGE}`,
      );
    }

    // Check file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !config.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file extension for ${fieldName}. ${config.MESSAGE}`,
      );
    }
  }

  private async cleanupFiles(files: {
    [fieldname: string]: Express.Multer.File[];
  }): Promise<void> {
    const allFiles = Object.values(files).flat();

    for (const file of allFiles) {
      try {
        if (fs.existsSync(file.path)) {
          await fs.promises.unlink(file.path);
          this.logger.log(`Cleaned up file: ${file.path}`);
        }
      } catch (error) {
        this.logger.error(`Error cleaning up file: ${file.path}`, error);
      }
    }
  }
}
