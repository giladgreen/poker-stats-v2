const moment = require('moment');
const Jimp = require('jimp');
const fs = require('fs');
const cannyEdgeDetector = require('canny-edge-detector');
const { Image } = require('image-js');
const { badRequest } = require('boom');
const logger = require('./logger');
const ColorsService = require('../helpers/colors');

const WHITE = 255;
const BLACK = 0;
const GRAY = 90;
const RED = 180;
const GREEN = 180;
const BLUE = 180;

const existingData = {};
const colorMappings = {
  White: { value: 0, name: 'White' },
  Gray: { value: 1, name: 'Gray' },
  Red: { value: 5, name: 'Red' },
  Black: { value: 10, name: 'Black' },
  Green: { value: 25, name: 'Green' },
  Blue: { value: 50, name: 'Blue' },
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

function processImage(colorsData, userId, baseChipColor, numberOfBaseChips) {
  if (existingData[userId]) {
    if (existingData[userId].expiration < (moment().toDate())) {
      existingData[userId] = null;
    }
  }
  if (!existingData[userId]) {
    if (colorsData[baseChipColor] === 0) {
      throw badRequest(`Did not found any ${baseChipColor} chips`, { });
    }
    existingData[userId] = {
      count: colorsData[baseChipColor] / numberOfBaseChips,
      expiration: moment().add(10, 'hours').toDate(),
    };
  }
  const baseChipSize = existingData[userId].count;
  if (baseChipSize === 0) {
    throw badRequest(`Did not found any ${baseChipColor} chips`, { });
  }
  logger.info(`base chip color: ${baseChipColor}, number of base chips:${numberOfBaseChips}, base Chip pixel count: ${baseChipSize}`);
  let val = 0;
  const info = Object.keys(colorsData)
    .filter(key => colorsData[key] > ((baseChipSize * 60) / 100))
    .sort((keyA, keyB) => (colorsData[keyA] > colorsData[keyB] ? -1 : 1))
    .map((key) => {
      const count = colorsData[key];

      const ratio = Math.round(count / baseChipSize);
      const { value } = colorMappings[key];
      const sumValue = value * ratio;
      val += sumValue;
      return {
        color: key,
        count: ratio,
        singleValue: value,
        sumValue,
      };
    });

  logger.info('Total value: ', val);
  return {
    stack: val,
    info,
  };
}

function clerifyImageAndCount(image) {
  function _isGray(red, green, blue) {
    return ColorsService.rgbName(red, green, blue).toLowerCase().indexOf('gray') >= 0;
  }
  function _isRed(red, green, blue) {
    return ColorsService.rgbName(red, green, blue).toLowerCase().indexOf('red') >= 0;
  }
  function _isGreen(red, green, blue) {
    return ColorsService.rgbName(red, green, blue).toLowerCase().indexOf('green') >= 0;
  }
  function _isBlue(red, green, blue) {
    return ColorsService.rgbName(red, green, blue).toLowerCase().indexOf('blue') >= 0;
  }
  function _isBlack(red, green, blue) {
    return ColorsService.rgbName(red, green, blue).toLowerCase().indexOf('black') >= 0;
  }

  const ratio = image.bitmap.width / image.bitmap.height;
  const newHeight = 380;
  const newWidth = newHeight * ratio;
  const newImage = image.clone().resize(newWidth, newHeight).contrast(0.15).brightness(0.2)
    .write('output/1.png');

  const colorsData = {
    Gray: 0,
    Red: 0,
    Black: 0,
    Green: 0,
    Blue: 0,
  };
  const { data, width, height } = newImage.bitmap;

  function updateData(Data, w, h) {
    for (let i = 0; i < w * 4; i += 4) {
      for (let j = 0; j < h; j += 1) {
        const idx = i + (j * w * 4);
        const red = Data[idx + 0];
        const green = Data[idx + 1];
        const blue = Data[idx + 2];

        const isGray = _isGray(red, green, blue);
        const isRed = _isRed(red, green, blue);
        const isGreen = _isGreen(red, green, blue);
        const isBlue = _isBlue(red, green, blue);
        const isBlack = _isBlack(red, green, blue);


        if (isRed) {
          Data[idx + 0] = RED;
          Data[idx + 1] = 0;
          Data[idx + 2] = 0;
        } else if (isGreen) {
          Data[idx + 0] = 0;
          Data[idx + 1] = GREEN;
          Data[idx + 2] = 0;
        } else if (isBlue) {
          Data[idx + 0] = 0;
          Data[idx + 1] = 0;
          Data[idx + 2] = BLUE;
        } else if (isGray) {
          Data[idx + 0] = GRAY;
          Data[idx + 1] = GRAY;
          Data[idx + 2] = GRAY;
        } else if (isBlack) {
          Data[idx + 0] = BLACK;
          Data[idx + 1] = BLACK;
          Data[idx + 2] = BLACK;
        } else {
          Data[idx + 0] = WHITE;
          Data[idx + 1] = WHITE;
          Data[idx + 2] = WHITE;
        }
      }
    }
  }
  function getColorsData(Data, w, h) {
    for (let i = 0; i < w * 4; i += 4) {
      for (let j = 0; j < h; j += 1) {
        const idx = i + (j * w * 4);
        const red = Data[idx + 0];
        const green = Data[idx + 1];
        const blue = Data[idx + 2];

        const isGray = red === GRAY && green === GRAY && blue === GRAY;
        const isRed = red === RED && green === 0 && blue === 0;
        const isGreen = red === 0 && green === GREEN && blue === 0;
        const isBlue = red === 0 && green === 0 && blue === BLUE;
        const isBlack = red === BLACK && green === BLACK && blue === BLACK;

        colorsData.Gray += isGray ? 1 : 0;
        colorsData.Black += isBlack ? 1 : 0;
        colorsData.Red += isRed ? 1 : 0;
        colorsData.Green += isGreen ? 1 : 0;
        colorsData.Blue += isBlue ? 1 : 0;
      }
    }
  }

  updateData(data, width, height);

  newImage.write('output/2.png');
  getColorsData(data, width, height);

  logger.debug('colorsData', colorsData);
  return colorsData;
}

async function getImageData(image, userId, baseChipColor, numberOfBaseChips) {
  const colorsData = clerifyImageAndCount(image, userId);
  return processImage(colorsData, userId, baseChipColor, numberOfBaseChips);
}

function getCropDimentions(croppedGreyscale) {
  let mostLeftWhitePixelIndex = croppedGreyscale.bitmap.width + 2;
  let mostTopWhitePixelIndex = croppedGreyscale.bitmap.height + 2;

  let mostRigthWhitePixelIndex = -1;
  let mostBottomWhitePixelIndex = -1;

  for (let i = 0; i < croppedGreyscale.bitmap.width * 4; i += 4) {
    for (let j = 0; j < croppedGreyscale.bitmap.height; j += 1) {
      const idx = i + (j * croppedGreyscale.bitmap.width * 4);
      const red = croppedGreyscale.bitmap.data[idx + 0];
      const green = croppedGreyscale.bitmap.data[idx + 1];
      const blue = croppedGreyscale.bitmap.data[idx + 2];
      const isWhite = (red > 222 && green > 222 && blue > 222);
      if (isWhite) {
        if (j < mostTopWhitePixelIndex) {
          mostTopWhitePixelIndex = j;
        }
        if (j > mostBottomWhitePixelIndex) {
          mostBottomWhitePixelIndex = j;
        }
        if (i / 4 < mostLeftWhitePixelIndex) {
          mostLeftWhitePixelIndex = i / 4;
        }
        if (i / 4 > mostRigthWhitePixelIndex) {
          mostRigthWhitePixelIndex = i / 4;
        }
      }
    }
  }

  mostLeftWhitePixelIndex = mostLeftWhitePixelIndex - 4 < 0 ? 0 : mostLeftWhitePixelIndex - 4;
  mostTopWhitePixelIndex = mostTopWhitePixelIndex - 4 < 0 ? 0 : mostTopWhitePixelIndex - 4;

  mostRigthWhitePixelIndex = mostRigthWhitePixelIndex + 4 > croppedGreyscale.bitmap.width ? croppedGreyscale.bitmap.width : mostRigthWhitePixelIndex + 4;
  mostBottomWhitePixelIndex = mostBottomWhitePixelIndex + 4 > croppedGreyscale.bitmap.height ? croppedGreyscale.bitmap.height : mostBottomWhitePixelIndex + 4;


  logger.info('mostLeftWhitePixelIndex', mostLeftWhitePixelIndex);
  logger.info('mostTopWhitePixelIndex', mostTopWhitePixelIndex);
  logger.info('mostRigthWhitePixelIndex', mostRigthWhitePixelIndex);
  logger.info('mostBottomWhitePixelIndex', mostBottomWhitePixelIndex);

  return {
    mostLeftWhitePixelIndex,
    mostTopWhitePixelIndex,
    mostRigthWhitePixelIndex,
    mostBottomWhitePixelIndex,
  };
}

async function saveFileLocally(image, userId) {
  function cropNonWhiteBorder(imag) {
    function isWhitePixel(red, green, blue) {
      return red > 145 && blue > 145 && green > 145;
    }
    function getFirstRowIsMostlyWhite(img) {
      const { data, width } = img.bitmap;
      let firstRowWhiteCounter = 0;
      for (let i = 0; i < width * 4; i += 4) {
        const red = data[i + 0];
        const green = data[i + 1];
        const blue = data[i + 2];
        const isWhite = isWhitePixel(red, green, blue);
        if (isWhite) {
          firstRowWhiteCounter += 1;
        }
      }
      return (firstRowWhiteCounter >= (width / 2));
    }
    function getRightColumnIsMostlyWhite(img) {
      const { data, width, height } = img.bitmap;
      let rightColumnWhiteCounter = 0;
      for (let i = width * 4; i < data.length; i += (width * 4)) {
        const red = data[i - 4];
        const green = data[i - 3];
        const blue = data[i - 2];
        const isWhite = isWhitePixel(red, green, blue);
        if (isWhite) {
          rightColumnWhiteCounter += 1;
        }
      }
      return (rightColumnWhiteCounter >= (height / 2));
    }
    function getLastRowIsMostlyWhite(img) {
      const { data, width, height } = img.bitmap;
      let lastRowWhiteCounter = 0;
      for (let i = ((height - 1) * (width * 4)); i < ((height) * (width * 4)); i += 4) {
        const red = data[i + 0];
        const green = data[i + 1];
        const blue = data[i + 2];
        const isWhite = isWhitePixel(red, green, blue);
        if (isWhite) {
          lastRowWhiteCounter += 1;
        }
      }
      return (lastRowWhiteCounter >= (width / 2));
    }
    function getLeftColumnIsMostlyWhite(img) {
      const { data, width, height } = img.bitmap;
      let leftColumnWhiteCounter = 0;
      for (let i = 0; i < data.length; i += (width * 4)) {
        const red = data[i + 0];
        const green = data[i + 1];
        const blue = data[i + 2];
        const isWhite = isWhitePixel(red, green, blue);
        if (isWhite) {
          leftColumnWhiteCounter += 1;
        }
      }
      return (leftColumnWhiteCounter >= (height / 2));
    }

    const { width, height } = imag.bitmap;
    if (width < 20 || height < 20) {
      return imag;
    }
    const cropStepSize = 10;
    if (!getFirstRowIsMostlyWhite(imag)) {
      const newImage = imag.clone().crop(0, cropStepSize, width, height - cropStepSize);
      return cropNonWhiteBorder(newImage);
    }
    if (!getRightColumnIsMostlyWhite(imag)) {
      const newImage = imag.clone().crop(0, 0, width - cropStepSize, height);
      return cropNonWhiteBorder(newImage);
    }
    if (!getLastRowIsMostlyWhite(imag)) {
      const newImage = imag.clone().crop(0, 0, width, height - cropStepSize);
      return cropNonWhiteBorder(newImage);
    }
    if (!getLeftColumnIsMostlyWhite(imag)) {
      const newImage = imag.clone().crop(cropStepSize, 0, width - cropStepSize, height);
      return cropNonWhiteBorder(newImage);
    }
    return imag;
  }


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

  const fileName = `output/${userId}_image.${type}`;
  await save(fileName, base64Data);


  try {
    const originalImage = await Jimp.read(fileName);
    const originalImageWithFirstCrop = cropNonWhiteBorder(originalImage).write(fileName);
    originalImageWithFirstCrop.brightness(0.3).contrast(0.8).write(`output/${userId}_image_cropped.${type}`);
    const croppedImage = await Image.load(`output/${userId}_image_cropped.${type}`);
    const greyCroppedImage = croppedImage.grey();
    await (cannyEdgeDetector(greyCroppedImage).save(`output/${userId}croppedGreyscale.png`));
    const croppedGreyscale = await Jimp.read(`output/${userId}croppedGreyscale.png`);

    const {
      mostLeftWhitePixelIndex,
      mostTopWhitePixelIndex,
      mostRigthWhitePixelIndex,
      mostBottomWhitePixelIndex,
    } = getCropDimentions(croppedGreyscale);

    const result = await Jimp.read(fileName);
    logger.info('result image size:', result.bitmap.width, 'x', result.bitmap.height);
    return result.crop(mostLeftWhitePixelIndex,
      mostTopWhitePixelIndex,
      mostRigthWhitePixelIndex - mostLeftWhitePixelIndex,
      mostBottomWhitePixelIndex - mostTopWhitePixelIndex).write('output/croppedAfter.png');
  } catch (e) {
    return Jimp.read(fileName);
  }
}


async function getPlayerStackSizeFromImage(image, userId, baseChipColor, numberOfBaseChips) {
  const start = (new Date()).getTime();
  const newImage = await saveFileLocally(image, userId);
  const returnImage = await newImage.getBase64Async(Jimp.MIME_PNG);
  const { stack, info } = await getImageData(newImage, userId, baseChipColor, numberOfBaseChips);
  const end = (new Date()).getTime();
  logger.info('finished in:', end - start, 'milli');
  return {
    info,
    stack,
    image: returnImage,
  };
}

async function resetPlayerBaseChipCount(userId) {
  existingData[userId] = null;
  return {};
}

module.exports = {
  getPlayerStackSizeFromImage,
  resetPlayerBaseChipCount,
};
