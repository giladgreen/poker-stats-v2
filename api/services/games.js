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

module.exports = {
    getGame,
    getGames,
    createGame
};
