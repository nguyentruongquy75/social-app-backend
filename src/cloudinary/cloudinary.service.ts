import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { createReadStream } from 'streamifier';

@Injectable()
export class CloudinaryService {
  async streamUpload(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      let stream = v2.uploader.upload_stream((err, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(err);
        }
      });

      createReadStream(file.buffer).pipe(stream);
    });
  }

  async upload(file: Express.Multer.File) {
    const response: any = this.streamUpload(file);
    return response;
  }

  async delete(id: string) {
    v2.uploader
      .destroy(id)
      .then(() => console.log('Delete successfully'))
      .catch(() => console.log('Delete Failed'));
  }

  async checkExist(id: string) {
    return new Promise((resolve, reject) => {
      v2.api
        .resource(id)
        .then((value) => resolve(Boolean(value)))
        .catch((err) => resolve(false));
    });
  }
}
