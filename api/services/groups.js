const { notFound } = require('boom');
const models = require('../models');
const attributes = ['id', 'name', 'createdAt'];

async function getGroup(groupId) {
    const group = await models.groups.findOne({
        include: [{
            model: models.players,
            as: 'players',
            required: false,
            where: {
                groupId
            }
        }, {
            model: models.games,
            as: 'games',
            required: false,
            where: {
                groupId
            },
        }],
        where: {
            id: groupId
        },
        attributes
    });
    if (!group) {
        throw notFound("group not found", { groupId });
    }
    return group.toJSON();
}

async function getGroups() {
    const allGroups = await models.groups.findAll({ attributes });
    return allGroups.map(group => group.toJSON());
}

async function createGroup(data) {
    const newGroup = await models.groups.create(data);
    return getGroup(newGroup.id);
}

module.exports = {
    getGroup,
    getGroups,
    createGroup
};
