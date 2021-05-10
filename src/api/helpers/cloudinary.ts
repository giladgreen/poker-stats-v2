import cloudinary from 'cloudinary';
import logger from '../services/logger';

const testImage = '/blablayadayadayablablayadayadayablablayadayadayablablayadayadaya';

class Cloudinary {
  private cloudinary: any;
  constructor() {
    this.cloudinary = cloudinary.v2;
    this.cloudinary.config({
      cloud_name: 'www-poker-stats-com',
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  delete(publicId:string) {
    return new Promise(async (resolve:Function, reject:Function) => {
      if (publicId === 'public_id') {
        return resolve();
      }
      this.cloudinary.uploader.destroy(publicId, (error:any, result:any) => {
        if (error) {
          logger.error('got error from cloudinary.destroy', error.message);
          return reject(error);
        }
        // logger.info('got response from cloudinary.destroy', JSON.stringify(result));
        return resolve(result);
      });
    });
  }

  upload(image:any) {
    return new Promise(async (resolve, reject) => {
      if (image === testImage) {
        return resolve({ url: 'url:.../name.png', publicId: 'public_id' });
      }
      this.cloudinary.uploader.upload(image, (error:any, result:any) => {
        if (error) {
          logger.error('got error from cloudinary.upload', error.message);
          return reject(error);
        }
        // logger.info('got response from cloudinary.upload', JSON.stringify(result));
        return resolve({ url: result.secure_url || result.secureUrl, publicId: result.public_id || result.publicId });
      });
    });
  }
}

export default new Cloudinary();
