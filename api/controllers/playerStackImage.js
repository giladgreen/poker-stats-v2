const pixels = require('image-pixels');

async function doSomthing(image) {
  try {
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
    }
    if (png || jpg || jpeg || bmp) {
      base64Data = base64Data.replace(/^data:image\/png;base64,/, '');
      base64Data = base64Data.replace(/^data:image\/jpg;base64,/, '');
      base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, '');
      base64Data = base64Data.replace(/^data:image\/bmp;base64,/, '');
    }
    const { data, width, height } = await pixels(base64Data, type);
    // data is an array of numbers (0-255), every 4 represent one pixel in the image

    return {
      dimentions: `${width} x ${height}`,
      data: data.slice(0, 30).join(),
      stack: `data.length: ${data.length}`,
    };
  } catch (e) {
    throw e.message;
  }
}

function getplayerStackImage(req, res, next) {
  const { image } = req.getBody();
  doSomthing(image)
    .then(({ dimentions, data, stack }) => {
      res.send({ dimentions, data, stack });
    })
    .catch(next);
}

module.exports = {
  getplayerStackImage,
};
