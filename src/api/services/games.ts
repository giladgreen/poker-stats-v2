/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import { notFound, unauthorized } from 'boom';

import moment from 'moment';
import Models from '../models';
import notifications from './notifications';
import gameHelper from '../helpers/game';
import logger from './logger';
import {UserContext} from "../../types/declerations";

const gameAttributes = ['id', 'description', 'date', 'ready', 'groupId', 'createdAt'];
const gameDataAttributes = ['playerId', 'buyIn', 'cashOut', 'index', 'updatedAt', 'extra'];

const GILAD_USER_ID = 'e7659c43-a0fe-449b-85cd-33d561d74995';

const defaultValues = {
  description: '',
  date: (new Date()).toISOString(),
};

async function getGame({ groupId, gameId }: { groupId:string|undefined, gameId:string|undefined}) {
  // @ts-ignore
  const gameData = await Models.games.findOne({
    where: {
      groupId,
      id: gameId,
    },
    attributes: gameAttributes,
  });
  if (!gameData) {
    throw notFound('game not found', { groupId, gameId });
  }
  const game = gameData.toJSON();
  // @ts-ignore
  game.playersData = (await Models.gamesData.findAll({
    where: {
      groupId,
      gameId,
    },
    attributes: gameDataAttributes,
    order: [['index', 'ASC'], ['createdAt', 'ASC']],
  })).map((data:any) => data.toJSON());
  return game;
}
function isGameReady(game:any) {
  const totalBuyIn = game.playersData.map((pd:any) => pd.buyIn).reduce((total:number, num:number) => total + num, 0);
  const totalCashOut = game.playersData.map((pd:any) => pd.cashOut).reduce((total:number, num:number) => total + num, 0);
  const diff = totalBuyIn - totalCashOut;
  return diff === 0 && game.playersData.length > 1;
}

async function getGames(groupId:string|undefined, limit:number|undefined = 1000, offset:number|undefined = 0) {
  // @ts-ignore
  const allCount = await Models.games.count({ where: { groupId } });
  // @ts-ignore
  const allGames = await Models.games.findAll({
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    include: [{
      // @ts-ignore
      model: Models.gamesData,
      as: 'playersData',
      required: false,
      where: {
        groupId,
      },
    }],
    where: {
      groupId,
    },
    attributes: gameAttributes,
  });

  const results = allGames.map((game:any) => game.toJSON()).map((game:any) => {
    game.description = game.description || '';
    game.ready = isGameReady(game);
    if (game.ready) {
      game.mvpPlayerId = game.playersData.map((data:any) => ({ playerId: data.playerId, bottomLine: data.cashOut - data.buyIn }))
        .reduce((a:any, b:any) => (a.bottomLine > b.bottomLine ? a : (a.bottomLine < b.bottomLine ? b : (a.buyIn < b.buyIn ? a : b)))).playerId;
    }
    return game;
  });

  return {
    metadata: {
      totalResults: allCount,
      count: allGames.length,
      limit,
      offset,
    },
    results,
  };
}

