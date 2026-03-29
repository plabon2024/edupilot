import { v2 as cloudinary } from 'cloudinary';
import { envVars } from '../config/index';

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
  api_key:    envVars.CLOUDINARY.API_KEY,
  api_secret: envVars.CLOUDINARY.API_SECRET,
});

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: string;
};

/**
 * Upload a Buffer directly to Cloudinary without saving to disk.
 * Uses upload_stream under the hood.
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  options: {
    folder?: string;
    resource_type?: 'auto' | 'image' | 'video' | 'raw';
    public_id?: string;
  } = {},
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? 'documents',
        resource_type: options.resource_type ?? 'auto',
        public_id: options.public_id,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryUploadResult);
      },
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string, resourceType: string = 'raw') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export const generateUploadSignature = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'documents' },
    envVars.CLOUDINARY.API_SECRET
  );
  return {
    timestamp,
    signature,
    cloudName: envVars.CLOUDINARY.CLOUD_NAME,
    apiKey: envVars.CLOUDINARY.API_KEY,
  };
};

export default cloudinary;
