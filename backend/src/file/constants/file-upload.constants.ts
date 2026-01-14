export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export const FILE_TYPE_CONFIG = {
  [FileType.IMAGE]: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    MESSAGE:
      'Image must be a valid file (jpg, jpeg, png, gif, webp) and not exceed 5MB',
  },
  [FileType.DOCUMENT]: {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    ALLOWED_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    MESSAGE:
      'Document must be a valid file (pdf, doc, docx, xls, xlsx) and not exceed 10MB',
  },
  [FileType.VIDEO]: {
    MAX_SIZE_MB: 50,
    MAX_SIZE_BYTES: 50 * 1024 * 1024,
    ALLOWED_TYPES: ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm'],
    ALLOWED_EXTENSIONS: ['mp4', 'avi', 'mov', 'webm'],
    MESSAGE:
      'Video must be a valid file (mp4, avi, mov, webm) and not exceed 50MB',
  },
  [FileType.AUDIO]: {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    ALLOWED_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    ALLOWED_EXTENSIONS: ['mp3', 'wav', 'ogg'],
    MESSAGE: 'Audio must be a valid file (mp3, wav, ogg) and not exceed 10MB',
  },
};

// Entity-specific upload configurations
export const ENTITY_UPLOAD_CONFIG = {
  companies: {
    basePath: 'uploads/companies',
    fields: {
      logo_url: {
        subfolder: 'logo',
        fileType: FileType.IMAGE,
        maxFiles: 1,
      },
      documents_url: {
        subfolder: 'documents',
        fileType: FileType.DOCUMENT,
        maxFiles: 5,
      },
    },
  },
  products: {
    basePath: 'uploads/products',
    fields: {
      images: {
        subfolder: 'images',
        fileType: FileType.IMAGE,
        maxFiles: 10,
      },
      brochure: {
        subfolder: 'brochures',
        fileType: FileType.DOCUMENT,
        maxFiles: 1,
      },
    },
  },
  categories: {
    basePath: 'uploads/categories',
    fields: {
      image_url: {
        subfolder: 'images',
        fileType: FileType.IMAGE,
        maxFiles: 1,
      },
    },
  },
  users: {
    basePath: 'uploads/users',
    fields: {
      profile_image: {
        subfolder: 'profiles',
        fileType: FileType.IMAGE,
        maxFiles: 1,
      },
    },
  },
  // Add more entities as needed
};

export type FileTypeConfig = (typeof FILE_TYPE_CONFIG)[FileType];
export type EntityName = keyof typeof ENTITY_UPLOAD_CONFIG;
export type FieldConfig = {
  subfolder: string;
  fileType: FileType;
  maxFiles: number;
  customConfig?: Partial<FileTypeConfig>;
};
