const { notFound } = require('boom');
const models = require('../models');
const gameAttributes = ['id', 'description', 'date', 'groupId', 'createdAt'];
const gameDataAttributes = ['playerId', 'buyIn', 'cashOut', 'updatedAt'];

const defaultValues = {
    description: '-',
    date: (new Date()).toISOString(),
};

async function getGame({ groupId, gameId }) {
    const gameData = await models.games.findOne({
        where: {
            groupId,
            id: gameId,
        },
        attributes: gameAttributes
    });
    if (!gameData) {
        throw notFound("game not found", { groupId, gameId });
    }
    const game = gameData.toJSON();
    game.playersData = (await models.gamesData.findAll({
        where: {
            groupId,
            gameId
        },
        attributes: gameDataAttributes,
    })).map(data=>data.toJSON());
    return game;
}

async function getGames(groupId) {
    const allGames = await models.games.findAll({
        where: {
            groupId,
        },
        attributes: gameAttributes
    });
    return allGames.map(game => game.toJSON());
}

async function createGame(groupId, data) {

    const newGameData = { ...defaultValues, ...data, groupId};

    const newGame = await models.games.create(newGameData);
    return getGame({ groupId, gameId: newGame.id });
}

async function updateGame(groupId, gameId, data) {
    await getGame({ groupId, gameId });

    const { playersData } = data;

    await models.games.update(data, {
        where:{
            groupId,
            id: gameId
        }
    });
    if (playersData) {
        await models.gamesData.destroy({
            where:{
                groupId,
                gameId
            },
            paranoid: false
        });

        await Promise.all(playersData.map(playerData => models.gamesData.create({ ...playerData, gameId, groupId })));
    }

    return getGame({ groupId, gameId });
}

function deleteGame(groupId, gameId) {
    return models.games.destroy({
        where:{
            groupId,
            id: gameId
        }
    });
}

module.exports = {
    createGame,
    getGame,
    getGames,
    updateGame,
    deleteGame
};
