const { badRequest, forbidden } = require('boom');

const models = require('../models');

async function deleteImage(userContext, imageId) {
  if (!userContext || !userContext.id) {
    throw badRequest('missing user id');
  }
  if (!imageId) {
    throw badRequest('missing imageId');
  }

  const image = await models.images.findOne({ where: { id: imageId } });
  if (!image) {
    throw badRequest('image not found');
  }
  if (image.uploadedBy !== userContext.id) {
    throw forbidden('only the user that uploaded the image can remove it');
  }

  await models.tags.destroy({ where: { imageId } });
  await models.images.destroy({ where: { id: imageId } });
  return {
    status: 'image was removed',
  };
}

async function addImage(userContext, image, playerIds, gameIds, groupIds) {
  if (!userContext || !userContext.id) {
    throw badRequest('missing user id');
  }
  if (!image) {
    throw badRequest('missing image data');
  }
  if ((!playerIds || playerIds.length === 0) && (!gameIds || gameIds.length === 0) && (!groupIds || groupIds.length === 0)) {
    throw badRequest('must supply at least one (non empty array) of:  "playerIds" / "gameIds" / "groupIds"');
  }
  groupIds = groupIds || [];
  gameIds = gameIds || [];
  playerIds = playerIds || [];
  const groups = await Promise.all(groupIds.map(groupId => models.groups.findOne({ where: { id: groupId } })));
  const games = await Promise.all(gameIds.map(gameId => models.games.findOne({ where: { id: gameId } })));
  const players = await Promise.all(playerIds.map(playerId => models.players.findOne({ where: { id: playerId } })));

  if (groupIds.length > 0 && groups.filter(group => group === null).length > 0) {
    throw badRequest('group not found', { groupIds });
  }

  if (gameIds.length > 0 && games.filter(game => game === null).length > 0) {
    throw badRequest('game not found', { gameIds });
  }

  if (playerIds.length > 0 && players.filter(player => player === null).length > 0) {
    throw badRequest('player not found', { playerIds });
  }

  const { id: imageId } = await models.images.create({ image, uploadedBy: userContext.id });

  await Promise.all(groupIds.map(groupId => models.tags.create({ imageId, groupId })));
  await Promise.all(gameIds.map(gameId => models.tags.create({ imageId, gameId })));
  await Promise.all(playerIds.map(playerId => models.tags.create({ imageId, playerId })));

  return {
    imageId,
    image,
    playerIds,
    gameIds,
    groupIds,
  };
}

module.exports = {
  addImage,
  deleteImage,
};