async function createGame(groupId:string|undefined, data:any) {
  const { playersData } = data;
  const ready = gameHelper.isGameReady(playersData);
  const date = moment(new Date(`${data.date}`.substr(0, 10))).add(12, 'hours').toDate();

  const newGameData = {
    ...defaultValues, ...data, ready, groupId, date,
  };
  delete newGameData.playersData;
  // @ts-ignore
  const newGame = await Models.games.create(newGameData);
  if (playersData) {
    // @ts-ignore
    await Promise.all(playersData.map((playerData:any, index:number) => Models.gamesData.create({
      ...playerData, index, gameId: newGame.id, groupId, extra: { cashOuts: [], buyIns: [{ time: new Date(), amount: playerData.buyIn }] },
    })));
  }

  return getGame({ groupId, gameId: newGame.id });
}
async function validateUserCanEditGame(groupId:string|undefined, gameId:string|undefined, isAdmin:boolean) {
  // @ts-ignore
  const existingGame = await Models.gamesData.findOne({
    where: {
      groupId,
      gameId,
    },
  });
  if (existingGame) {
    const { ready } = existingGame;
    if (ready && !isAdmin) {
      throw unauthorized('user not admin of group');
    }
  }
}
async function updateGame(userContext: UserContext, groupId: string|undefined, gameId: string|undefined, data:any) {
  await validateUserCanEditGame(groupId, gameId, userContext.isAdmin);
  await getGame({ groupId, gameId });
  const date = moment(new Date(`${data.date}`.substr(0, 10))).add(12, 'hours').toDate();
  // @ts-ignore
  const existingData = await Models.gamesData.findAll({
    where: {
      groupId,
      gameId,
    },
  });
  // @ts-ignore
  await Models.gamesData.destroy({
    where: {
      groupId,
      gameId,
    },
    paranoid: false,
  });

  const updateData = { ...data };
  const { playersData } = updateData;
  const ready = gameHelper.isGameReady(playersData);
  delete updateData.playersData;
  // @ts-ignore
  await Models.games.update({ ...data, date, ready }, {
    where: {
      groupId,
      id: gameId,
    },
  });
  if (playersData) {
    await Promise.all(playersData.map((playerData:any, index:number) => {
      const currentPlayerData = existingData.find((d:any) => d.playerId === playerData.playerId);
      const extra = {
        buyIns: [],
        cashOuts: [],
      };
      let buyInSum = 0;
      if (currentPlayerData && currentPlayerData.extra && currentPlayerData.extra.buyIns) {
        currentPlayerData.extra.buyIns.forEach((bi:any) => {
          // @ts-ignore
          extra.buyIns.push(bi);
          buyInSum += bi.amount;
        });
      }
      let cashOutSum = 0;
      if (currentPlayerData && currentPlayerData.extra && currentPlayerData.extra.cashOuts) {
        currentPlayerData.extra.cashOuts.forEach((co:any) => {
          // @ts-ignore
          extra.cashOuts.push(co);
          cashOutSum += co.amount;
        });
      }
      if (playerData.buyIn - buyInSum > 0) {
        // @ts-ignore
        extra.buyIns.push({ time: new Date(), amount: playerData.buyIn - buyInSum });
      }

      if (playerData.cashOut - cashOutSum > 0) {
        // @ts-ignore
        extra.cashOuts.push({ time: new Date(), amount: playerData.cashOut - cashOutSum });
      }
      // @ts-ignore
      return Models.gamesData.create({
        ...playerData, index, gameId, groupId, extra,
      });
    }));
  }

  const game = await getGame({ groupId, gameId });
  if (ready) {
    try {
      const mvpPlayerId = game.playersData.map((pdata:any) => ({ playerId: pdata.playerId, bottomLine: pdata.cashOut - pdata.buyIn }))
        .reduce((a:any, b:any) => (a.bottomLine > b.bottomLine ? a : (a.bottomLine < b.bottomLine ? b : (a.buyIn < b.buyIn ? a : b)))).playerId;
      let mvpPlayer;
      if (mvpPlayerId) {
        // @ts-ignore
        mvpPlayer = await Models.players.findOne({
          where: {
            groupId,
            id: mvpPlayerId,
          },
        });
      }
      const text = mvpPlayer ? `MVP: ${mvpPlayer.name}` : 'Game is done';
      const link = mvpPlayer ? mvpPlayer.imageUrl : 'https://www.poker-stats.com/';

      notifications.sendNotification(GILAD_USER_ID, 'Game Updated', link, text);
    } catch (e) {
      logger.error('error sending update game notification', e.message, e.stack);
    }
  }

  return game;
}

async function deleteGame(userContext:UserContext, groupId:string|undefined, gameId:string|undefined) {
  await validateUserCanEditGame(groupId, gameId, userContext.isAdmin);
  // @ts-ignore
  await Models.gamesData.destroy({
    where: {
      groupId,
      gameId,
    },
    paranoid: false,
  });
  // @ts-ignore
  return Models.games.destroy({
    where: {
      groupId,
      id: gameId,
    },
  });
}

export default {
  createGame,
  getGame,
  getGames,
  updateGame,
  deleteGame,
};
