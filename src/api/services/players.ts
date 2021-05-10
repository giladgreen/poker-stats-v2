import { notFound, badRequest } from 'boom';
import Models from '../models';

const attributes = ['id', 'name', 'email', 'groupId', 'createdAt', 'imageUrl', 'videoUrl'];
const defaultValues = {
  email: '',
};

async function getPlayer({ groupId, playerId }: { groupId:string, playerId:string }) {
  // @ts-ignore
  const player = await Models.players.findOne({
    where: {
      groupId,
      id: playerId,
    },
    attributes,
  });
  if (!player) {
    throw notFound('player not found', { groupId, playerId });
  }
  return player.toJSON();
}

async function getPlayers(groupId:string, userId:string, limit = 1000, offset = 0) {
  // @ts-ignore
  const allCount = await Models.players.count();
  // @ts-ignore
  const allPlayers = await Models.players.findAll({
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    where: {
      groupId,
    },
    attributes,
  });
  // @ts-ignore
  const usersPlayers = await Models.usersPlayers.findAll({
    where: {
      groupId,
    },
  });
  const results = await Promise.all(allPlayers.map(async (p:any) => {
    const player = p.toJSON();
    const userPlayer = usersPlayers.find((us:any) => us.playerId === player.id);
    if (userPlayer) {
      // eslint-disable-next-line  no-await-in-loop
      // @ts-ignore
      const user = await Models.users.findOne({
        where: {
          id: userPlayer.userId,
        },
      });
      if (user) {
        player.email = user.email || player.email;
        player.imageUrl = player.imageUrl || user.imageUrl;
        player.videoUrl = player.videoUrl || user.videoUrl;
        player.firstName = user.firstName;
        player.familyName = user.familyName;
        player.name = player.name || `${user.firstName} ${user.familyName}`;
        player.userConnected = true;
        player.isMe = user.id === userId;
      }
    }

    return player;
  }));
  return {
    metadata: {
      totalResults: allCount,
      count: allPlayers.length,
      limit,
      offset,
    },
    results,
  };
}

function getPlayerByName(groupId:string, name:string) {
  // @ts-ignore
  return Models.players.findOne({
    where: {
      name,
      groupId,
    },
  });
}

async function createPlayer(groupId:string, data:any) {
  let existingPlayer = await getPlayerByName(groupId, data.name);
  while (existingPlayer) {
    data.name = `${data.name}*`;
    // eslint-disable-next-line  no-await-in-loop
    existingPlayer = await getPlayerByName(groupId, data.name);
  }

  const newPlayerData = { ...defaultValues, ...data, groupId };
  // @ts-ignore
  const newPlayer = await Models.players.create(newPlayerData);
  return getPlayer({ groupId, playerId: newPlayer.id });
}

async function updatePlayer(groupId:string, playerId:string, data:any) {
  await getPlayer({ groupId, playerId });
  // @ts-ignore
  await Models.players.update(data, {
    where: {
      groupId,
      id: playerId,
    },
  });
  return getPlayer({ groupId, playerId });
}

async function deletePlayer(groupId:string, userId:string, playerId:string) {
  // make sure not to delete yourself:
  // @ts-ignore
  const userPlayer = await Models.usersPlayers.findOne({
    where: {
      groupId,
      userId,
      playerId,
    },
  });
  if (userPlayer) {
    throw badRequest('you can not delete yourself.', { groupId, userId, playerId });
  }

  // make sure player is not in any existing game:
  // @ts-ignore
  const gamesCount = await Models.gamesData.count({
    where: {
      groupId,
      playerId,
    },
  });
  if (gamesCount > 0) {
    throw badRequest('you can not delete player, remove it from existing games first.', { groupId, playerId, gamesCount });
  }
  // @ts-ignore
  await Models.usersPlayers.destroy({
    where: {
      groupId,
      playerId,
    },
  });
  // @ts-ignore
  return Models.players.destroy({
    where: {
      groupId,
      id: playerId,
    },
  });
}

export default  {
  getPlayer,
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
