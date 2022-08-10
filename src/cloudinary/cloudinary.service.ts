import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { createReadStream } from 'streamifier';

@Injectable()
export class CloudinaryService {
  async streamUpload(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      let stream = v2.uploader.upload_stream((err, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(err);
        }
      });

      createReadStream(file.buffer).pipe(stream);
    });
  }

  async upload(file: Express.Multer.File) {
    const response: any = await this.streamUpload(file);
    return response.secure_url;
  }
}
