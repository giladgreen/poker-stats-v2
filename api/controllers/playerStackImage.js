const playerStackImageService = require('../services/playerStackImage');

function getPlayerStackSizeFromImage(req, res, next) {
  const { userContext: { id: userId } } = req;
  const { image, baseChipColor, numberOfBaseChips } = req.getBody();
  playerStackImageService.getPlayerStackSizeFromImage(image, userId, baseChipColor, numberOfBaseChips)
    .then(({ info, stack }) => {
      res.send({ info, stack });
    })
    .catch(next);
}

function resetPlayerBaseChipCount(req, res, next) {
  const { userContext: { id: userId } } = req;
  playerStackImageService.resetPlayerBaseChipCount(userId)
    .then(() => {
      res.send({ status: 'ok' });
    })
    .catch(next);
}

module.exports = {
  getPlayerStackSizeFromImage,
  resetPlayerBaseChipCount,
};
