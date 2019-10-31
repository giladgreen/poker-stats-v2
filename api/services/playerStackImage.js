const moment = require('moment');
const Jimp = require('jimp');
const fs = require('fs');
const logger = require('./logger');

const NUMBER_OF_BASE_CHIPS = 1;
const existingData = {};
const colorMappings = {
  '255.0.0': { value: 5, name: 'Red' },
  '0.255.0': { value: 25, name: 'Green' },
  '0.0.255': { value: 50, name: 'Blue' },
  '0.0.0': { value: 10, name: 'Black' },
};

function save(imageFileName, base64Data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(imageFileName, base64Data, 'base64', (err) => {
      if (err) {
        logger.error('error saving image', err);
        return reject(new Error('error saving image'));
      }
      if (!fs.existsSync(imageFileName)) {
        logger.error('failed to save file..');
        return reject(new Error('failed to save file..'));
      }
      logger.info(`file was saved:${imageFileName}`);
      return resolve();
    });
  });
}

function processImage(image, userId) {
  const { data, width, height } = image.bitmap;
  const colorsData = {};
  let blackCount = 0;

  logger.info('going over all pixels:', width, 'x', height);

  for (let i = 0; i < width * 4; i += 4) {
    for (let j = 0; j < height; j += 1) {
      const idx = i + (j * width * 4);
      const red = data[idx + 0];
      const green = data[idx + 1];
      const blue = data[idx + 2];
      if (red < 70 && blue < 70 && green < 70) {
        blackCount += 1;
      } else if (red > 240 && blue > 240 && green > 240) {
        // white
      } else {
        const color = `${red}.${green}.${blue}`;
        colorsData[color] = colorsData[color] ? colorsData[color] + 1 : 1;
      }
    }
  }

  if (existingData[userId]) {
    if (existingData[userId].expiration < (moment().toDate())) {
      existingData[userId] = null;
    }
  }
  if (!existingData[userId]) {
    existingData[userId] = {
      count: blackCount / NUMBER_OF_BASE_CHIPS,
      expiration: moment().add(10, 'hours').toDate(),
    };
  }
  const baseChipSize = existingData[userId].count;
  logger.info('base Chip Size:', baseChipSize);
  let val = 0;
  const info = Object.keys(colorsData)
    .filter(key => colorsData[key] > ((baseChipSize * 60) / 100) && colorMappings[key])
    .sort((keyA, keyB) => (colorsData[keyA] > colorsData[keyB] ? -1 : 1))
    .map((key) => {
      const count = colorsData[key];
      const obj = colorMappings[key];

      logger.info('R.G.B', key, ' count', count, ' color name:', obj.name);
      const ratio = Math.round(count / baseChipSize);

      // logger.info('count/blackCount', count, '/', baseChipSize, '=', count / baseChipSize, '     Math.round(', count / baseChipSize, ') =', ratio);
      const sumValue = obj.value * ratio;
      val += sumValue;
      return {
        pixelCount: count,
        color: obj.name,
        count: ratio,
        singleValue: obj.value,
        sumValue,
      };
    });

  logger.info('Total value: ', val);
  return {
    stack: val,
    info,
  };
}

function clerifyImage(image) {
  const ratio = image.bitmap.width / image.bitmap.height;
  const newHeight = 380;
  const newWidth = newHeight * ratio;
  const newImage = image.clone().resize(newWidth, newHeight);
  const { data, width, height } = newImage.bitmap;
  for (let i = 0; i < width * 4; i += 4) {
    for (let j = 0; j < height; j += 1) {
      const idx = i + (j * width * 4);
      const red = data[idx + 0];
      const green = data[idx + 1];
      const blue = data[idx + 2];
      const isWhite = red > 145 && blue > 145 && green > 145;
      const isRed = red < 200 && red > 50 && (red - green > 15) && (red - blue > 15);
      const isGreen = green < 200 && green > 50 && (green - red > 15) && (green - blue > 15);
      const isBlue = blue < 200 && blue > 50 && (blue - green > 15) && (blue - red > 15);
      const isBlack = (red < 70 && blue < 70 && green < 70);
      if (isWhite) {
        data[idx + 0] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
      } else if (isBlack) {
        data[idx + 0] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      } else if (isRed) {
        data[idx + 0] = 255;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      } else if (isGreen) {
        data[idx + 0] = 0;
        data[idx + 1] = 255;
        data[idx + 2] = 0;
      } else if (isBlue) {
        data[idx + 0] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 255;
      }
    }
  }
  return newImage.write('clerifyImage.png');
}

async function getImageData(image, userId) {
  const clerifiedImage = clerifyImage(image);
  return processImage(clerifiedImage, userId);
}

async function saveFileLocally(image, userId) {
  const png = image.indexOf('png;') > 0;
  const jpg = image.indexOf('jpg;') > 0;
  const jpeg = image.indexOf('jpeg;') > 0;
  const bmp = image.indexOf('bmp;') > 0;
  let base64Data = image;
  let type = 'bmp';
  if (png) {
    type = 'png';
  } else if (jpg) {
    type = 'jpg';
  } else if (jpeg) {
    type = 'jpeg';
  }
  if (png || jpg || jpeg || bmp) {
    base64Data = base64Data.replace(/^data:image\/png;base64,/, '');
    base64Data = base64Data.replace(/^data:image\/jpg;base64,/, '');
    base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, '');
    base64Data = base64Data.replace(/^data:image\/bmp;base64,/, '');
  }

  const fileName = `${userId}_image.${type}`;
  await save(fileName, base64Data);

  return Jimp.read(fileName);
}


async function handleIncomingData(image, userId) {
  try {
    const start = (new Date()).getTime();
    const newImage = await saveFileLocally(image, userId);
    const { stack, info } = await getImageData(newImage, userId);
    const end = (new Date()).getTime();
    logger.info('finished in:', end - start, 'milli');
    return {
      info,
      stack,
    };
  } catch (e) {
    throw e.message;
  }
}

module.exports = {
  handleIncomingData,
};
