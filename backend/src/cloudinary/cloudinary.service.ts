import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

export enum FileUploadType {
  AVATAR = 'avatars',
  MESSAGE_IMAGE = 'messages/images',
  MESSAGE_VIDEO = 'messages/videos',
  MESSAGE_AUDIO = 'messages/audio',
  MESSAGE_FILE = 'messages/files'
}

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File, folderType: FileUploadType = FileUploadType.AVATAR): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadOptions: any = {
        folder: `yuna-talk/${folderType}`,
      };

      // Apply transformations based on file type
      if (folderType === FileUploadType.AVATAR) {
        uploadOptions.transformation = [
          { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }
        ];
      } else if (folderType === FileUploadType.MESSAGE_IMAGE) {
        uploadOptions.transformation = [
          { width: 800, quality: 'auto' }
        ];
      } else if (folderType === FileUploadType.MESSAGE_VIDEO) {
        uploadOptions.resource_type = 'video';
        uploadOptions.transformation = [
          { width: 800, quality: 'auto' }
        ];
      } else if (folderType === FileUploadType.MESSAGE_AUDIO) {
        uploadOptions.resource_type = 'auto';
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed: no result from Cloudinary'));
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // Upload multiple file types with type detection
  async uploadMessageFile(file: Express.Multer.File, fileType: 'image' | 'video' | 'audio' | 'file'): Promise<CloudinaryResponse> {
    let folderType: FileUploadType;

    switch (fileType) {
      case 'image':
        folderType = FileUploadType.MESSAGE_IMAGE;
        break;
      case 'video':
        folderType = FileUploadType.MESSAGE_VIDEO;
        break;
      case 'audio':
        folderType = FileUploadType.MESSAGE_AUDIO;
        break;
      case 'file':
      default:
        folderType = FileUploadType.MESSAGE_FILE;
    }

    return this.uploadFile(file, folderType);
  }
}
