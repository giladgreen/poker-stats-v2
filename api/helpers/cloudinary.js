const cloudinary = require('cloudinary');
const logger = require('../services/logger');

const testImage = '/blablayadayadayablablayadayadayablablayadayadayablablayadayadaya';

class Cloudinary {
  constructor() {
    this.cloudinary = cloudinary.v2;
    this.cloudinary.config({
      cloud_name: 'www-poker-stats-com',
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(image) {
    return new Promise(async (resolve, reject) => {
      if (image === testImage) {
        return resolve('url:.../name.png');
      }
      this.cloudinary.uploader.upload(image, async (error, result) => {
        if (error) {
          logger.error('got error from cloudinary', error.message);
          return reject(error);
        }
        logger.info('got response from cloudinary', JSON.stringify(result));
        return resolve(result.secure_url || result.secureUrl);
      });
    });
  }
}

module.exports = new Cloudinary();
