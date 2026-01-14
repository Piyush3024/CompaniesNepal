import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  ENTITY_UPLOAD_CONFIG,
  EntityName,
  FieldConfig,
} from './constants/file-upload.constants';
import { isNodeError } from 'src/common/utils/error.util';

@Injectable()
export class FileUploadService implements OnModuleInit {
  private readonly logger = new Logger(FileUploadService.name);

  constructor() {
    // Constructor stays clean and synchronous
  }

  async onModuleInit() {
    await this.ensureAllUploadDirectories();
  }

  generateFileUrl(req: Request, filePath: string | null): string | null {
    if (!filePath) return null;

    const protocol = req.protocol;
    const host = req.get('host');
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `${protocol}://${host}/${normalizedPath}`;
  }

  generateFileUrls(req: Request, filePaths: string[] | null): string[] | null {
    if (!filePaths || filePaths.length === 0) return null;
    return filePaths
      .map((path) => this.generateFileUrl(req, path))
      .filter(Boolean) as string[];
  }

  handleLocalFileUploads(req: Request): Record<string, string | string[]> {
    const uploadedFiles: Record<string, string | string[]> = {};

    if (!req.files || Object.keys(req.files).length === 0) {
      return uploadedFiles;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    for (const [fieldName, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        if (fileArray.length === 1) {
          uploadedFiles[fieldName] = fileArray[0].path;
        } else {
          uploadedFiles[fieldName] = fileArray.map((file) => file.path);
        }
      }
    }

    return uploadedFiles;
  }

  getUploadedFiles(
    files: Record<string, Express.Multer.File[]> | null | undefined,
  ): Record<string, string | string[]> {
    const uploadedFiles: Record<string, string | string[]> = {};

    if (!files || Object.keys(files).length === 0) {
      return uploadedFiles;
    }

    for (const [fieldName, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        if (fileArray.length === 1) {
          uploadedFiles[fieldName] = fileArray[0].path;
        } else {
          uploadedFiles[fieldName] = fileArray.map((file) => file.path);
        }
      }
    }

    return uploadedFiles;
  }

  async deleteFile(filePath: string | null): Promise<void> {
    if (!filePath) return;

    try {
      const fullPath = path.join(process.cwd(), filePath);
      await fs.access(fullPath);
      await fs.unlink(fullPath);
      this.logger.log(`File deleted successfully: ${fullPath}`);
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        this.logger.log(`File doesn't exist: ${filePath}`);
      } else {
        this.logger.error(`Error deleting file: ${filePath}`, error);
        throw error;
      }
    }
  }

  async deleteFiles(filePaths: string[] | string | null): Promise<void> {
    if (!filePaths) return;

    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];

    try {
      await Promise.all(paths.map((filePath) => this.deleteFile(filePath)));
    } catch (error) {
      this.logger.error('Error deleting files:', error);
      throw error;
    }
  }

  async deleteFilesFromJson(jsonString: string | null): Promise<void> {
    if (!jsonString) return;

    try {
      const parsed: unknown = JSON.parse(jsonString);

      // Type guard to validate the structure
      if (
        typeof parsed === 'string' ||
        (Array.isArray(parsed) &&
          parsed.every((item) => typeof item === 'string'))
      ) {
        await this.deleteFiles(parsed);
      } else {
        this.logger.warn('Invalid file paths format in JSON string');
      }
    } catch (error) {
      this.logger.error('Error parsing and deleting files from JSON:', error);
    }
  }
  async ensureUploadDirectories(entityName: EntityName): Promise<void> {
    const config = ENTITY_UPLOAD_CONFIG[entityName];
    if (!config) {
      this.logger.warn(
        `No upload configuration found for entity: ${entityName}`,
      );
      return;
    }

    const directories: string[] = [];

    // Add base path
    directories.push(config.basePath);

    // Add field-specific paths
    for (const field of Object.values(config.fields)) {
      const fullPath = path.join(config.basePath, field.subfolder);
      directories.push(fullPath);
    }

    // Create directories
    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }
    }
  }

  private async ensureAllUploadDirectories(): Promise<void> {
    const entityNames = Object.keys(ENTITY_UPLOAD_CONFIG) as EntityName[];

    for (const entityName of entityNames) {
      await this.ensureUploadDirectories(entityName);
    }
  }

  getUploadPath(entityName: EntityName, fieldName: string): string {
    const config = ENTITY_UPLOAD_CONFIG[entityName];
    if (!config) {
      throw new Error(
        `No upload configuration found for entity: ${entityName}`,
      );
    }

    const fieldConfig = config.fields[fieldName] as FieldConfig;
    if (!fieldConfig) {
      throw new Error(
        `No field configuration found for ${entityName}.${fieldName}`,
      );
    }

    return path.join(config.basePath, fieldConfig.subfolder);
  }

  async cleanupUploadedFiles(files: {
    [fieldname: string]: Express.Multer.File[];
  }): Promise<void> {
    const allFiles = Object.values(files).flat();

    for (const file of allFiles) {
      try {
        await this.deleteFile(file.path);
      } catch (error) {
        this.logger.error(`Error cleaning up file: ${file.path}`, error);
      }
    }
  }
}

// Pattern to follow everywhere
// try {
//   // your code
// } catch (error: unknown) {
//   if (isNodeError(error) && error.code === 'ENOENT') {
//     // handle specific error
//   } else {
//     this.logger.error('Error message', error);
//     throw error;
//   }
// }
