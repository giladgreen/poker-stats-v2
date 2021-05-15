import { badRequest, forbidden } from'boom';
import Cloudinary from '../helpers/cloudinary';
import Models from'../models';
import {UserContext} from "../../types/declerations";
import logger from './logger';

const { Op } = Models.Sequelize;

async function deleteImage(userContext:UserContext, imageId:string) {
  if (!userContext || !userContext.id) {
    throw badRequest('missing user id');
  }
  if (!imageId) {
    throw badRequest('missing imageId');
  }
// @ts-ignore
  const image = await Models.images.findOne({ where: { id: imageId } });
  if (!image) {
    throw badRequest('image not found');
  }
  if (image.uploadedBy !== userContext.id && !userContext.isAdmin) {
    throw forbidden('only the user that uploaded the image can remove it');
  }
// @ts-ignore
  await Models.tags.destroy({ where: { imageId } });
  // @ts-ignore
  await Models.images.destroy({ where: { id: imageId } });
  if (image.publicId) {
    Cloudinary.delete(image.publicId);
  }

  return {
    status: 'image was removed',
  };
}

async function getImages({ playerIds, gameIds, groupIds }: { playerIds:string[], gameIds:string[], groupIds:string[] }) {
  if ((!playerIds || playerIds.length === 0) && (!gameIds || gameIds.length === 0) && (!groupIds || groupIds.length === 0)) {
    throw badRequest('must supply at least one (non empty array) of:  "playerIds" / "gameIds" / "groupIds"');
  }
  groupIds = groupIds || [];
  gameIds = gameIds || [];
  playerIds = playerIds || [];
// @ts-ignore
  const tags = await Models.tags.findAll({
    where: {
      [Op.or]: [
        {
          playerId: {
            [Op.in]: playerIds,
          },
        },
        {
          gameId: {
            [Op.in]: gameIds,
          },
        },
        {
          groupId: {
            [Op.in]: groupIds,
          },
        },
      ],
    },
  });

  const imageIds = tags.map((tag:any) => tag.imageId);
  // @ts-ignore
  const allTags = await Models.tags.findAll({
    where: {
      imageId: {
        [Op.in]: imageIds,
      },
    },
  });
// @ts-ignore
  const images = await Models.images.findAll({
    order: [['createdAt', 'ASC']],
    where: {
      id: {
        [Op.in]: imageIds,
      },
    },
  });
// @ts-ignore
  const users = await Models.users.findAll({
    where: {
      id: {
        [Op.in]: images.map((imageDbObject:any) => imageDbObject.uploadedBy),
      },
    },
  });

  return images.map((imageDbObject:any) => {
    const imageId = imageDbObject.id;
    const imageTags = allTags.filter((tag:any) => tag.imageId === imageId);
    const imageGroupIds = [...new Set(imageTags.filter((tag:any) => tag.groupId !== null).map((tag:any) => tag.groupId))];
    const imageGameIds = [...new Set(imageTags.filter((tag:any) => tag.gameId !== null).map((tag:any) => tag.gameId))];
    const imagePlayerIds = [...new Set(imageTags.filter((tag:any) => tag.playerId !== null).map((tag:any) => tag.playerId))];

    const uploadedByUser = users.find((user:any) => user.id === imageDbObject.uploadedBy);
    const uploadedByName = uploadedByUser ? `${uploadedByUser.firstName} ${uploadedByUser.familyName}` : 'unknown';
    return {
      id: imageId,
      uploadedByName,
      uploadedById: imageDbObject.uploadedBy,
      image: imageDbObject.image,
      groupIds: imageGroupIds,
      gameIds: imageGameIds,
      playerIds: imagePlayerIds,
    };
  });
}

async function addImage(userContext:UserContext, image:any, playerIds:string[], gameIds:string[], groupIds:string[], playerImage:any) {
  if (!userContext || !userContext.id) {
    throw badRequest('missing user id');
  }
  if (!image) {
    throw badRequest('missing image data');
  }
  if (!playerImage && (!playerIds || playerIds.length === 0) && (!gameIds || gameIds.length === 0) && (!groupIds || groupIds.length === 0)) {
    throw badRequest('must supply at least one (non empty array) of:  "playerIds" / "gameIds" / "groupIds"');
  }
  groupIds = groupIds || [];
  gameIds = gameIds || [];
  playerIds = playerIds || [];
  // @ts-ignore
  const groups = await Promise.all(groupIds.map(groupId => Models.groups.findOne({ where: { id: groupId } })));
  // @ts-ignore
  const games = await Promise.all(gameIds.map(gameId => Models.games.findOne({ where: { id: gameId } })));
  // @ts-ignore
  const players = await Promise.all(playerIds.map(playerId => Models.players.findOne({ where: { id: playerId } })));

  if (groupIds.length > 0 && groups.filter(group => group === null).length > 0) {
    throw badRequest('group not found', { groupIds });
  }

  if (gameIds.length > 0 && games.filter(game => game === null).length > 0) {
    throw badRequest('game not found', { gameIds });
  }

  if (playerIds.length > 0 && players.filter(player => player === null).length > 0) {
    throw badRequest('player not found', { playerIds });
  }
// @ts-ignore
  const { url, publicId } = await Cloudinary.upload(image);
  let imageId: string = '';
  if (!playerImage) {
    logger.info('NOT playerImage, about to insert to image db, url:',url,'publicId:',publicId)
    // @ts-ignore
    imageId = (await Models.images.create({ image: url, publicId, uploadedBy: userContext.id })).id;
  } else{
    logger.info('playerImage, about to insert to image db, url:',url,'publicId:',publicId)
  }
  logger.info(`imageId: ${imageId}`)
// @ts-ignore
  await Promise.all(groupIds.map(groupId => Models.tags.create({ imageId, groupId })));
  // @ts-ignore
  await Promise.all(gameIds.map(gameId => Models.tags.create({ imageId, gameId })));
  // @ts-ignore
  await Promise.all(playerIds.map(playerId => Models.tags.create({ imageId, playerId })));
// @ts-ignore
  const user = await Models.users.findOne({
    where: {
      id: userContext.id,
    },
  });


  return {
    uploadedById: userContext.id,
    uploadedByName: user ? `${user.firstName} ${user.familyName}` : 'unknown',
    // @ts-ignore
    imageId,
    image: url,
    playerIds,
    gameIds,
    groupIds,
  };
}

export default {
  addImage,
  deleteImage,
  getImages,
};
