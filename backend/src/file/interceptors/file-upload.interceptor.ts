import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  createMulterConfig,
  getMulterFields,
} from '../config/multer-config.factory';
import { EntityName } from '../constants/file-upload.constants';

export const createFileUploadInterceptor = (entityName: EntityName) => {
  const multerConfig = createMulterConfig(entityName);
  const fields = getMulterFields(entityName);

  return FileFieldsInterceptor(fields, multerConfig);
};

export const UploadEntityFiles = (entityName: EntityName) => {
  return createFileUploadInterceptor(entityName);
};
