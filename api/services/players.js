const { notFound } = require('boom');
const { players } = require('../models');
const attributes = ['id', 'firstName', 'familyName', 'phone', 'email', 'imageUrl', 'birthday', 'groupId'];
const defaultValues = {
    phone: '-',
    email: '-',
    imageUrl: 'anonymous',
    birthday: (new Date()).toISOString(),
}
async function getPlayer({ groupId, playerId }) {
    const player = await players.findOne({
        where: {
            groupId: groupId,
            id: playerId,
        },
        attributes
    });
    if (!player) {
        throw notFound("player not found", { groupId, playerId });
    }
    return player.toJSON();
}

async function getPlayers(groupId) {
    const allPlayers = await players.findAll({
        where: {
            groupId: groupId,
        },
        attributes
    });
    return allPlayers.map(player => player.toJSON());
}

async function createPlayer(groupId, data) {

    const newPlayerData = { ...defaultValues, ...data, groupId};

    const newPlayer = await players.create(newPlayerData);
    return getPlayer({ groupId, playerId: newPlayer.id });
}

module.exports = {
    getPlayer,
    getPlayers,
    createPlayer
};
