export interface IDocumentChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
}

export interface ICreateDocumentPayload {
  userId: string;
  title: string;
  fileName: string;
  cloudinaryPublicId: string;
  filePath: string;       // Cloudinary secure_url
  fileSystemPath?: string;
  fileSize: number;
  extractedText?: string;
  chunks?: IDocumentChunk[];
}

export interface IUpdateDocumentPayload {
  title?: string;
  extractedText?: string;
  chunks?: IDocumentChunk[];
  lastAccessed?: Date;
  status?: 'PROCESSING' | 'READY' | 'FAILED';
}
