const { handleIncomingData } = require('../services/playerStackImage');

function getPlayerStackSizeFromImage(req, res, next) {
  const { userContext: { id: userId } } = req;
  const { image } = req.getBody();
  handleIncomingData(image, userId)
    .then(({ info, stack }) => {
      res.send({ info, stack });
    })
    .catch(next);
}

module.exports = {
  getPlayerStackSizeFromImage,
};
